import type { UserProfile } from '../types/user';
import modulesIndex from '../data/modulesIndex.json';

interface ModulePriority {
  moduleId: string;
  moduleName: string;
  priority: number;
  reasons: string[];
  importance: 'essentiel' | 'important' | 'complementaire';
  prerequisites: string[];
  prerequisitesMet: boolean;
  questionsCount: number;
  questionsCompleted: number;
  completionRate: number;
  estimatedTime: number;
}

/**
 * Moteur de recommandation intelligent de modules
 * Analyse le profil utilisateur pour suggérer les meilleurs modules à étudier
 */
export class ModuleRecommendationEngine {
  // Poids des différents critères dans le calcul de priorité
  private static readonly WEIGHTS = {
    neverSeen: 40,
    weakTheme: 30,
    prerequisitesMet: 20,
    importanceEssentiel: 25,
    importanceImportant: 15,
    importanceComplementaire: 5,
    questionsToReview: 15,
    partiallyCompleted: 10,
  };

  /**
   * Obtient les recommandations de modules pour un utilisateur
   */
  static getRecommendations(
    userProfile: UserProfile,
    count: number = 5
  ): ModulePriority[] {
    const allModules = this.getAllModules();
    
    // Calculer la priorité de chaque module
    const modulesWithPriority = allModules.map(module => 
      this.calculateModulePriority(module, userProfile)
    );

    // Trier par priorité décroissante
    modulesWithPriority.sort((a, b) => b.priority - a.priority);

    // Retourner les top N
    return modulesWithPriority.slice(0, count);
  }

  /**
   * Calcule la priorité d'un module pour un utilisateur
   */
  private static calculateModulePriority(
    module: { id: string; name: string; questionsCount: number },
    userProfile: UserProfile
  ): ModulePriority {
    let priority = 0;
    const reasons: string[] = [];

    // Récupérer les métadonnées du module
    const metadata = this.getModuleMetadata(module.id);
    const themes = this.getModuleThemes(module.id);
    
    // 1. Modules jamais vus (+40 points)
    const isCompleted = userProfile.learningPath.completedModules.includes(module.id);
    const isInProgress = userProfile.learningPath.inProgressModules.includes(module.id);
    
    if (!isCompleted && !isInProgress) {
      priority += this.WEIGHTS.neverSeen;
      reasons.push('Nouveau module à découvrir');
    }

    // 2. Thèmes faibles (+30 points)
    const hasWeakTheme = themes.some(t => userProfile.weakAreas.includes(t));
    if (hasWeakTheme) {
      priority += this.WEIGHTS.weakTheme;
      const weakThemes = themes.filter(t => userProfile.weakAreas.includes(t));
      reasons.push(`Renforce vos zones faibles : ${weakThemes.join(', ')}`);
    }

    // 3. Prérequis complétés (+20 si oui, -50 si non)
    const prerequisites = metadata.prerequisites;
    const prerequisitesMet = prerequisites.every(p => 
      userProfile.learningPath.completedModules.includes(p)
    );
    
    if (prerequisitesMet) {
      priority += this.WEIGHTS.prerequisitesMet;
      if (prerequisites.length > 0) {
        reasons.push('Prérequis maîtrisés');
      }
    } else {
      priority -= 50;
      reasons.push(`⚠️ Prérequis manquants : ${prerequisites.length}`);
    }

    // 4. Importance du module
    switch (metadata.importance) {
      case 'essentiel':
        priority += this.WEIGHTS.importanceEssentiel;
        reasons.push('⭐ Module essentiel pour le concours');
        break;
      case 'important':
        priority += this.WEIGHTS.importanceImportant;
        reasons.push('Module important');
        break;
      case 'complementaire':
        priority += this.WEIGHTS.importanceComplementaire;
        break;
    }

    // 5. Questions à réviser dans ce module (+15 max)
    const questionsToReviewCount = userProfile.questionsToReview.filter(q => 
      q.questionId.startsWith(module.id)
    ).length;
    
    if (questionsToReviewCount > 0) {
      const reviewPriority = Math.min(questionsToReviewCount * 3, this.WEIGHTS.questionsToReview);
      priority += reviewPriority;
      reasons.push(`${questionsToReviewCount} question(s) à réviser`);
    }

    // 6. Module partiellement complété (+10)
    if (isInProgress) {
      priority += this.WEIGHTS.partiallyCompleted;
      reasons.push('En cours de progression');
    }

    // Calculer le taux de complétion
    const questionsInModule = userProfile.questionsSeen.filter(qId => 
      qId.startsWith(module.id)
    ).length;
    const completionRate = module.questionsCount > 0 
      ? Math.round((questionsInModule / module.questionsCount) * 100)
      : 0;

    return {
      moduleId: module.id,
      moduleName: module.name,
      priority: Math.max(0, priority),
      reasons,
      importance: metadata.importance,
      prerequisites: prerequisites,
      prerequisitesMet,
      questionsCount: module.questionsCount,
      questionsCompleted: questionsInModule,
      completionRate,
      estimatedTime: metadata.estimatedTime,
    };
  }

  /**
   * Récupère tous les modules disponibles
   */
  private static getAllModules(): { id: string; name: string; questionsCount: number }[] {
    return modulesIndex.modules.map(m => ({
      id: m.id,
      name: m.title, // Utiliser 'title' depuis modulesIndex
      questionsCount: m.questionsCount,
    }));
  }

  /**
   * Récupère les métadonnées d'un module
   */
  private static getModuleMetadata(moduleId: string): {
    prerequisites: string[];
    difficulty: 'facile' | 'moyen' | 'difficile';
    importance: 'essentiel' | 'important' | 'complementaire';
    estimatedTime: number;
  } {
    // Pour l'instant, utiliser des heuristiques basées sur le nom du module
    // TODO: Charger depuis modulesDependencies.json quand disponible
    
    const moduleName = moduleId.toLowerCase();
    
    // Déterminer l'importance
    let importance: 'essentiel' | 'important' | 'complementaire' = 'important';
    
    if (moduleName.includes('urgence') || 
        moduleName.includes('reanimation') ||
        moduleName.includes('normes') ||
        moduleName.includes('pharmacologie') ||
        moduleName.includes('antalgique') ||
        moduleName.includes('curare')) {
      importance = 'essentiel';
    } else if (moduleName.includes('anatomie') || 
               moduleName.includes('physiologie') ||
               moduleName.includes('pathologie')) {
      importance = 'important';
    } else {
      importance = 'complementaire';
    }

    // Déterminer les prérequis basiques
    const prerequisites: string[] = [];
    
    if (moduleName.includes('avance') || moduleName.includes('complex')) {
      // Modules avancés nécessitent les bases
      const baseModules = modulesIndex.modules
        .filter(m => m.id.toLowerCase().includes('base') || m.id.toLowerCase().includes('intro'))
        .map(m => m.id);
      prerequisites.push(...baseModules);
    }

    return {
      prerequisites,
      difficulty: 'moyen',
      importance,
      estimatedTime: 45, // minutes par défaut
    };
  }

  /**
   * Récupère les thèmes d'un module
   */
  private static getModuleThemes(moduleId: string): string[] {
    const moduleName = moduleId.toLowerCase();
    const themes: string[] = [];

    // Mapping basique nom -> thèmes
    const themeMap: Record<string, string[]> = {
      'neuro': ['Neurologie', 'Système nerveux'],
      'cardio': ['Cardiologie', 'Système cardiovasculaire'],
      'respir': ['Pneumologie', 'Système respiratoire'],
      'renal': ['Néphrologie', 'Système rénal'],
      'pharmaco': ['Pharmacologie', 'Médicaments'],
      'antalgique': ['Douleur', 'Analgésie'],
      'anticoagulant': ['Hémostase', 'Coagulation'],
      'curare': ['Anesthésie', 'Curarisation'],
      'urgence': ['Urgences', 'Réanimation'],
      'norme': ['Normes biologiques', 'Laboratoire'],
    };

    for (const [key, moduleThemes] of Object.entries(themeMap)) {
      if (moduleName.includes(key)) {
        themes.push(...moduleThemes);
      }
    }

    // Si aucun thème trouvé, utiliser "Général"
    return themes.length > 0 ? themes : ['Général'];
  }

  /**
   * Génère un parcours d'apprentissage personnalisé
   */
  static generateLearningPath(
    userProfile: UserProfile,
    targetDate?: Date
  ): {
    modules: ModulePriority[];
    totalTime: number;
    weeksNeeded: number;
    dailyGoal: number;
  } {
    // Obtenir tous les modules non complétés
    const incompleteModules = this.getRecommendations(userProfile, 50)
      .filter(m => m.completionRate < 100 && m.prerequisitesMet);

    // Trier par priorité puis par prérequis
    const orderedModules = this.orderByDependencies(incompleteModules);

    // Calculer le temps total nécessaire
    const totalTime = orderedModules.reduce((sum, m) => sum + m.estimatedTime, 0);

    // Calculer le nombre de semaines si date cible fournie
    let weeksNeeded = Math.ceil(totalTime / (60 * 5)); // Assuming 5h/semaine
    let dailyGoal = 10; // questions par jour par défaut

    if (targetDate) {
      const now = new Date();
      const daysUntilTarget = Math.floor((targetDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      weeksNeeded = Math.ceil(daysUntilTarget / 7);
      
      // Calculer objectif quotidien
      const totalQuestions = orderedModules.reduce((sum, m) => sum + m.questionsCount, 0);
      dailyGoal = Math.ceil(totalQuestions / daysUntilTarget);
    }

    return {
      modules: orderedModules,
      totalTime,
      weeksNeeded,
      dailyGoal,
    };
  }

  /**
   * Ordonne les modules selon leurs dépendances
   */
  private static orderByDependencies(modules: ModulePriority[]): ModulePriority[] {
    const ordered: ModulePriority[] = [];
    const remaining = [...modules];
    
    // Algorithme simple : prendre d'abord ceux sans prérequis
    while (remaining.length > 0) {
      // Trouver un module dont tous les prérequis sont dans ordered
      const nextModule = remaining.find(m => 
        m.prerequisites.every(prereq => 
          ordered.some(o => o.moduleId === prereq) || 
          m.prerequisites.length === 0
        )
      );

      if (nextModule) {
        ordered.push(nextModule);
        remaining.splice(remaining.indexOf(nextModule), 1);
      } else {
        // Si aucun trouvé, prendre celui avec la priorité la plus haute
        const highestPriority = remaining.reduce((max, m) => 
          m.priority > max.priority ? m : max
        );
        ordered.push(highestPriority);
        remaining.splice(remaining.indexOf(highestPriority), 1);
      }
    }

    return ordered;
  }

  /**
   * Obtient les statistiques globales de progression
   */
  static getProgressionStats(userProfile: UserProfile): {
    modulesCompleted: number;
    modulesInProgress: number;
    modulesRemaining: number;
    overallCompletion: number;
    estimatedTimeRemaining: number;
  } {
    const allModules = this.getAllModules();
    const totalModules = allModules.length;
    
    const modulesCompleted = userProfile.learningPath.completedModules.length;
    const modulesInProgress = userProfile.learningPath.inProgressModules.length;
    const modulesRemaining = totalModules - modulesCompleted - modulesInProgress;

    const overallCompletion = Math.round((modulesCompleted / totalModules) * 100);

    // Estimer le temps restant
    const remainingModulesIds = allModules
      .map(m => m.id)
      .filter(id => 
        !userProfile.learningPath.completedModules.includes(id) &&
        !userProfile.learningPath.inProgressModules.includes(id)
      );
    
    const estimatedTimeRemaining = remainingModulesIds.length * 45; // 45 min par module

    return {
      modulesCompleted,
      modulesInProgress,
      modulesRemaining,
      overallCompletion,
      estimatedTimeRemaining,
    };
  }
}

