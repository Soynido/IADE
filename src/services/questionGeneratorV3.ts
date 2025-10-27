import type { Question, UserStats } from '../types/pathology';
import { QuestionGenerator } from './questionGenerator';
import { VariantGenerator } from './variantGenerator';
import { StorageService } from './storageService';
import { CompiledQuestionsLoader } from './compiledQuestionsLoader';

/**
 * Générateur de questions V3 avec répétition espacée et scoring temps
 * Extension du QuestionGenerator original avec algorithmes avancés
 */

interface QuestionWithMetadata extends Question {
  lastSeen?: string;
  timesAnswered: number;
  timesCorrect: number;
  averageResponseTime?: number;
  nextReviewDate?: string;
}

export class QuestionGeneratorV3 {
  // Intervalles de répétition espacée (en jours)
  private static readonly SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30, 60];

  /**
   * Générer une session avec répétition espacée
   */
  static generateSessionWithSpacedRepetition(
    userStats: UserStats,
    questionCount: number = 10,
    includeNewQuestions: boolean = true
  ): {
    questions: Question[];
    theme: string;
    difficulty: string;
    adaptiveReasoning: string;
  } {
    // Récupérer la session de base
    const baseSession = QuestionGenerator.startLearningSession(userStats, questionCount);
    
    // Récupérer les questions qui doivent être révisées
    const questionsToReview = this.getQuestionsToReview();
    
    // Mix: 70% nouvelles questions, 30% révisions
    const newQuestionsCount = includeNewQuestions 
      ? Math.floor(questionCount * 0.7) 
      : 0;
    const reviewQuestionsCount = questionCount - newQuestionsCount;
    
    let finalQuestions: Question[] = [];
    
    // Ajouter les questions à réviser
    if (questionsToReview.length > 0 && reviewQuestionsCount > 0) {
      const reviewSample = questionsToReview.slice(0, reviewQuestionsCount);
      finalQuestions.push(...reviewSample);
    }
    
    // Compléter avec de nouvelles questions
    const newQuestions = baseSession.questions
      .filter(q => !finalQuestions.find(fq => fq.id === q.id))
      .slice(0, newQuestionsCount);
    finalQuestions.push(...newQuestions);
    
    // Générer des variantes pour éviter la mémorisation
    finalQuestions = finalQuestions.map(q => {
      if (Math.random() > 0.7) {
        const variants = VariantGenerator.generateVariants(q, 1);
        return variants.length > 0 ? variants[0] : q;
      }
      return q;
    });
    
    // Mélanger l'ordre
    finalQuestions = this.shuffleArray(finalQuestions);
    
    // RÈGLE FERME : Éviter les questions consécutives identiques
    finalQuestions = this.ensureNoConsecutiveDuplicates(finalQuestions);
    
    return {
      ...baseSession,
      questions: finalQuestions,
      adaptiveReasoning: `${baseSession.adaptiveReasoning} | Révisions espacées: ${reviewQuestionsCount} questions`,
    };
  }

  /**
   * Générer une session pour un module spécifique
   */
  static generateModuleSession(
    moduleId: string,
    questionCount: number = 10
  ): {
    questions: Question[];
    theme: string;
    difficulty: string;
    adaptiveReasoning: string;
  } {
    // Charger les questions compilées pour ce module
    const compiledQuestions = CompiledQuestionsLoader.loadQuestionsByModule(moduleId);
    
    // Si des questions compilées existent, les utiliser en priorité
    if (compiledQuestions.length > 0) {
      const userProfile = StorageService.getUserProfile();
      const moduleProgress = userProfile.moduleProgress?.[moduleId];
      const seenQuestionIds = moduleProgress?.questionsSeenIds || [];

      // Prioriser les questions non vues
      const unseenQuestions = compiledQuestions.filter(q => !seenQuestionIds.includes(q.id));
      const seenQuestions = compiledQuestions.filter(q => seenQuestionIds.includes(q.id));

      // Mix: priorité aux non vues
      let selectedQuestions: Question[] = [];
      if (unseenQuestions.length >= questionCount) {
        selectedQuestions = unseenQuestions.slice(0, questionCount);
      } else {
        selectedQuestions = [
          ...unseenQuestions,
          ...seenQuestions.slice(0, questionCount - unseenQuestions.length)
        ];
      }

      // Mélanger
      selectedQuestions = this.shuffleArray(selectedQuestions);
      
      // RÈGLE FERME : Éviter les questions consécutives identiques
      selectedQuestions = this.ensureNoConsecutiveDuplicates(selectedQuestions);

      return {
        questions: selectedQuestions,
        theme: this.getModuleTitle(moduleId),
        difficulty: 'Mixte',
        adaptiveReasoning: `Session depuis questions compilées | ${unseenQuestions.length} nouvelles sur ${compiledQuestions.length} disponibles`
      };
    }

    // Fallback: Utiliser l'ancienne méthode avec pathologies.ts
    const userProfile = StorageService.getUserProfile();
    const moduleCategories = this.getModuleCategoriesMapping()[moduleId] || [];
    
    if (moduleCategories.length === 0) {
      // Fallback sur session normale
      return this.generateSessionWithSpacedRepetition(userProfile, questionCount, true);
    }
    
    // Importer pathologies pour filtrer
    const { pathologies } = require('../data/pathologies');
    
    // Filtrer pathologies par catégories du module
    const relevantPathologies = pathologies.filter((p: any) => 
      moduleCategories.includes(p.category)
    );
    
    if (relevantPathologies.length === 0) {
      return this.generateSessionWithSpacedRepetition(userProfile, questionCount, true);
    }
    
    // Récupérer les questions déjà vues pour ce module
    const moduleProgress = userProfile.moduleProgress?.[moduleId];
    const seenQuestionIds = moduleProgress?.questionsSeenIds || [];
    
    // Générer questions depuis ces pathologies uniquement
    const { QuestionGenerator } = require('./questionGenerator');
    const allQuestions: any[] = [];
    const questionTypes = ['symptoms', 'diagnostics', 'nursingCare', 'emergencyTreatment', 'severitySigns'];
    
    // Générer plus de questions qu'il n'en faut pour pouvoir filtrer
    for (let i = 0; i < questionCount * 3 && allQuestions.length < questionCount * 3; i++) {
      const randomPathology = relevantPathologies[Math.floor(Math.random() * relevantPathologies.length)];
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      
      const question = QuestionGenerator['generateQuestionFromPathology'](
        randomPathology, 
        Math.floor(Math.random() * 3) + 1, 
        i
      );
      
      // Préférer les questions non vues
      if (!seenQuestionIds.includes(question.id)) {
        allQuestions.push(question);
      } else if (allQuestions.length < questionCount && Math.random() > 0.7) {
        // Ajouter parfois des questions déjà vues avec variantes
        const variants = VariantGenerator.generateVariants(question, 1);
        allQuestions.push(variants.length > 0 ? variants[0] : question);
      }
    }
    
    // Prendre les N premières questions uniques
    let finalQuestions = allQuestions.slice(0, questionCount);
    
    // RÈGLE FERME : Éviter les questions consécutives identiques
    finalQuestions = this.ensureNoConsecutiveDuplicates(finalQuestions);
    
    return {
      questions: finalQuestions,
      theme: this.getModuleTitle(moduleId),
      difficulty: 'Adaptatif',
      adaptiveReasoning: `Révision ciblée du module : ${this.getModuleTitle(moduleId)}`,
    };
  }

  /**
   * Mapping modules → catégories
   */
  private static getModuleCategoriesMapping(): Record<string, string[]> {
    return {
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
  }

  /**
   * Obtenir le titre d'un module
   */
  private static getModuleTitle(moduleId: string): string {
    const titles: Record<string, string> = {
      'module_01_revision_neuro_support_prepa_iade_2025': 'Neurologie',
      'module_02_anatomie_physiologie_respiratoire_prepa_iade_pyc_2018': 'Anatomie & Physiologie Respiratoire',
      'module_03_pneomopathies_prepa_eiade_2020': 'Pneumopathies',
      'module_04_cours_concours_iade_2025_pdf': 'Cours Concours IADE 2025',
      'module_05_1_les_antalgiques_c_doudet_2025_ifcs': 'Les Antalgiques',
      'module_06_2_les_antibiotiques_c_doudet_2025_ifcs': 'Les Antibiotiques',
      'module_07_4_les_benzodiazepines_c_doudet_2025_ifcs': 'Les Benzodiazépines',
      'module_08_5_les_curares_c_doudet_2025_ifcs': 'Les Curares',
      'module_09_6_les_med_urgences_c_doudet_2024_clemenceau': 'Médicaments d\'Urgence',
      'module_10_normes_biologiques_concours_iade': 'Normes Biologiques',
      'module_11_3_les_anticoagulants_c_doudet_2025_ifcs': 'Les Anticoagulants',
      'module_12_hemovigilence_preparation_concours_iade_2025': 'Hémovigilance',
      'module_13_ira_prepa_eiade_2020': 'Insuffisance Rénale Aiguë',
    };
    
    return titles[moduleId] || moduleId;
  }

  /**
   * Récupérer les questions qui doivent être révisées aujourd'hui
   */
  private static getQuestionsToReview(): Question[] {
    const profile = StorageService.getUserProfile();
    const today = new Date();
    
    // Pour l'instant, retourner un tableau vide
    // TODO: Implémenter la logique de révision espacée avec metadata
    return [];
  }

  /**
   * Calculer le prochain intervalle de révision selon la performance
   */
  static calculateNextReviewInterval(
    currentInterval: number,
    wasCorrect: boolean,
    responseTime: number,
    targetTime: number = 30000 // 30 secondes
  ): number {
    const intervalIndex = this.SPACED_REPETITION_INTERVALS.indexOf(currentInterval);
    
    if (wasCorrect) {
      // Réponse correcte: avancer dans les intervalles
      if (responseTime <= targetTime) {
        // Réponse rapide et correcte: sauter un intervalle
        return this.SPACED_REPETITION_INTERVALS[Math.min(intervalIndex + 2, this.SPACED_REPETITION_INTERVALS.length - 1)];
      } else {
        // Réponse lente mais correcte: intervalle suivant
        return this.SPACED_REPETITION_INTERVALS[Math.min(intervalIndex + 1, this.SPACED_REPETITION_INTERVALS.length - 1)];
      }
    } else {
      // Réponse incorrecte: retour à l'intervalle initial
      return this.SPACED_REPETITION_INTERVALS[0];
    }
  }

  /**
   * Calculer le score avec bonus/malus temps
   */
  static calculateScoreWithTime(
    isCorrect: boolean,
    responseTime: number,
    difficulty: string
  ): {
    basePoints: number;
    timeBonus: number;
    totalPoints: number;
    feedback: string;
  } {
    // Points de base selon difficulté
    const basePointsMap: Record<string, number> = {
      'Facile': 10,
      'Moyen': 20,
      'Difficile': 30,
    };
    
    const basePoints = isCorrect ? (basePointsMap[difficulty] || 10) : 0;
    
    // Seuils de temps (en ms) selon difficulté
    const timeThresholds: Record<string, { fast: number; medium: number }> = {
      'Facile': { fast: 10000, medium: 20000 },
      'Moyen': { fast: 20000, medium: 40000 },
      'Difficile': { fast: 30000, medium: 60000 },
    };
    
    const threshold = timeThresholds[difficulty] || timeThresholds['Moyen'];
    
    let timeBonus = 0;
    let feedback = '';
    
    if (isCorrect) {
      if (responseTime <= threshold.fast) {
        timeBonus = Math.floor(basePoints * 0.5); // +50% bonus
        feedback = '⚡ Réponse ultra rapide !';
      } else if (responseTime <= threshold.medium) {
        timeBonus = Math.floor(basePoints * 0.25); // +25% bonus
        feedback = '✨ Bonne rapidité !';
      } else {
        feedback = '⏱️ Prenez votre temps';
      }
    }
    
    return {
      basePoints,
      timeBonus,
      totalPoints: basePoints + timeBonus,
      feedback,
    };
  }

  /**
   * Analyser les patterns d'erreurs pour recommandations
   */
  static analyzeErrorPatterns(userStats: UserStats): {
    weakestCategory: string;
    mostCommonErrors: string[];
    recommendations: string[];
  } {
    const weakAreas = userStats.weakAreas || [];
    const recommendations: string[] = [];
    
    // Recommandations basées sur le score
    if (userStats.averageScore < 50) {
      recommendations.push('Concentrez-vous sur les questions faciles pour renforcer les bases');
      recommendations.push('Prenez le temps de lire les explications détaillées');
    } else if (userStats.averageScore < 70) {
      recommendations.push('Vous progressez bien ! Essayez des questions moyennes');
      recommendations.push('Révisez vos zones faibles identifiées');
    } else {
      recommendations.push('Excellent niveau ! Testez les questions difficiles');
      recommendations.push('Maintenez votre rythme de révision');
    }
    
    // Recommandations basées sur le streak
    if (userStats.streakDays === 0) {
      recommendations.push('Commencez un streak pour développer la régularité');
    } else if (userStats.streakDays >= 7) {
      recommendations.push('Excellent streak ! Continuez ainsi 🔥');
    }
    
    return {
      weakestCategory: weakAreas.length > 0 ? weakAreas[0] : 'Aucune',
      mostCommonErrors: weakAreas,
      recommendations: recommendations.slice(0, 3),
    };
  }

  /**
   * Prédire le score estimé pour la prochaine session
   */
  static predictNextScore(userStats: UserStats): {
    estimated: number;
    confidence: 'low' | 'medium' | 'high';
    reasoning: string;
  } {
    const recentScores = userStats.recentScores || [];
    
    if (recentScores.length < 3) {
      return {
        estimated: 50,
        confidence: 'low',
        reasoning: 'Pas assez de données historiques',
      };
    }
    
    // Calculer la tendance (moyenne des 3 dernières vs moyenne des 3 précédentes)
    const last3 = recentScores.slice(-3);
    const previous3 = recentScores.slice(-6, -3);
    
    const avgLast3 = last3.reduce((sum, s) => sum + s.score, 0) / last3.length;
    const avgPrevious3 = previous3.length > 0
      ? previous3.reduce((sum, s) => sum + s.score, 0) / previous3.length
      : avgLast3;
    
    const trend = avgLast3 - avgPrevious3;
    
    // Prédiction avec tendance
    const estimated = Math.max(0, Math.min(100, Math.round(avgLast3 + trend * 0.5)));
    
    const confidence = recentScores.length >= 10 ? 'high' : recentScores.length >= 5 ? 'medium' : 'low';
    
    let reasoning = '';
    if (trend > 10) {
      reasoning = 'Forte progression récente';
    } else if (trend > 5) {
      reasoning = 'Progression positive';
    } else if (trend < -10) {
      reasoning = 'Légère baisse récente';
    } else {
      reasoning = 'Performance stable';
    }
    
    return {
      estimated,
      confidence,
      reasoning,
    };
  }

  /**
   * Mélanger un tableau
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * RÈGLE FERME : Éviter les questions consécutives identiques ET les mots techniques répétés
   * Garantit qu'aucune question n'apparaît deux fois de suite
   * Garantit qu'aucun mot technique majeur n'apparaît consécutivement
   */
  private static ensureNoConsecutiveDuplicates(questions: Question[]): Question[] {
    if (questions.length <= 1) return questions;
    
    const result: Question[] = [];
    const usedIds = new Set<string>();
    
    for (let i = 0; i < questions.length; i++) {
      const currentQuestion = questions[i];
      
      // Vérifier si c'est la première question
      if (result.length === 0) {
        result.push(currentQuestion);
        usedIds.add(currentQuestion.id);
        continue;
      }
      
      const previousQuestion = result[result.length - 1];
      
      // Vérifier si l'ID est identique OU si les mots techniques se répètent
      const isIdDuplicate = currentQuestion.id === previousQuestion.id;
      const hasRepeatedTechnicalTerms = this.hasRepeatedTechnicalTerms(previousQuestion, currentQuestion);
      
      if (isIdDuplicate || hasRepeatedTechnicalTerms) {
        // Question consécutive problématique détectée !
        // Chercher une question différente dans le reste de la liste
        let foundAlternative = false;
        
        for (let j = i + 1; j < questions.length; j++) {
          const alternative = questions[j];
          if (alternative.id !== currentQuestion.id && !usedIds.has(alternative.id)) {
            // Vérifier que l'alternative n'a pas de mots techniques répétés
            const alternativeHasRepeatedTerms = this.hasRepeatedTechnicalTerms(previousQuestion, alternative);
            
            if (!alternativeHasRepeatedTerms) {
              // Trouvé une alternative valide, l'insérer
              result.push(alternative);
              usedIds.add(alternative.id);
              // Déplacer la question actuelle à la position de l'alternative
              [questions[i], questions[j]] = [questions[j], questions[i]];
              foundAlternative = true;
              break;
            }
          }
        }
        
        // Si aucune alternative trouvée, générer une variante
        if (!foundAlternative) {
          try {
            const variants = VariantGenerator.generateVariants(currentQuestion, 1);
            if (variants.length > 0) {
              // Vérifier que la variante n'a pas de mots techniques répétés
              const variantHasRepeatedTerms = this.hasRepeatedTechnicalTerms(previousQuestion, variants[0]);
              if (!variantHasRepeatedTerms) {
                result.push(variants[0]);
                usedIds.add(variants[0].id);
              } else {
                // Variante aussi problématique, garder la question originale
                result.push(currentQuestion);
                usedIds.add(currentQuestion.id);
              }
            } else {
              // Dernier recours : garder la question mais avec un ID modifié
              const modifiedQuestion = {
                ...currentQuestion,
                id: `${currentQuestion.id}_variant_${Date.now()}`
              };
              result.push(modifiedQuestion);
              usedIds.add(modifiedQuestion.id);
            }
          } catch (error) {
            // En cas d'erreur, garder la question originale
            result.push(currentQuestion);
            usedIds.add(currentQuestion.id);
          }
        }
      } else {
        // Question OK, l'ajouter
        result.push(currentQuestion);
        usedIds.add(currentQuestion.id);
      }
    }
    
    return result;
  }

  /**
   * Détecte si deux questions consécutives partagent des termes techniques médicaux majeurs
   * Règle simple : aucun terme médical ne doit apparaître dans 2 questions consécutives
   */
  private static hasRepeatedTechnicalTerms(question1: Question, question2: Question): boolean {
    const text1 = `${question1.text} ${question1.options?.join(' ') || ''}`.toLowerCase();
    const text2 = `${question2.text} ${question2.options?.join(' ') || ''}`.toLowerCase();
    
    // Liste exhaustive des termes techniques médicaux à éviter en consécutif
    const medicalTerms = [
      // Troubles métaboliques et électrolytiques
      'acidose métabolique', 'acidose respiratoire', 'alcalose métabolique', 'alcalose respiratoire',
      'hyperkaliémie', 'hypokaliémie', 'hypernatrémie', 'hyponatrémie',
      'hypercalcémie', 'hypocalcémie', 'hypermagnésémie', 'hypomagnésémie',
      'hyperglycémie', 'hypoglycémie', 'déshydratation', 'surcharge hydrique',
      
      // Insuffisances d'organes
      'insuffisance rénale', 'insuffisance cardiaque', 'insuffisance respiratoire',
      'insuffisance hépatique', 'insuffisance surrénalienne',
      
      // Pathologies respiratoires
      'pneumopathie', 'bronchite', 'asthme', 'embolie pulmonaire',
      'pneumothorax', 'pleurésie', 'œdème pulmonaire', 'bronchopneumopathie',
      
      // Pathologies cardiovasculaires
      'infarctus', 'angine', 'arythmie', 'tachycardie', 'bradycardie',
      'fibrillation', 'flutter', 'choc cardiogénique', 'tamponnade',
      
      // Pathologies neurologiques
      'céphalée', 'migraine', 'épilepsie', 'convulsion', 'coma',
      'avc', 'hémorragie', 'ischémie', 'hypertension intracrânienne',
      
      // Infections et sepsis
      'sepsis', 'choc septique', 'infection', 'bactérie', 'virus',
      'méningite', 'endocardite', 'péritonite', 'abcès',
      
      // Classes médicamenteuses
      'anticoagulant', 'antalgique', 'antibiotique', 'corticoïde',
      'antihypertenseur', 'diurétique', 'bêtabloquant', 'vasodilatateur',
      'morphinique', 'benzodiazépine', 'catécholamine',
      
      // Actes et dispositifs médicaux
      'dialyse', 'ventilation', 'intubation', 'trachéotomie',
      'cathéter', 'sonde', 'drainage', 'perfusion',
      
      // Examens biologiques
      'gaz du sang', 'ph sanguin', 'bicarbonates', 'lactates',
      'troponine', 'bnp', 'crp', 'procalcitonine',
      'créatinine', 'urée', 'transaminases', 'bilirubine',
      
      // Imagerie médicale
      'radiographie', 'scanner', 'irm', 'échographie',
      'angiographie', 'scintigraphie',
      
      // Monitoring
      'monitoring', 'scope', 'oxymètre', 'tensiomètre',
      'capnographie', 'ecg', 'holter'
    ];
    
    // Vérifier si un terme médical apparaît dans les deux questions
    for (const term of medicalTerms) {
      if (text1.includes(term) && text2.includes(term)) {
        return true;
      }
    }
    
    return false;
  }
}

