import type { UserProfile } from '../types/user';

interface PredictionFactor {
  name: string;
  contribution: number;  // +/- points
  status: 'good' | 'warning' | 'critical';
  description: string;
}

interface SuccessPrediction {
  probability: number;  // 0-100%
  confidence: 'low' | 'medium' | 'high';
  factors: PredictionFactor[];
  recommendations: string[];
  targetScore: number;
  daysUntilExam?: number;
}

/**
 * Moteur de prédiction de réussite au concours IADE
 * Utilise un modèle multi-facteurs pour estimer la probabilité de succès
 */
export class SuccessPredictionEngine {
  // Score minimum considéré comme réussite au concours
  private static readonly PASSING_SCORE = 70;

  // Nombre minimum de sessions pour une prédiction fiable
  private static readonly MIN_SESSIONS_FOR_HIGH_CONFIDENCE = 30;
  private static readonly MIN_SESSIONS_FOR_MEDIUM_CONFIDENCE = 10;

  /**
   * Prédit la probabilité de réussite au concours
   */
  static predictSuccessRate(userProfile: UserProfile, examDate?: Date): SuccessPrediction {
    let baseScore = 50; // Score de base neutre
    const factors: PredictionFactor[] = [];
    const recommendations: string[] = [];

    // Calculer les jours jusqu'à l'examen si fourni
    let daysUntilExam: number | undefined;
    if (examDate) {
      daysUntilExam = Math.floor((examDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
    }

    // 1. Score moyen (max +30 ou -20)
    const avgScore = userProfile.averageScore || 0;
    let scoreContribution = 0;
    
    if (avgScore >= 85) {
      scoreContribution = 30;
      factors.push({
        name: 'Score Moyen Excellent',
        contribution: scoreContribution,
        status: 'good',
        description: `${avgScore}% - Performance exceptionnelle`,
      });
    } else if (avgScore >= 70) {
      scoreContribution = (avgScore - 70) * 1.5;
      factors.push({
        name: 'Score Moyen Bon',
        contribution: scoreContribution,
        status: 'good',
        description: `${avgScore}% - Au-dessus du seuil de réussite`,
      });
    } else if (avgScore >= 50) {
      scoreContribution = (avgScore - 50) * 0.5;
      factors.push({
        name: 'Score Moyen Correct',
        contribution: scoreContribution,
        status: 'warning',
        description: `${avgScore}% - Progression nécessaire`,
      });
      recommendations.push('Augmenter votre score moyen de 10-15 points');
    } else {
      scoreContribution = -20;
      factors.push({
        name: 'Score Moyen Faible',
        contribution: scoreContribution,
        status: 'critical',
        description: `${avgScore}% - Nécessite amélioration urgente`,
      });
      recommendations.push('⚠️ Travailler intensivement les bases');
    }
    baseScore += scoreContribution;

    // 2. Couverture des modules (max +20)
    const totalModules = 53; // Nombre total de modules
    const completedModules = userProfile.learningPath?.completedModules?.length || 0;
    const coverage = totalModules > 0 ? completedModules / totalModules : 0;
    const coverageContribution = coverage * 20;
    
    if (coverage >= 0.8) {
      factors.push({
        name: 'Couverture Excellente',
        contribution: coverageContribution,
        status: 'good',
        description: `${Math.round(coverage * 100)}% des modules complétés`,
      });
    } else if (coverage >= 0.5) {
      factors.push({
        name: 'Couverture Moyenne',
        contribution: coverageContribution,
        status: 'warning',
        description: `${Math.round(coverage * 100)}% des modules complétés`,
      });
      recommendations.push(`Compléter ${Math.ceil((0.8 - coverage) * totalModules)} modules supplémentaires`);
    } else {
      factors.push({
        name: 'Couverture Faible',
        contribution: coverageContribution,
        status: 'critical',
        description: `Seulement ${Math.round(coverage * 100)}% des modules vus`,
      });
      recommendations.push('⚠️ Accélérer la découverte de nouveaux modules');
    }
    baseScore += coverageContribution;

    // 3. Régularité (max +15)
    const streakDays = userProfile.streakDays || 0;
    let regularityContribution = Math.min(streakDays * 1.5, 15);
    
    if (streakDays >= 14) {
      factors.push({
        name: 'Régularité Excellente',
        contribution: regularityContribution,
        status: 'good',
        description: `${streakDays} jours consécutifs - Habitude solidement ancrée`,
      });
    } else if (streakDays >= 7) {
      factors.push({
        name: 'Régularité Bonne',
        contribution: regularityContribution,
        status: 'good',
        description: `${streakDays} jours consécutifs - Bon rythme`,
      });
    } else if (streakDays >= 3) {
      factors.push({
        name: 'Régularité Correcte',
        contribution: regularityContribution,
        status: 'warning',
        description: `${streakDays} jours consécutifs - À maintenir`,
      });
      recommendations.push('Viser au moins 7 jours consécutifs de révision');
    } else {
      regularityContribution = streakDays * 1.5;
      factors.push({
        name: 'Régularité Insuffisante',
        contribution: regularityContribution,
        status: 'critical',
        description: `Seulement ${streakDays} jour(s) consécutif(s)`,
      });
      recommendations.push('⚠️ Établir une routine quotidienne de révision');
    }
    baseScore += regularityContribution;

    // 4. Questions difficiles réussies (max +10)
    const hardQuestionsScore = this.calculateHardQuestionsSuccessRate(userProfile);
    const hardContribution = hardQuestionsScore * 10;
    
    if (hardQuestionsScore >= 0.7) {
      factors.push({
        name: 'Maîtrise Questions Difficiles',
        contribution: hardContribution,
        status: 'good',
        description: `${Math.round(hardQuestionsScore * 100)}% de réussite sur questions difficiles`,
      });
    } else if (hardQuestionsScore >= 0.5) {
      factors.push({
        name: 'Questions Difficiles Correctes',
        contribution: hardContribution,
        status: 'warning',
        description: `${Math.round(hardQuestionsScore * 100)}% sur questions difficiles`,
      });
    } else {
      factors.push({
        name: 'Questions Difficiles Faibles',
        contribution: hardContribution,
        status: 'critical',
        description: `${Math.round(hardQuestionsScore * 100)}% sur questions difficiles`,
      });
      recommendations.push('Travailler davantage les questions de niveau Difficile');
    }
    baseScore += hardContribution;

    // 5. Zones faibles (-5 par zone faible)
    const weakAreasCount = userProfile.weakAreas?.length || 0;
    const weakPenalty = weakAreasCount * -5;
    
    if (weakAreasCount === 0) {
      factors.push({
        name: 'Aucune Zone Faible',
        contribution: 5,
        status: 'good',
        description: 'Compétences équilibrées sur tous les thèmes',
      });
      baseScore += 5;
    } else if (weakAreasCount <= 2) {
      factors.push({
        name: 'Peu de Zones Faibles',
        contribution: weakPenalty,
        status: 'warning',
        description: `${weakAreasCount} thème(s) à renforcer${userProfile.weakAreas ? ' : ' + userProfile.weakAreas.join(', ') : ''}`,
      });
      baseScore += weakPenalty;
      if (userProfile.weakAreas) {
        recommendations.push(`Travailler vos zones faibles : ${userProfile.weakAreas.join(', ')}`);
      }
    } else {
      factors.push({
        name: 'Plusieurs Zones Faibles',
        contribution: weakPenalty,
        status: 'critical',
        description: `${weakAreasCount} thèmes en difficulté`,
      });
      baseScore += weakPenalty;
      recommendations.push('⚠️ Concentration urgente sur vos 3 zones les plus faibles');
    }

    // 6. Progression récente (+10 si positive, -10 si négative)
    const progression = userProfile.progression10percent || 0;
    let progressionContribution = 0;
    
    if (progression > 10) {
      progressionContribution = 10;
      factors.push({
        name: 'Progression Excellente',
        contribution: progressionContribution,
        status: 'good',
        description: `+${progression}% sur la période récente`,
      });
    } else if (progression > 0) {
      progressionContribution = 5;
      factors.push({
        name: 'Progression Positive',
        contribution: progressionContribution,
        status: 'good',
        description: `+${progression}% d'amélioration`,
      });
    } else if (progression < -10) {
      progressionContribution = -10;
      factors.push({
        name: 'Progression Négative',
        contribution: progressionContribution,
        status: 'critical',
        description: `${progression}% - Baisse de performance`,
      });
      recommendations.push('⚠️ Analyser les causes de la baisse de performance');
    }
    baseScore += progressionContribution;

    // 7. Bonus temps de préparation (si date d'examen fournie)
    if (daysUntilExam !== undefined) {
      if (daysUntilExam >= 90) {
        const timeBonus = 5;
        factors.push({
          name: 'Temps de Préparation Excellent',
          contribution: timeBonus,
          status: 'good',
          description: `${daysUntilExam} jours - Temps largement suffisant`,
        });
        baseScore += timeBonus;
      } else if (daysUntilExam >= 30) {
        factors.push({
          name: 'Temps de Préparation Correct',
          contribution: 0,
          status: 'warning',
          description: `${daysUntilExam} jours - Préparation intensive recommandée`,
        });
        recommendations.push('Établir un planning de révision détaillé');
      } else if (daysUntilExam >= 0) {
        const timePenalty = -5;
        factors.push({
          name: 'Temps de Préparation Court',
          contribution: timePenalty,
          status: 'critical',
          description: `Seulement ${daysUntilExam} jours restants`,
        });
        baseScore += timePenalty;
        recommendations.push('⚠️ Mode révision intensive : focus sur les essentiels');
      }
    }

    // Calculer la probabilité finale (limitée entre 0 et 100)
    const probability = Math.max(0, Math.min(100, baseScore));

    // Déterminer la confiance selon le nombre de sessions
    let confidence: 'low' | 'medium' | 'high';
    const totalSessions = userProfile.totalSessions || 0;
    
    if (totalSessions >= this.MIN_SESSIONS_FOR_HIGH_CONFIDENCE) {
      confidence = 'high';
    } else if (totalSessions >= this.MIN_SESSIONS_FOR_MEDIUM_CONFIDENCE) {
      confidence = 'medium';
    } else {
      confidence = 'low';
      recommendations.unshift('⚠️ Faire au moins 30 sessions pour une prédiction fiable');
    }

    // Ajouter des recommandations selon la probabilité
    if (probability >= 80) {
      recommendations.unshift('🎉 Excellente préparation ! Maintenir le rythme');
    } else if (probability >= 70) {
      recommendations.unshift('✅ Bonne voie ! Quelques ajustements pour optimiser');
    } else if (probability >= 60) {
      recommendations.unshift('📈 Progression nécessaire pour atteindre le seuil de réussite');
    } else {
      recommendations.unshift('⚠️ Préparation insuffisante - Plan d\'action urgent requis');
    }

    return {
      probability,
      confidence,
      factors,
      recommendations,
      targetScore: this.PASSING_SCORE,
      daysUntilExam,
    };
  }

  /**
   * Calcule le taux de réussite sur les questions difficiles
   */
  private static calculateHardQuestionsSuccessRate(userProfile: UserProfile): number {
    // Pour l'instant, estimation basée sur le score moyen
    // TODO: Tracker spécifiquement les questions difficiles
    const avgScore = userProfile.averageScore || 0;
    
    // Les questions difficiles sont généralement réussies à un taux inférieur
    const estimatedHardRate = avgScore * 0.7 / 100;
    
    return Math.max(0, Math.min(1, estimatedHardRate));
  }

  /**
   * Génère un plan d'action personnalisé
   */
  static generateActionPlan(
    prediction: SuccessPrediction,
    userProfile: UserProfile
  ): {
    priority: 'urgent' | 'high' | 'medium' | 'low';
    actions: {
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      timeEstimate: string;
    }[];
  } {
    const actions: {
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      timeEstimate: string;
    }[] = [];

    // Déterminer la priorité globale
    let priority: 'urgent' | 'high' | 'medium' | 'low';
    
    if (prediction.probability < 60) {
      priority = 'urgent';
    } else if (prediction.probability < 70) {
      priority = 'high';
    } else if (prediction.probability < 80) {
      priority = 'medium';
    } else {
      priority = 'low';
    }

    // Générer des actions basées sur les facteurs critiques
    prediction.factors.forEach(factor => {
      if (factor.status === 'critical' && factor.contribution < 0) {
        if (factor.name.includes('Score')) {
          actions.push({
            title: 'Améliorer le Score Moyen',
            description: 'Faire 2 sessions par jour en mode révision ciblée sur vos zones faibles',
            impact: 'high',
            timeEstimate: '1-2 semaines',
          });
        } else if (factor.name.includes('Couverture')) {
          actions.push({
            title: 'Compléter la Couverture',
            description: 'Découvrir 3 nouveaux modules par semaine, en priorisant les essentiels',
            impact: 'high',
            timeEstimate: '3-4 semaines',
          });
        } else if (factor.name.includes('Régularité')) {
          actions.push({
            title: 'Établir une Routine',
            description: 'Réviser 30 minutes chaque jour à heure fixe pour créer une habitude',
            impact: 'medium',
            timeEstimate: '2 semaines',
          });
        }
      }
    });

    // Ajouter des actions pour les zones faibles
    if (userProfile.weakAreas.length > 0) {
      actions.push({
        title: 'Renforcer les Zones Faibles',
        description: `Focus sur : ${userProfile.weakAreas.slice(0, 3).join(', ')}. 1 session dédiée par jour.`,
        impact: 'high',
        timeEstimate: '2-3 semaines',
      });
    }

    // Action selon le temps restant
    if (prediction.daysUntilExam && prediction.daysUntilExam < 30) {
      actions.push({
        title: 'Mode Révision Intensive',
        description: 'Concentrer sur les 10 modules essentiels, 3 sessions par jour',
        impact: 'high',
        timeEstimate: `${prediction.daysUntilExam} jours`,
      });
    }

    return { priority, actions };
  }
}

