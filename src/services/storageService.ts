/**
 * Service centralisé pour la gestion du localStorage
 * Versioning, encryption légère, export/import
 */

const STORAGE_VERSION = 'v1';
const STORAGE_KEYS = {
  USER_PROFILE: `iade_user_profile_${STORAGE_VERSION}`,
  SESSIONS_HISTORY: `iade_sessions_${STORAGE_VERSION}`,
  QUESTIONS_SEEN: `iade_questions_seen_${STORAGE_VERSION}`,
  ONBOARDED: `iade_onboarded_${STORAGE_VERSION}`,
} as const;

export interface UserProfile {
  id: string;
  createdAt: string;
  lastSessionAt?: string;
  
  // Core metrics
  totalSessions: number;
  questionsSeen: string[];
  averageScore: number;
  weakAreas: string[];
  strongAreas: string[];
  
  // Streak tracking
  streakDays: number;
  lastStreakDate?: string;
  lastActivityDate?: string;
  
  // Recent performance (last 5 sessions)
  recentScores: SessionScore[];
  
  // Module progress
  moduleProgress?: {
    [moduleId: string]: {
      questionsSeenIds: string[];
      scores: number[];
      averageScore: number;
      lastReviewDate: string;
    };
  };
  
  // Adaptive learning profile (for intelligent selection)
  adaptiveProfile?: {
    accuracyRate: number;
    domainPerformance: Record<string, number>;
    targetDifficulty: string;
    lastUpdated: string;
  };
}

export interface SessionScore {
  date: string;
  score: number;
  theme: string;
  questionsCount: number;
  mode: 'revision' | 'training' | 'exam';
}

export class StorageService {
  /**
   * Initialiser le profil utilisateur par défaut
   */
  static initializeUserProfile(): UserProfile {
    const nowIso = new Date().toISOString();

    const profile: UserProfile = {
      id: this.generateUserId(),
      createdAt: nowIso,
      totalSessions: 0,
      questionsSeen: [],
      averageScore: 0,
      streakDays: 0,
      lastStreakDate: nowIso,
      lastActivityDate: nowIso,
      weakAreas: [],
      strongAreas: [],
      recentScores: [],
      moduleProgress: {},
    };
    
    this.saveUserProfile(profile);
    return profile;
  }

  /**
   * Appliquer le déclin de confiance (confidence decay)
   * Réduit accuracyRate de 2% par jour sans activité
   */
  private static applyConfidenceDecay(profile: UserProfile): void {
    if (!profile.adaptiveProfile || !profile.lastActivityDate) return;

    const lastActivity = new Date(profile.lastActivityDate);
    const now = new Date();
    const daysSince = (now.getTime() - lastActivity.getTime()) / (24 * 60 * 60 * 1000);

    if (daysSince < 1) return; // Moins d'un jour, pas de decay

    // Déclin de 2% par jour (0.98^jours)
    const decayFactor = Math.pow(0.98, Math.floor(daysSince));
    profile.adaptiveProfile.accuracyRate *= decayFactor;

    // Limiter à minimum 30% pour éviter reset total
    profile.adaptiveProfile.accuracyRate = Math.max(0.3, profile.adaptiveProfile.accuracyRate);

    // Recalculer targetDifficulty si changement significatif
    if (profile.adaptiveProfile.accuracyRate > 0.85) {
      profile.adaptiveProfile.targetDifficulty = 'hard';
    } else if (profile.adaptiveProfile.accuracyRate < 0.65) {
      profile.adaptiveProfile.targetDifficulty = 'easy';
    } else {
      profile.adaptiveProfile.targetDifficulty = 'intermediate';
    }

    profile.adaptiveProfile.lastUpdated = now.toISOString();
  }

  /**
   * Récupérer le profil utilisateur avec application du confidence decay
   */
  static getUserProfile(): UserProfile {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    
    if (!data) {
      return this.initializeUserProfile();
    }
    
    try {
      const profile = JSON.parse(this.decode(data)) as UserProfile;
      const migrated = this.migrateProfile(profile);
      
      // Appliquer confidence decay
      this.applyConfidenceDecay(migrated);
      
      return migrated;
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error);
      return this.initializeUserProfile();
    }
  }

  /**
   * Sauvegarder le profil utilisateur
   */
  static saveUserProfile(profile: UserProfile): void {
    try {
      const encoded = this.encode(JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, encoded);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du profil:', error);
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  static updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const profile = this.getUserProfile();
    const updated = { ...profile, ...updates };
    this.saveUserProfile(updated);
    return updated;
  }

  /**
   * Ajouter une session au profil
   */
  static addSession(session: SessionScore): void {
    const profile = this.getUserProfile();
    
    profile.totalSessions++;
    profile.recentScores.push(session);
    
    // Garder seulement les 20 dernières sessions
    if (profile.recentScores.length > 20) {
      profile.recentScores = profile.recentScores.slice(-20);
    }
    
    // Recalculer la moyenne
    if (profile.recentScores.length > 0) {
      const sum = profile.recentScores.reduce((acc, s) => acc + s.score, 0);
      profile.averageScore = Math.round(sum / profile.recentScores.length);
    }
    
    // Mettre à jour le streak
    this.updateStreak(profile);
    
    profile.lastSessionAt = session.date;
    
    this.saveUserProfile(profile);
  }

  /**
   * Mettre à jour le profil adaptatif après une réponse
   * Recalcule accuracyRate, domainPerformance et targetDifficulty
   */
  static updateAdaptiveProfile(
    questionId: string,
    wasCorrect: boolean,
    responseTime: number,
    domain: string
  ): void {
    const profile = this.getUserProfile();
    
    // Initialiser adaptiveProfile si inexistant
    if (!profile.adaptiveProfile) {
      profile.adaptiveProfile = {
        accuracyRate: 0.5,
        domainPerformance: {},
        targetDifficulty: 'intermediate',
        lastUpdated: new Date().toISOString()
      };
    }

    // Recalculer accuracyRate depuis recentScores
    if (profile.recentScores && profile.recentScores.length > 0) {
      const totalScore = profile.recentScores.reduce((sum, s) => sum + s.score, 0);
      profile.adaptiveProfile.accuracyRate = totalScore / (profile.recentScores.length * 100);
    }

    // Mettre à jour domainPerformance
    if (!profile.adaptiveProfile.domainPerformance[domain]) {
      profile.adaptiveProfile.domainPerformance[domain] = [];
    }
    
    // Ajouter le nouveau score (100 si correct, 0 sinon)
    const domainScores = profile.adaptiveProfile.domainPerformance[domain] as any;
    if (Array.isArray(domainScores)) {
      domainScores.push(wasCorrect ? 100 : 0);
      // Garder les 10 derniers
      if (domainScores.length > 10) {
        domainScores.shift();
      }
      // Calculer moyenne
      const avg = domainScores.reduce((sum: number, s: number) => sum + s, 0) / domainScores.length;
      profile.adaptiveProfile.domainPerformance[domain] = avg;
    } else {
      profile.adaptiveProfile.domainPerformance[domain] = wasCorrect ? 100 : 0;
    }

    // Recalculer targetDifficulty
    const accuracyRate = profile.adaptiveProfile.accuracyRate;
    if (accuracyRate > 0.85) {
      profile.adaptiveProfile.targetDifficulty = 'hard';
    } else if (accuracyRate < 0.65) {
      profile.adaptiveProfile.targetDifficulty = 'easy';
    } else {
      profile.adaptiveProfile.targetDifficulty = 'intermediate';
    }

    profile.adaptiveProfile.lastUpdated = new Date().toISOString();
    
    this.saveUserProfile(profile);
  }

  /**
   * Récupérer les préférences (deprecated - minimal usage)
   */
  static getPreferences(): { showTimer: boolean } {
    return { showTimer: false };
  }

  /**
   * Marquer l'onboarding comme complété
   */
  static setOnboarded(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, value.toString());
  }

  /**
   * Vérifier si l'utilisateur a terminé l'onboarding
   */
  static isOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  }

  /**
   * Exporter toutes les données utilisateur
   */
  static exportData(): string {
    const data = {
      version: STORAGE_VERSION,
      exportedAt: new Date().toISOString(),
      profile: this.getUserProfile(),
    };
    
    return JSON.stringify(data, null, 2);
  }

  /**
   * Importer des données utilisateur
   */
  static importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.profile) {
        this.saveUserProfile(data.profile);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      return false;
    }
  }

  /**
   * Mettre à jour la progression d'un module
   */
  static updateModuleProgress(
    moduleId: string,
    score: number,
    questionIds: string[]
  ): void {
    const profile = this.getUserProfile();
    
    if (!profile.moduleProgress) {
      profile.moduleProgress = {};
    }
    
    if (!profile.moduleProgress[moduleId]) {
      profile.moduleProgress[moduleId] = {
        questionsSeenIds: [],
        scores: [],
        averageScore: 0,
        lastReviewDate: new Date().toISOString(),
      };
    }
    
    const moduleData = profile.moduleProgress[moduleId];
    
    // Ajouter les nouvelles questions vues
    const newQuestionIds = questionIds.filter(id => !moduleData.questionsSeenIds.includes(id));
    moduleData.questionsSeenIds.push(...newQuestionIds);
    
    // Ajouter le score
    moduleData.scores.push(score);
    
    // Recalculer la moyenne (sur les 5 derniers scores max)
    const recentScores = moduleData.scores.slice(-5);
    moduleData.averageScore = Math.round(
      recentScores.reduce((sum, s) => sum + s, 0) / recentScores.length
    );
    
    // Mettre à jour la date
    moduleData.lastReviewDate = new Date().toISOString();
    
    this.saveUserProfile(profile);
  }

  /**
   * Récupérer les stats d'un module
   */
  static getModuleStats(moduleId: string): {
    questionsSeenCount: number;
    averageScore: number;
    lastReviewDate?: string;
  } {
    const profile = this.getUserProfile();
    const moduleData = profile.moduleProgress?.[moduleId];
    
    if (!moduleData) {
      return {
        questionsSeenCount: 0,
        averageScore: 0,
      };
    }
    
    return {
      questionsSeenCount: moduleData.questionsSeenIds.length,
      averageScore: moduleData.averageScore,
      lastReviewDate: moduleData.lastReviewDate,
    };
  }

  /**
   * Réinitialiser toutes les données
   */
  static resetAll(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Encoder les données (base64 simple)
   */
  private static encode(data: string): string {
    return btoa(encodeURIComponent(data));
  }

  /**
   * Décoder les données
   */
  private static decode(data: string): string {
    return decodeURIComponent(atob(data));
  }

  /**
   * Générer un ID utilisateur unique
   */
  private static generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Migrer le profil vers la dernière version
   */
  private static migrateProfile(profile: UserProfile): UserProfile {
    // Ensure all required fields exist
    return {
      ...profile,
      weakAreas: profile.weakAreas ?? [],
      strongAreas: profile.strongAreas ?? [],
      lastActivityDate: profile.lastActivityDate ?? profile.lastSessionAt ?? profile.createdAt,
      moduleProgress: profile.moduleProgress ?? {},
      recentScores: profile.recentScores ?? [],
    };
  }

  /**
   * Mettre à jour le streak de l'utilisateur
   */
  private static updateStreak(profile: UserProfile): void {
    const today = new Date().toISOString().split('T')[0];
    const lastDate = profile.lastStreakDate;
    
    if (!lastDate) {
      profile.streakDays = 1;
      profile.lastStreakDate = today;
      return;
    }
    
    const daysDiff = this.getDaysDifference(lastDate, today);
    
    if (daysDiff === 0) {
      // Même jour, pas de changement
      return;
    } else if (daysDiff === 1) {
      // Jour consécutif
      profile.streakDays++;
      profile.lastStreakDate = today;
    } else {
      // Streak cassé
      profile.streakDays = 1;
      profile.lastStreakDate = today;
    }
  }


  /**
   * Calculer la différence en jours entre deux dates
   */
  private static getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

}

