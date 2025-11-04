/**
 * Moteur adaptatif pour la sélection intelligente des questions
 * 
 * Fonctionnalités:
 * - Calcul du profil adaptatif utilisateur (accuracyRate, domainPerformance)
 * - Sélection de questions basée sur difficulté cible et domaines faibles
 * - Pondération par qualité (feedbacks) et récence
 * - Algorithme de sélection aléatoire pondéré
 */

import type { Question } from '../types/pathology';
import type { UserProfile } from '../types/user';
import type { FeedbackStats } from '../types/feedback';

export interface AdaptiveProfile {
  accuracyRate: number; // 0-1
  averageResponseTime: number; // ms
  domainPerformance: Record<string, number>; // domain -> score %
  targetDifficulty: 'easy' | 'intermediate' | 'hard';
  weakDomains: string[];
  questionsAnswered: number;
  lastUpdated: string;
}

export class AdaptiveEngine {
  /**
   * Calculer le profil adaptatif depuis le UserProfile
   */
  computeProfile(userProfile: UserProfile): AdaptiveProfile {
    const recentScores = userProfile.recentScores || [];
    
    // Calculer le taux de réussite (accuracy rate)
    let accuracyRate = 0.5; // Défaut: 50%
    if (recentScores.length > 0) {
      const totalScore = recentScores.reduce((sum, s) => sum + s.score, 0);
      accuracyRate = totalScore / (recentScores.length * 100);
    }

    // Calculer la performance par domaine
    const domainPerformance: Record<string, number> = {};
    recentScores.forEach(s => {
      if (s.theme) {
        if (!domainPerformance[s.theme]) {
          domainPerformance[s.theme] = [];
        }
        domainPerformance[s.theme].push(s.score);
      }
    });

    // Moyenne par domaine
    const domainAvg: Record<string, number> = {};
    Object.entries(domainPerformance).forEach(([domain, scores]) => {
      const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
      domainAvg[domain] = avg;
    });

    // Calculer difficulté cible
    const targetDifficulty = this.calculateTargetDifficulty(accuracyRate);

    // Identifier domaines faibles
    const weakDomains = this.identifyWeakDomains(domainAvg);

    return {
      accuracyRate,
      averageResponseTime: 0, // TODO: calculer depuis les données de session
      domainPerformance: domainAvg,
      targetDifficulty,
      weakDomains,
      questionsAnswered: userProfile.questionsSeen?.length || 0,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Calculer la difficulté cible basée sur le taux de réussite
   */
  calculateTargetDifficulty(accuracyRate: number): 'easy' | 'intermediate' | 'hard' {
    if (accuracyRate > 0.85) return 'hard';
    if (accuracyRate < 0.65) return 'easy';
    return 'intermediate';
  }

  /**
   * Identifier les domaines faibles (score < 70%)
   */
  identifyWeakDomains(domainPerf: Record<string, number>): string[] {
    return Object.entries(domainPerf)
      .filter(([_, score]) => score < 70)
      .map(([domain, _]) => domain)
      .sort((a, b) => domainPerf[a] - domainPerf[b]); // Les plus faibles en premier
  }

  /**
   * Calculer la difficulté dynamique ajustée par les feedbacks
   * Une question "facile" mal notée devient plus difficile
   */
  calculateDynamicDifficulty(question: Question, feedbackStats?: FeedbackStats): number {
    const baseDifficulty = {
      'easy': 1,
      'intermediate': 2,
      'hard': 3
    }[question.difficulty.toLowerCase()] || 2;

    if (!feedbackStats || feedbackStats.totalFeedbacks < 3) {
      return baseDifficulty;
    }

    const avgRating = feedbackStats.averageRating;
    
    // Ajuster selon rating: bad (1) augmente difficulté, very good (3) diminue
    const adjustment = (2 - avgRating) * 0.25;
    
    return Math.max(1, Math.min(3, baseDifficulty * (1 + adjustment)));
  }

  /**
   * Sélectionner la prochaine question de manière intelligente
   * 
   * Algorithme:
   * 1. Filtrer par difficulté cible (±1 niveau si pas assez)
   * 2. Prioriser domaines faibles (70% du temps)
   * 3. Exclure questions récemment vues (< 7 jours)
   * 4. Pondérer par rating moyen (favoriser rating > 2) + difficulté dynamique
   * 5. Sélection aléatoire pondérée dans le top 20%
   */
  selectNextQuestion(
    questions: Question[],
    profile: AdaptiveProfile,
    feedbacks: Map<string, FeedbackStats>,
    questionsSeen: { questionId: string; timestamp: number }[] = []
  ): Question | null {
    if (questions.length === 0) return null;

    // 1. Filtrer par difficulté (utilise difficulté dynamique ajustée)
    let filtered = questions.filter(q => {
      const feedback = feedbacks.get(q.id);
      const dynamicDiff = this.calculateDynamicDifficulty(q, feedback);
      const targetDiff = { 'easy': 1, 'intermediate': 2, 'hard': 3 }[profile.targetDifficulty] || 2;
      return Math.abs(dynamicDiff - targetDiff) <= 0.5; // Tolérance 0.5
    });
    
    // Si pas assez de questions (< 10), élargir à ±1 niveau
    if (filtered.length < 10) {
      filtered = questions.filter(q => 
        this.matchesDifficulty(q.difficulty, profile.targetDifficulty, true)
      );
    }

    // 2. Exclure questions vues récemment (< 7 jours)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlySeen = new Set(
      questionsSeen
        .filter(s => s.timestamp > sevenDaysAgo)
        .map(s => s.questionId)
    );
    filtered = filtered.filter(q => !recentlySeen.has(q.id));

    if (filtered.length === 0) {
      // Si toutes vues récemment, autoriser à nouveau
      filtered = questions.filter(q => 
        this.matchesDifficulty(q.difficulty, profile.targetDifficulty, true)
      );
    }

    // 3. Prioriser domaines faibles (70% du temps)
    const shouldFocusWeakDomain = Math.random() < 0.7;
    if (shouldFocusWeakDomain && profile.weakDomains.length > 0) {
      const weakQuestions = filtered.filter(q => 
        profile.weakDomains.some(wd => q.theme.toLowerCase().includes(wd.toLowerCase()))
      );
      if (weakQuestions.length > 0) {
        filtered = weakQuestions;
      }
    }

    // 4. Pondérer par rating (favoriser rating > 2)
    const weighted = filtered.map(q => {
      const feedback = feedbacks.get(q.id);
      let weight = 1.0;
      
      // Bonus si bien noté
      if (feedback && feedback.averageRating > 2) {
        weight *= 1.5;
      }
      // Malus si mal noté
      if (feedback && feedback.averageRating < 1.5) {
        weight *= 0.5;
      }

      return { question: q, weight };
    });

    // 5. Sélection aléatoire pondérée
    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of weighted) {
      random -= item.weight;
      if (random <= 0) {
        return item.question;
      }
    }

    // Fallback : première question
    return weighted[0]?.question || null;
  }

  /**
   * Vérifier si une difficulté correspond au profil
   */
  private matchesDifficulty(
    questionDiff: string, 
    targetDiff: string, 
    relaxed: boolean = false
  ): boolean {
    const diffMap = { easy: 1, intermediate: 2, hard: 3 };
    const qDiff = diffMap[questionDiff.toLowerCase() as keyof typeof diffMap] || 2;
    const tDiff = diffMap[targetDiff] || 2;

    if (relaxed) {
      return Math.abs(qDiff - tDiff) <= 1; // ±1 niveau
    }

    return qDiff === tDiff;
  }

  /**
   * Analyser et expliquer pourquoi une question est recommandée
   */
  explainRecommendation(
    question: Question,
    profile: AdaptiveProfile
  ): string {
    const reasons: string[] = [];

    // Difficulté adaptée
    if (question.difficulty === profile.targetDifficulty) {
      reasons.push('Difficulté adaptée à votre niveau');
    }

    // Domaine faible
    if (profile.weakDomains.some(wd => question.theme.toLowerCase().includes(wd.toLowerCase()))) {
      reasons.push(`Renforce votre domaine faible: ${question.theme}`);
    }

    // Bien notée
    reasons.push('Question de qualité validée');

    return reasons.join(' • ');
  }
}

// Export singleton
export const adaptiveEngine = new AdaptiveEngine();

