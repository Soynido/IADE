import type { Achievement, UserProfile, SessionScore } from './storageService';
import { StorageService } from './storageService';

/**
 * Moteur de gestion des achievements
 * Détection automatique et déblocage
 */

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  icon: string;
  threshold: number;
  category: 'sessions' | 'streak' | 'questions' | 'score' | 'progression';
  checkCondition: (profile: UserProfile) => number;
}

export class AchievementsEngine {
  /**
   * Définitions de tous les achievements
   */
  private static readonly ACHIEVEMENTS: AchievementDefinition[] = [
    {
      id: 'first_session',
      title: 'Première Session',
      description: 'Complétez votre première session d\'entraînement',
      icon: '🎓',
      threshold: 1,
      category: 'sessions',
      checkCondition: (profile) => profile.totalSessions,
    },
    {
      id: 'streak_3',
      title: 'Régularité',
      description: 'Maintenez un streak de 3 jours consécutifs',
      icon: '🔥',
      threshold: 3,
      category: 'streak',
      checkCondition: (profile) => profile.streakDays,
    },
    {
      id: 'streak_7',
      title: 'Semaine Parfaite',
      description: 'Maintenez un streak de 7 jours consécutifs',
      icon: '🔥🔥',
      threshold: 7,
      category: 'streak',
      checkCondition: (profile) => profile.streakDays,
    },
    {
      id: 'questions_50',
      title: 'Explorateur',
      description: 'Répondez à 50 questions différentes',
      icon: '⭐',
      threshold: 50,
      category: 'questions',
      checkCondition: (profile) => profile.questionsSeen.length,
    },
    {
      id: 'questions_100',
      title: 'Centurion',
      description: 'Répondez à 100 questions différentes',
      icon: '⭐⭐',
      threshold: 100,
      category: 'questions',
      checkCondition: (profile) => profile.questionsSeen.length,
    },
    {
      id: 'questions_200',
      title: 'Érudit',
      description: 'Répondez à 200 questions différentes',
      icon: '⭐⭐⭐',
      threshold: 200,
      category: 'questions',
      checkCondition: (profile) => profile.questionsSeen.length,
    },
    {
      id: 'perfect_score',
      title: 'Score Parfait',
      description: 'Obtenez 100% de réussite dans une session',
      icon: '🏆',
      threshold: 1,
      category: 'score',
      checkCondition: (profile) => 
        profile.recentScores.filter(s => s.score === 100).length,
    },
    {
      id: 'average_80',
      title: 'Excellence',
      description: 'Maintenez une moyenne de 80% ou plus',
      icon: '💎',
      threshold: 80,
      category: 'score',
      checkCondition: (profile) => profile.averageScore,
    },
    {
      id: 'sessions_10',
      title: 'Marathon',
      description: 'Complétez 10 sessions d\'entraînement',
      icon: '🎯',
      threshold: 10,
      category: 'sessions',
      checkCondition: (profile) => profile.totalSessions,
    },
    {
      id: 'sessions_50',
      title: 'Dévotion',
      description: 'Complétez 50 sessions d\'entraînement',
      icon: '🎯🎯',
      threshold: 50,
      category: 'sessions',
      checkCondition: (profile) => profile.totalSessions,
    },
  ];

  /**
   * Vérifier et débloquer les achievements
   * Retourne les nouveaux achievements débloqués
   */
  static checkAchievements(profile: UserProfile): Achievement[] {
    const currentAchievements = StorageService.getAchievements();
    const newlyUnlocked: Achievement[] = [];

    for (const def of this.ACHIEVEMENTS) {
      const existing = currentAchievements.find(a => a.id === def.id);
      const progress = def.checkCondition(profile);
      const progressPercent = Math.min(100, (progress / def.threshold) * 100);

      if (!existing) {
        // Créer l'achievement
        const newAchievement: Achievement = {
          id: def.id,
          title: def.title,
          description: def.description,
          icon: def.icon,
          progress: progressPercent,
          threshold: def.threshold,
        };

        if (progress >= def.threshold) {
          newAchievement.unlockedAt = new Date().toISOString();
          newlyUnlocked.push(newAchievement);
        }

        currentAchievements.push(newAchievement);
      } else if (!existing.unlockedAt && progress >= def.threshold) {
        // Débloquer l'achievement
        existing.unlockedAt = new Date().toISOString();
        existing.progress = 100;
        newlyUnlocked.push(existing);
      } else {
        // Mettre à jour la progression
        existing.progress = progressPercent;
      }
    }

    // Sauvegarder les achievements mis à jour
    StorageService.saveAchievements(currentAchievements);

    return newlyUnlocked;
  }

  /**
   * Récupérer tous les achievements avec leur état
   */
  static getAllAchievements(): Achievement[] {
    const achievements = StorageService.getAchievements();
    const profile = StorageService.getUserProfile();

    // Mettre à jour la progression de tous les achievements
    for (const achievement of achievements) {
      const def = this.ACHIEVEMENTS.find(d => d.id === achievement.id);
      if (def && !achievement.unlockedAt) {
        const progress = def.checkCondition(profile);
        achievement.progress = Math.min(100, (progress / def.threshold) * 100);
      }
    }

    return achievements;
  }

  /**
   * Récupérer les achievements débloqués
   */
  static getUnlockedAchievements(): Achievement[] {
    return this.getAllAchievements().filter(a => a.unlockedAt);
  }

  /**
   * Récupérer le prochain achievement à débloquer
   */
  static getNextAchievement(): Achievement | null {
    const locked = this.getAllAchievements()
      .filter(a => !a.unlockedAt)
      .sort((a, b) => b.progress - a.progress);
    
    return locked.length > 0 ? locked[0] : null;
  }

  /**
   * Calculer les statistiques des achievements
   */
  static getAchievementStats(): {
    total: number;
    unlocked: number;
    percentage: number;
    recentlyUnlocked: Achievement[];
  } {
    const all = this.getAllAchievements();
    const unlocked = all.filter(a => a.unlockedAt);
    const recent = unlocked
      .sort((a, b) => 
        new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()
      )
      .slice(0, 3);

    return {
      total: all.length,
      unlocked: unlocked.length,
      percentage: Math.round((unlocked.length / all.length) * 100),
      recentlyUnlocked: recent,
    };
  }

  /**
   * Réinitialiser tous les achievements (pour debug/test)
   */
  static resetAchievements(): void {
    const achievements: Achievement[] = this.ACHIEVEMENTS.map(def => ({
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      progress: 0,
      threshold: def.threshold,
    }));
    
    StorageService.saveAchievements(achievements);
  }
}
