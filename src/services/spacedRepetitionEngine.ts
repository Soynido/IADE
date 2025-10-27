import { UserProfile } from '../types/user';

/**
 * Schedule de répétition pour une question selon l'algorithme SM-2
 */
export interface RepetitionSchedule {
  questionId: string;
  easinessFactor: number;  // 1.3-2.5 (facilité de mémorisation)
  interval: number;        // jours jusqu'à prochaine révision
  repetitions: number;     // nombre de répétitions réussies
  nextReview: Date;
  lastReviewed: Date;
  consecutiveFailures: number; // compteur pour détecter questions "sangsues"
}

/**
 * Moteur de répétition espacée basé sur:
 * - Courbe d'oubli d'Ebbinghaus
 * - Algorithme SM-2 (SuperMemo 2)
 * - Intervalles scientifiques optimisés
 */
export class SpacedRepetitionEngine {
  // Intervalles Ebbinghaus en jours
  private static readonly EBBINGHAUS_INTERVALS = [
    0.04,  // ~1 heure
    1,     // 1 jour
    3,     // 3 jours
    7,     // 1 semaine
    14,    // 2 semaines
    30,    // 1 mois
    90,    // 3 mois
  ];

  // Seuil pour détecter questions "sangsues" (répétées >5x sans maîtrise)
  private static readonly LEECH_THRESHOLD = 5;

  /**
   * Initialise le schedule pour une nouvelle question
   */
  static initializeSchedule(questionId: string): RepetitionSchedule {
    return {
      questionId,
      easinessFactor: 2.5, // Valeur par défaut SM-2
      interval: this.EBBINGHAUS_INTERVALS[0], // 1 heure
      repetitions: 0,
      nextReview: new Date(Date.now() + this.EBBINGHAUS_INTERVALS[0] * 24 * 60 * 60 * 1000),
      lastReviewed: new Date(),
      consecutiveFailures: 0,
    };
  }

  /**
   * Met à jour le schedule après une réponse selon l'algorithme SM-2
   * 
   * @param schedule Schedule actuel
   * @param quality Note de qualité (0-5):
   *   - 0: Échec total, réponse incorrecte
   *   - 1: Échec, réponse incorrecte mais familier
   *   - 2: Échec, réponse correcte mais très difficile
   *   - 3: Succès, réponse correcte avec difficulté
   *   - 4: Succès, réponse correcte avec hésitation
   *   - 5: Succès, réponse correcte facilement
   */
  static updateSchedule(
    schedule: RepetitionSchedule,
    quality: number,
    difficulty: 'Facile' | 'Moyen' | 'Difficile'
  ): RepetitionSchedule {
    const now = new Date();
    let newEF = schedule.easinessFactor;
    let newInterval = schedule.interval;
    let newRepetitions = schedule.repetitions;
    let consecutiveFailures = schedule.consecutiveFailures;

    // Calcul du nouveau facteur de facilité (EF) selon SM-2
    newEF = schedule.easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // EF doit rester entre 1.3 et 2.5
    newEF = Math.max(1.3, Math.min(2.5, newEF));

    // Si qualité < 3, on recommence (échec)
    if (quality < 3) {
      newRepetitions = 0;
      newInterval = this.EBBINGHAUS_INTERVALS[0]; // Retour à 1 heure
      consecutiveFailures++;
    } else {
      // Succès: calculer le nouvel intervalle
      consecutiveFailures = 0;
      
      if (newRepetitions === 0) {
        newInterval = this.EBBINGHAUS_INTERVALS[1]; // 1 jour
      } else if (newRepetitions === 1) {
        newInterval = this.EBBINGHAUS_INTERVALS[2]; // 3 jours
      } else {
        // Formule SM-2: I(n) = I(n-1) * EF
        newInterval = schedule.interval * newEF;
      }
      
      newRepetitions++;
    }

    // Ajustement selon difficulté de la question
    newInterval = this.adjustIntervalByDifficulty(newInterval, difficulty);

    // S'assurer que l'intervalle ne dépasse pas 90 jours
    newInterval = Math.min(newInterval, this.EBBINGHAUS_INTERVALS[6]);

    // Calculer la prochaine date de révision
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    return {
      questionId: schedule.questionId,
      easinessFactor: newEF,
      interval: newInterval,
      repetitions: newRepetitions,
      nextReview,
      lastReviewed: now,
      consecutiveFailures,
    };
  }

  /**
   * Ajuste l'intervalle selon la difficulté de la question
   */
  private static adjustIntervalByDifficulty(
    interval: number,
    difficulty: 'Facile' | 'Moyen' | 'Difficile'
  ): number {
    switch (difficulty) {
      case 'Facile':
        return interval * 1.5; // +50% pour questions faciles
      case 'Difficile':
        return interval * 0.7; // -30% pour questions difficiles
      case 'Moyen':
      default:
        return interval;
    }
  }

  /**
   * Convertit la performance (correct/incorrect) en note de qualité SM-2
   */
  static calculateQuality(
    isCorrect: boolean,
    timeSpent: number,
    averageTime: number = 30
  ): number {
    if (!isCorrect) {
      return 0; // Échec total
    }

    // Calculer la qualité selon le temps de réponse
    const timeRatio = timeSpent / averageTime;

    if (timeRatio < 0.5) {
      return 5; // Très rapide, maîtrise parfaite
    } else if (timeRatio < 0.8) {
      return 4; // Rapide, bonne maîtrise
    } else if (timeRatio < 1.5) {
      return 3; // Normal, maîtrise correcte
    } else {
      return 2; // Lent, difficile mais correct
    }
  }

  /**
   * Calcule la priorité d'une question selon son schedule
   * Plus la priorité est élevée, plus la question doit être révisée
   */
  static calculatePriority(schedule: RepetitionSchedule): number {
    const now = new Date();
    const daysUntilReview = (schedule.nextReview.getTime() - now.getTime()) / (24 * 60 * 60 * 1000);

    let priority = 50; // Base

    // Questions en retard de révision
    if (daysUntilReview <= 0) {
      const daysOverdue = Math.abs(daysUntilReview);
      priority += Math.min(daysOverdue * 10, 40); // Max +40 points
    }

    // Questions à réviser bientôt (dans les prochaines 24h)
    if (daysUntilReview > 0 && daysUntilReview <= 1) {
      priority += 30;
    }

    // Questions "sangsues" (échecs répétés)
    if (schedule.consecutiveFailures >= this.LEECH_THRESHOLD) {
      priority += 25; // Haute priorité pour les retravailler
    }

    // Questions récemment vues mais pas encore maîtrisées
    if (schedule.repetitions > 0 && schedule.repetitions < 3) {
      priority += 15;
    }

    // Pénaliser légèrement les questions bien maîtrisées
    if (schedule.repetitions >= 5 && schedule.easinessFactor > 2.0) {
      priority -= 10;
    }

    return Math.max(0, priority);
  }

  /**
   * Détecte si une question est une "sangsue" (leech)
   */
  static isLeech(schedule: RepetitionSchedule): boolean {
    return schedule.consecutiveFailures >= this.LEECH_THRESHOLD;
  }

  /**
   * Récupère toutes les questions à réviser aujourd'hui
   */
  static getQuestionsToReview(userProfile: UserProfile): string[] {
    const now = new Date();
    
    return userProfile.questionsToReview
      .filter(q => {
        const reviewDate = new Date(q.nextReviewDate);
        return reviewDate <= now;
      })
      .map(q => q.questionId);
  }

  /**
   * Récupère les schedules de toutes les questions
   */
  static getAllSchedules(userProfile: UserProfile): RepetitionSchedule[] {
    return userProfile.questionsToReview.map(q => ({
      questionId: q.questionId,
      easinessFactor: 2.5, // Default si non stocké
      interval: 1,
      repetitions: q.repetitionLevel,
      nextReview: new Date(q.nextReviewDate),
      lastReviewed: new Date(), // À enrichir si on stocke l'historique
      consecutiveFailures: 0,
    }));
  }

  /**
   * Statistiques sur les questions "sangsues"
   */
  static getLeechStats(userProfile: UserProfile): {
    totalLeeches: number;
    leechQuestions: string[];
    averageFailures: number;
  } {
    const schedules = this.getAllSchedules(userProfile);
    const leeches = schedules.filter(s => this.isLeech(s));
    
    return {
      totalLeeches: leeches.length,
      leechQuestions: leeches.map(s => s.questionId),
      averageFailures: leeches.length > 0
        ? leeches.reduce((sum, s) => sum + s.consecutiveFailures, 0) / leeches.length
        : 0,
    };
  }

  /**
   * Recommandations personnalisées basées sur l'analyse des schedules
   */
  static getRecommendations(userProfile: UserProfile): {
    shouldReviewToday: number;
    overdueQuestions: number;
    nextReviewDate: Date | null;
    focusAreas: string[];
  } {
    const now = new Date();
    const questionsToReview = userProfile.questionsToReview;

    const shouldReviewToday = questionsToReview.filter(q => {
      const reviewDate = new Date(q.nextReviewDate);
      return reviewDate <= now;
    }).length;

    const overdueQuestions = questionsToReview.filter(q => {
      const reviewDate = new Date(q.nextReviewDate);
      const daysOverdue = (now.getTime() - reviewDate.getTime()) / (24 * 60 * 60 * 1000);
      return daysOverdue > 1;
    }).length;

    // Prochaine révision
    const upcomingReviews = questionsToReview
      .map(q => new Date(q.nextReviewDate))
      .filter(d => d > now)
      .sort((a, b) => a.getTime() - b.getTime());
    
    const nextReviewDate = upcomingReviews.length > 0 ? upcomingReviews[0] : null;

    // Zones à travailler en priorité (thèmes avec le plus de questions à revoir)
    const focusAreas = userProfile.weakAreas.slice(0, 3);

    return {
      shouldReviewToday,
      overdueQuestions,
      nextReviewDate,
      focusAreas,
    };
  }
}

