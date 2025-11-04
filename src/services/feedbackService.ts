/**
 * Service de gestion des feedbacks utilisateur
 * 
 * Fonctionnalités:
 * - Stockage local dans localStorage (max 500 feedbacks)
 * - ID utilisateur anonyme persistant (crypto.randomUUID)
 * - Sync asynchrone vers Vercel Edge Function (fire-and-forget)
 * - Rate limiting (1 req/sec max)
 * - Fusion stats locales + globales
 */

import type { QuestionFeedback, FeedbackStats, LocalFeedbackStorage } from '../types/feedback';

const STORAGE_KEY = 'iade_feedbacks_v1';
const USER_ID_KEY = 'iade_user_id';
const MAX_FEEDBACKS = 500;
const RATE_LIMIT_MS = 1000; // 1 feedback/sec max
const SYNC_TIMEOUT_MS = 3000; // 3s timeout pour API

// ============================================================================
// GÉNÉRATION ID UTILISATEUR ANONYME
// ============================================================================

/**
 * Génère ou récupère un ID utilisateur anonyme persistant
 * Utilise crypto.randomUUID() pour garantir l'unicité
 */
export function getOrCreateAnonUserId(): string {
  const existing = localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;
  
  const id = crypto.randomUUID();
  localStorage.setItem(USER_ID_KEY, id);
  return id;
}

// ============================================================================
// SERVICE DE FEEDBACK
// ============================================================================

class FeedbackService {
  private lastSyncTime = 0;

  /**
   * Sauvegarder un feedback localement
   * Déclenche automatiquement une sync asynchrone vers le serveur
   */
  saveFeedback(feedback: QuestionFeedback): void {
    const storage = this.getStorage();
    
    // Ajouter le feedback
    storage.feedbacks.push(feedback);
    
    // Garder uniquement les 500 derniers
    if (storage.feedbacks.length > MAX_FEEDBACKS) {
      storage.feedbacks = storage.feedbacks.slice(-MAX_FEEDBACKS);
    }
    
    // Sauvegarder
    this.saveStorage(storage);
    
    // Sync asynchrone vers serveur (fire-and-forget)
    this.syncToServer(feedback);
  }

  /**
   * Récupérer tous les feedbacks locaux
   */
  getAll(): QuestionFeedback[] {
    return this.getStorage().feedbacks;
  }

  /**
   * Récupérer les feedbacks pour une question spécifique
   */
  getFeedbacksForQuestion(questionId: string): QuestionFeedback[] {
    return this.getAll().filter(f => f.questionId === questionId);
  }

  /**
   * Calculer la moyenne des ratings locaux pour une question
   */
  getAverageRatingLocal(questionId: string): number {
    const feedbacks = this.getFeedbacksForQuestion(questionId);
    if (feedbacks.length === 0) return 0;
    
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return sum / feedbacks.length;
  }

  /**
   * Récupérer le rating de l'utilisateur pour une question
   */
  getUserRating(questionId: string): 1 | 2 | 3 | null {
    const userId = getOrCreateAnonUserId();
    const userFeedback = this.getAll()
      .filter(f => f.questionId === questionId && f.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp)[0]; // Plus récent
    
    return userFeedback ? userFeedback.rating : null;
  }

  /**
   * Fusionner les stats locales + globales (API)
   * Si l'API est down, retourne uniquement les stats locales
   */
  async getMergedStats(questionId: string): Promise<FeedbackStats> {
    const localAvg = this.getAverageRatingLocal(questionId);
    const localCount = this.getFeedbacksForQuestion(questionId).length;

    try {
      const endpoint = import.meta.env.VITE_API_FEEDBACK_ENDPOINT || '/api/feedback';
      const response = await fetch(`${endpoint}/stats?questionId=${questionId}`, {
        signal: AbortSignal.timeout(2000) // 2s timeout
      });

      if (!response.ok) throw new Error('API error');

      const globalStats = await response.json();

      // Pondération: 70% global, 30% local (si les deux disponibles)
      const mergedAvg = localCount > 0
        ? (globalStats.averageRating * 0.7 + localAvg * 0.3)
        : globalStats.averageRating;

      return {
        questionId,
        averageRating: mergedAvg,
        totalFeedbacks: globalStats.totalFeedbacks + localCount,
        lastUpdated: new Date().toISOString()
      };
    } catch {
      // Fallback: stats locales uniquement
      return {
        questionId,
        averageRating: localAvg,
        totalFeedbacks: localCount,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Récupérer les stats pour toutes les questions
   * Utilise uniquement le cache local pour performance
   */
  getAllFeedbackStats(): Map<string, FeedbackStats> {
    const statsMap = new Map<string, FeedbackStats>();
    const feedbacks = this.getAll();
    
    // Grouper par questionId
    const grouped = feedbacks.reduce((acc, f) => {
      if (!acc[f.questionId]) acc[f.questionId] = [];
      acc[f.questionId].push(f);
      return acc;
    }, {} as Record<string, QuestionFeedback[]>);

    // Calculer stats pour chaque question
    Object.entries(grouped).forEach(([questionId, items]) => {
      const sum = items.reduce((acc, f) => acc + f.rating, 0);
      statsMap.set(questionId, {
        questionId,
        averageRating: sum / items.length,
        totalFeedbacks: items.length,
        lastUpdated: new Date().toISOString()
      });
    });

    return statsMap;
  }

  /**
   * Sync asynchrone vers le serveur
   * Fire-and-forget avec rate limiting et timeout
   */
  private async syncToServer(feedback: QuestionFeedback): Promise<void> {
    const now = Date.now();
    
    // Rate limiting
    if (now - this.lastSyncTime < RATE_LIMIT_MS) {
      return;
    }
    
    this.lastSyncTime = now;

    // Fire-and-forget avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT_MS);

    try {
      const endpoint = import.meta.env.VITE_API_FEEDBACK_ENDPOINT || '/api/feedback';
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback),
        signal: controller.signal
      });

      // Marquer comme synced
      const storage = this.getStorage();
      storage.lastSyncAt = now;
      this.saveStorage(storage);
    } catch (error) {
      // Silencieux - pas de blocage UX
      console.debug('Feedback sync failed (non-blocking):', error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Charger le storage local
   */
  private getStorage(): LocalFeedbackStorage {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }

    return {
      userId: getOrCreateAnonUserId(),
      feedbacks: [],
      lastSyncAt: undefined
    };
  }

  /**
   * Sauvegarder le storage local
   */
  private saveStorage(storage: LocalFeedbackStorage): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  }

  /**
   * Réinitialiser tous les feedbacks (pour tests)
   */
  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Export singleton
export const feedbackService = new FeedbackService();

