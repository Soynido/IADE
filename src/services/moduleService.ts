import { StorageService, type UserProfile } from './storageService';
import { pathologies } from '../data/pathologies';

/**
 * Service de gestion des modules de cours
 * Gère les 13 modules MD avec progression et recommandations
 */

export interface Module {
  id: string;
  title: string;
  fileName: string;
  category: string;
  icon: string;
  questionsCount: number;
  userProgress: {
    questionsSeenCount: number;
    averageScore: number;
    lastReviewDate?: string;
  };
  status: 'new' | 'in_progress' | 'to_review' | 'mastered';
  recommended: boolean;
}

// Mapping modules MD → catégories pathologies
const MODULE_TO_CATEGORIES: Record<string, string[]> = {
  'module_01_revision_neuro_support_prepa_iade_2025': ['Neurologie'],
  'module_02_anatomie_physiologie_respiratoire_prepa_iade_pyc_2018': ['Respiratoire'],
  'module_03_pneomopathies_prepa_eiade_2020': ['Respiratoire', 'Infectieux'],
  'module_04_cours_concours_iade_2025_pdf': ['Anesthésie', 'Réanimation', 'Urgences'],
  'module_05_1_les_antalgiques_c_doudet_2025_ifcs': ['Pharmacologie'],
  'module_06_2_les_antibiotiques_c_doudet_2025_ifcs': ['Pharmacologie', 'Infectieux'],
  'module_07_4_les_benzodiazepines_c_doudet_2025_ifcs': ['Pharmacologie'],
  'module_08_5_les_curares_c_doudet_2025_ifcs': ['Pharmacologie', 'Anesthésie'],
  'module_09_6_les_med_urgences_c_doudet_2024_clemenceau': ['Urgences', 'Cardiovasculaire'],
  'module_10_normes_biologiques_concours_iade': ['Métabolique', 'Digestif'],
  'module_11_3_les_anticoagulants_c_doudet_2025_ifcs': ['Pharmacologie', 'Cardiovasculaire'],
  'module_12_hemovigilence_preparation_concours_iade_2025': ['Réanimation', 'Urgences'],
  'module_13_ira_prepa_eiade_2020': ['Métabolique', 'Réanimation'],
};

// Métadonnées des modules
const MODULE_METADATA: Record<string, { title: string; icon: string; category: string }> = {
  'module_01_revision_neuro_support_prepa_iade_2025': {
    title: 'Neurologie',
    icon: '🧠',
    category: 'neurologie',
  },
  'module_02_anatomie_physiologie_respiratoire_prepa_iade_pyc_2018': {
    title: 'Anatomie & Physiologie Respiratoire',
    icon: '🫁',
    category: 'respiratoire',
  },
  'module_03_pneomopathies_prepa_eiade_2020': {
    title: 'Pneumopathies',
    icon: '🦠',
    category: 'respiratoire',
  },
  'module_04_cours_concours_iade_2025_pdf': {
    title: 'Cours Concours IADE 2025',
    icon: '📚',
    category: 'general',
  },
  'module_05_1_les_antalgiques_c_doudet_2025_ifcs': {
    title: 'Les Antalgiques',
    icon: '💊',
    category: 'pharmacologie',
  },
  'module_06_2_les_antibiotiques_c_doudet_2025_ifcs': {
    title: 'Les Antibiotiques',
    icon: '💉',
    category: 'pharmacologie',
  },
  'module_07_4_les_benzodiazepines_c_doudet_2025_ifcs': {
    title: 'Les Benzodiazépines',
    icon: '💊',
    category: 'pharmacologie',
  },
  'module_08_5_les_curares_c_doudet_2025_ifcs': {
    title: 'Les Curares',
    icon: '💉',
    category: 'pharmacologie',
  },
  'module_09_6_les_med_urgences_c_doudet_2024_clemenceau': {
    title: 'Médicaments d\'Urgence',
    icon: '🚨',
    category: 'urgences',
  },
  'module_10_normes_biologiques_concours_iade': {
    title: 'Normes Biologiques',
    icon: '🔬',
    category: 'biologie',
  },
  'module_11_3_les_anticoagulants_c_doudet_2025_ifcs': {
    title: 'Les Anticoagulants',
    icon: '💊',
    category: 'pharmacologie',
  },
  'module_12_hemovigilence_preparation_concours_iade_2025': {
    title: 'Hémovigilance',
    icon: '🩸',
    category: 'reanimation',
  },
  'module_13_ira_prepa_eiade_2020': {
    title: 'Insuffisance Rénale Aiguë',
    icon: '🫘',
    category: 'nephrologie',
  },
};

export class ModuleService {
  /**
   * Récupérer tous les modules avec progression utilisateur
   */
  static getAllModules(): Module[] {
    const userProfile = StorageService.getUserProfile();
    const modules: Module[] = [];

    for (const [moduleId, metadata] of Object.entries(MODULE_METADATA)) {
      const categories = MODULE_TO_CATEGORIES[moduleId] || [];
      const questionsCount = this.getQuestionsCountForModule(moduleId, categories);
      const progress = this.getModuleProgress(moduleId, userProfile);

      const module: Module = {
        id: moduleId,
        title: metadata.title,
        fileName: `${moduleId}.md`,
        category: metadata.category,
        icon: metadata.icon,
        questionsCount,
        userProgress: progress,
        status: this.determineModuleStatus(progress, questionsCount),
        recommended: this.isModuleRecommended(moduleId, userProfile, progress),
      };

      modules.push(module);
    }

    // Trier : recommandés d'abord, puis par progression
    return modules.sort((a, b) => {
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      return a.userProgress.questionsSeenCount - b.userProgress.questionsSeenCount;
    });
  }

  /**
   * Récupérer un module spécifique par ID
   */
  static getModuleById(moduleId: string): Module | null {
    const modules = this.getAllModules();
    return modules.find(m => m.id === moduleId) || null;
  }

  /**
   * Récupérer les modules recommandés (top 3)
   */
  static getRecommendedModules(userProfile: UserProfile): Module[] {
    const allModules = this.getAllModules();
    
    // Filtrer les modules recommandés
    const recommended = allModules.filter(m => m.recommended);
    
    return recommended.slice(0, 3);
  }

  /**
   * Récupérer les catégories de pathologies pour un module
   */
  static getCategoriesForModule(moduleId: string): string[] {
    return MODULE_TO_CATEGORIES[moduleId] || [];
  }

  /**
   * Calculer le nombre de questions disponibles pour un module
   */
  private static getQuestionsCountForModule(moduleId: string, categories: string[]): number {
    // 1. Compter les questions compilées pour ce module
    let compiledCount = 0;
    try {
      const { CompiledQuestionsLoader } = require('./compiledQuestionsLoader');
      const compiledQuestions = CompiledQuestionsLoader.loadQuestionsByModule(moduleId);
      compiledCount = compiledQuestions.length;
    } catch (error) {
      console.warn(`Impossible de charger les questions compilées pour ${moduleId}:`, error);
    }

    // 2. Compter les questions depuis pathologies.ts (fallback)
    let pathologyCount = 0;
    if (categories.length > 0) {
      const relevantPathologies = pathologies.filter(p => 
        categories.includes(p.category)
      );
      
      relevantPathologies.forEach(p => {
        pathologyCount += p.symptoms.length;
        pathologyCount += p.diagnostics.length;
        pathologyCount += p.nursingCare.length;
        pathologyCount += p.emergencyTreatment.length;
        pathologyCount += p.severitySigns.length;
      });
    }
    
    // Retourner le total (questions compilées + pathologies fallback)
    return compiledCount + pathologyCount;
  }

  /**
   * Récupérer la progression de l'utilisateur sur un module
   */
  private static getModuleProgress(
    moduleId: string, 
    userProfile: UserProfile
  ): {
    questionsSeenCount: number;
    averageScore: number;
    lastReviewDate?: string;
  } {
    const moduleData = userProfile.moduleProgress?.[moduleId];
    
    if (!moduleData) {
      return {
        questionsSeenCount: 0,
        averageScore: 0,
      };
    }
    
    return {
      questionsSeenCount: moduleData.questionsSeenIds?.length || 0,
      averageScore: moduleData.averageScore || 0,
      lastReviewDate: moduleData.lastReviewDate,
    };
  }

  /**
   * Déterminer le statut d'un module
   */
  private static determineModuleStatus(
    progress: { questionsSeenCount: number; averageScore: number },
    totalQuestions: number
  ): 'new' | 'in_progress' | 'to_review' | 'mastered' {
    if (progress.questionsSeenCount === 0) return 'new';
    
    const progressPercent = (progress.questionsSeenCount / totalQuestions) * 100;
    
    if (progressPercent >= 80 && progress.averageScore >= 80) return 'mastered';
    if (progress.averageScore < 60) return 'to_review';
    return 'in_progress';
  }

  /**
   * Vérifier si un module est recommandé
   */
  private static isModuleRecommended(
    moduleId: string,
    userProfile: UserProfile,
    progress: { questionsSeenCount: number; averageScore: number }
  ): boolean {
    // Recommander si :
    // 1. Jamais révisé
    if (progress.questionsSeenCount === 0) return true;
    
    // 2. Score faible (< 60%)
    if (progress.averageScore < 60 && progress.questionsSeenCount > 0) return true;
    
    // 3. Catégorie dans les zones faibles du profil
    const categories = this.getCategoriesForModule(moduleId);
    const hasWeakCategory = categories.some(cat => 
      userProfile.weakAreas?.includes(cat)
    );
    
    return hasWeakCategory;
  }

  /**
   * Obtenir les statistiques globales des modules
   */
  static getModulesStats(): {
    totalModules: number;
    startedModules: number;
    masteredModules: number;
    averageCompletion: number;
  } {
    const modules = this.getAllModules();
    
    const startedModules = modules.filter(m => m.userProgress.questionsSeenCount > 0);
    const masteredModules = modules.filter(m => m.status === 'mastered');
    
    const totalProgress = modules.reduce((sum, m) => 
      sum + (m.userProgress.questionsSeenCount / m.questionsCount) * 100, 
      0
    );
    
    return {
      totalModules: modules.length,
      startedModules: startedModules.length,
      masteredModules: masteredModules.length,
      averageCompletion: Math.round(totalProgress / modules.length),
    };
  }
}

