import { Question, UserStats } from '../types/pathology';
import { CompiledQuestion } from '../types/module';
import { StorageService } from './storageService';
import { VariantGenerator } from './variantGenerator';
import { SpacedRepetitionEngine, RepetitionSchedule } from './spacedRepetitionEngine';
import { InterleavingEngine } from './interleavingEngine';

// Import des questions compilées
import compiledQuestions from '../data/compiledQuestions.json';
import modulesIndex from '../data/modulesIndex.json';

/**
 * Moteur adaptatif v2 - Intègre questions compilées + répétition espacée + variantes
 */
export class QuestionGeneratorV2 {
  private static compiledQuestions: CompiledQuestion[] = compiledQuestions as CompiledQuestion[];
  private static variantsGenerated = false;
  private static enrichedQuestions: CompiledQuestion[] = [];
  private static validQuestions: CompiledQuestion[] = [];
  
  /**
   * Génère des options incorrectes pertinentes
   */
  private static getWrongOptionsForCategory(
    correctAnswer: string,
    correctOptions: string[],
    category: string,
    type: string
  ): string[] {
    const wrongOptionsMap: Record<string, Record<string, string[]>> = {
      'Anesthésie': {
        'symptomatologie': ['Fièvre modérée', 'Toux productive', 'Douleur thoracique atypique', 'Éruption cutanée localisée'],
        'diagnostic': ['Radiographie dentaire', 'Échographie mammaire', 'Fibroscopie gastrique', 'Urographie intraveineuse'],
        'prise_en_charge': ['Surveiller uniquement les constantes vitales', 'Administrer des antalgiques sans ordonnance', 'Effectuer des pansements de routine'],
        'traitement_urgence': ['Antibiothérapie prophylactique', 'Antispasmodiques IV', 'Antalgiques de palier II'],
        'signes_gravite': ['Érythème cutané localisé', 'Prurit modéré', 'Urticaire légère', 'Toux légère']
      },
      'Général': {
        'symptomatologie': ['Fatigue légère', 'Céphalées bénignes', 'Nausées occasionnelles', 'Vertiges légers'],
        'diagnostic': ['Examen clinique simple', 'Prise de température', 'Auscultation pulmonaire', 'Palpation abdominale'],
        'prise_en_charge': ['Repos au lit', 'Hydratation orale', 'Surveillance des constantes', 'Antalgiques légers'],
        'traitement_urgence': ['Paracétamol per os', 'Repos et surveillance', 'Hydratation IV', 'Consultation différée'],
        'signes_gravite': ['Douleur modérée', 'Fièvre légère', 'Fatigue passagère', 'Troubles digestifs mineurs']
      }
    };

    const categoryMap = wrongOptionsMap[category] || wrongOptionsMap['Général'];
    const wrongOptions = categoryMap[type] || categoryMap['symptomatologie'] || [];
    
    const filteredWrong = wrongOptions.filter(opt => !correctOptions.includes(opt) && opt !== correctAnswer);
    
    return [correctAnswer, ...filteredWrong.slice(0, 3)];
  }

  /**
   * Mélange un tableau
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
   * Calcule le score d'une question selon les performances passées
   * Utilise maintenant SpacedRepetitionEngine pour un calcul scientifique
   */
  private static calculateQuestionPriority(
    question: CompiledQuestion,
    userProfile: any
  ): number {
    let priority = 50; // Base

    // Questions jamais vues ont haute priorité
    if (!userProfile.questionsSeen?.includes(question.id)) {
      priority += 30;
    }

    // Utiliser SpacedRepetitionEngine pour les questions déjà vues
    const toReview = userProfile.questionsToReview?.find((q: any) => q.questionId === question.id);
    if (toReview) {
      // Convertir en RepetitionSchedule
      const schedule: RepetitionSchedule = {
        questionId: question.id,
        easinessFactor: 2.5, // Valeur par défaut
        interval: 1,
        repetitions: toReview.repetitionLevel || 0,
        nextReview: new Date(toReview.nextReviewDate),
        lastReviewed: new Date(),
        consecutiveFailures: 0,
      };

      // Utiliser le calcul scientifique du moteur de répétition espacée
      const spacedPriority = SpacedRepetitionEngine.calculatePriority(schedule);
      priority += spacedPriority - 50; // Ajuster à notre échelle
    }

    // Questions du thème faible
    if (userProfile.weakAreas?.includes(question.theme)) {
      priority += 20;
    }

    // Randomisation légère pour variété
    priority += Math.random() * 10 - 5;

    return priority;
  }

  /**
   * Sélectionne les meilleures questions selon le profil utilisateur
   */
  private static selectAdaptiveQuestions(
    _userStats: UserStats,
    count: number,
    _targetDifficulty: number
  ): CompiledQuestion[] {
    const userProfile = StorageService.getUserProfile();
    const questionsPool = this.enrichedQuestions.length > 0 ? this.enrichedQuestions : this.compiledQuestions;
    
    // Calculer la priorité de chaque question
    const questionsWithPriority = questionsPool.map(q => ({
      question: q,
      priority: this.calculateQuestionPriority(q, userProfile),
    }));

    // Trier par priorité décroissante
    questionsWithPriority.sort((a, b) => b.priority - a.priority);

    // Prendre les top questions
    const selectedQuestions = questionsWithPriority
      .slice(0, count * 3) // Prendre 3x pour avoir du choix et éviter doublons
      .map(qp => qp.question);

    // Garantir l'unicité des questions (pas de doublons dans la session)
    const uniqueQuestions: CompiledQuestion[] = [];
    const seenIds = new Set<string>();

    selectedQuestions.forEach(q => {
      if (!seenIds.has(q.id)) {
        seenIds.add(q.id);
        uniqueQuestions.push(q);
      }
    });

    console.log(`📊 Sélection: ${uniqueQuestions.length} questions uniques sur ${selectedQuestions.length} candidates`);

    // Prendre suffisamment de questions pour l'interleaving
    const questionsForInterleaving = uniqueQuestions.slice(0, Math.min(count * 2, uniqueQuestions.length));
    
    // Appliquer l'interleaving pour optimiser l'apprentissage
    const interleavedQuestions = InterleavingEngine.applyInterleaving(questionsForInterleaving);
    
    // Prendre le nombre demandé après interleaving
    const finalQuestions = interleavedQuestions.slice(0, count);
    
    if (finalQuestions.length < count) {
      console.warn(`⚠️ Seulement ${finalQuestions.length} questions disponibles au lieu de ${count}`);
    }

    // Analyser la qualité de l'interleaving
    const interleavingQuality = InterleavingEngine.analyzeInterleavingQuality(finalQuestions);
    console.log(`🔀 Qualité interleaving: ${interleavingQuality.score}/100`);
    if (interleavingQuality.issues.length > 0) {
      console.log(`⚠️ Issues: ${interleavingQuality.issues.join(', ')}`);
    }

    return finalQuestions;
  }

  /**
   * Calcule la difficulté adaptative
   */
  private static calculateAdaptiveDifficulty(
    userStats: UserStats,
    selectedCategory: string
  ): { level: number; text: string; reasoning: string } {
    const baseScore = userStats.averageScore || 50;
    const recentProgression = userStats.progression10percent || 0;
    const sessionsCount = userStats.totalSessions || 0;

    let difficultyAdjustment = 0;
    let reasoning = "Difficulté de base";

    // Adapter selon le score moyen
    if (baseScore > 85) {
      difficultyAdjustment += 2;
      reasoning += " - Excellent score moyen";
    } else if (baseScore > 70) {
      difficultyAdjustment += 1;
      reasoning += " - Bon score moyen";
    } else if (baseScore < 40) {
      difficultyAdjustment -= 1;
      reasoning += " - Score moyen à améliorer";
    }

    // Adapter selon la progression récente
    if (recentProgression >= 15) {
      difficultyAdjustment += 1;
      reasoning += " - Progression excellente";
    } else if (recentProgression >= 10) {
      reasoning += " - Progression positive";
    } else if (recentProgression < -5) {
      difficultyAdjustment -= 1;
      reasoning += " - Difficultés récentes";
    }

    // Adapter selon l'expérience
    if (sessionsCount > 20) {
      difficultyAdjustment += 1;
      reasoning += " - Utilisateur expérimenté";
    } else if (sessionsCount < 5) {
      difficultyAdjustment -= 1;
      reasoning += " - Utilisateur débutant";
    }

    // Ajuster pour les zones de faiblesse
    if (userStats.weakAreas?.includes(selectedCategory)) {
      difficultyAdjustment -= 1;
      reasoning += " - Renforcement nécessaire";
    }

    const finalLevel = Math.max(1, Math.min(3, 2 + difficultyAdjustment));
    const difficultyText = finalLevel === 3 ? 'Difficile' : (finalLevel === 2 ? 'Moyen' : 'Facile');

    return {
      level: finalLevel,
      text: difficultyText,
      reasoning
    };
  }

  /**
   * Convertit une CompiledQuestion en Question pour compatibilité
   */
  private static convertToQuestion(compiled: CompiledQuestion): Question {
    return {
      id: compiled.id,
      question: compiled.question,
      options: compiled.options || this.shuffleArray(
        this.getWrongOptionsForCategory(
          compiled.correct,
          [compiled.correct],
          compiled.theme || 'Général',
          'diagnostic'
        )
      ),
      correct: compiled.correct,
      explanation: compiled.explanation,
      points: compiled.points,
      theme: compiled.theme,
      difficulty: compiled.difficulty,
      pathology: compiled.pathology,
    };
  }

  /**
   * Enrichit le pool de questions avec des variantes (une seule fois)
   */
  private static enrichQuestionsPool(): void {
    if (this.variantsGenerated || this.compiledQuestions.length === 0) {
      return;
    }

    console.log('🔄 Génération de variantes de questions...');
    
    // Filtrer les questions valides AVANT de générer les variantes
    this.validQuestions = this.compiledQuestions.filter(q => 
      q.correct !== 'À compléter manuellement' &&
      q.options && q.options.length >= 3 &&
      q.question.length > 20 &&
      !q.question.includes('??') && // Éviter les fragments
      q.question.endsWith('?') // Doit être une vraie question
    );

    console.log(`✅ ${this.validQuestions.length} questions valides sur ${this.compiledQuestions.length}`);

    // Générer des variantes uniquement pour les questions valides
    const variants = this.validQuestions.length > 0 
      ? VariantGenerator.generateQualityVariants(this.validQuestions)
      : [];
    
    this.enrichedQuestions = [...this.validQuestions, ...variants];
    this.variantsGenerated = true;
    
    console.log(`✅ Pool enrichi: ${this.validQuestions.length} originales + ${variants.length} variantes = ${this.enrichedQuestions.length} questions totales`);
  }

  /**
   * Démarre une session d'apprentissage adaptative v2
   */
  static startLearningSession(
    userStats: UserStats,
    questionCount: number = 10
  ): {
    questions: Question[];
    theme: string;
    difficulty: string;
    adaptiveReasoning: string;
  } {
    // Vérifier qu'il y a des questions compilées
    if (this.compiledQuestions.length === 0) {
      console.warn('⚠️ Aucune question compilée disponible, utilisation du fallback');
      // Fallback sur l'ancien générateur
      const { QuestionGenerator } = require('./questionGenerator');
      return QuestionGenerator.startLearningSession(userStats, questionCount);
    }

    // Enrichir le pool de questions avec des variantes (une seule fois)
    this.enrichQuestionsPool();

    // Si aucune question valide après filtrage, fallback
    if (this.validQuestions.length < questionCount) {
      console.warn(`⚠️ Seulement ${this.validQuestions.length} questions valides, fallback sur pathologies`);
      const { QuestionGenerator } = require('./questionGenerator');
      return QuestionGenerator.startLearningSession(userStats, questionCount);
    }

    // Utiliser le pool enrichi si disponible, sinon les questions originales
    const questionsPool = this.enrichedQuestions.length > 0 ? this.enrichedQuestions : this.compiledQuestions;

    // Obtenir tous les thèmes disponibles
    const themes = [...new Set(questionsPool.map(q => q.theme))];

    // Sélection stratégique de la catégorie
    let selectedCategory: string;
    let selectionReasoning: string;

    if (userStats.weakAreas && userStats.weakAreas.length > 0) {
      // Prioriser les zones de faiblesse
      const weakTheme = themes.find(t => userStats.weakAreas?.includes(t));
      selectedCategory = weakTheme || themes[0];
      selectionReasoning = `Focus sur la zone à renforcer: ${selectedCategory}`;
    } else if (userStats.recentScores && userStats.recentScores.length >= 3) {
      // Choisir une catégorie variée si performances stables
      const lastThreeThemes = userStats.recentScores.slice(-3).map(s => s.theme);
      const availableThemes = themes.filter(t => !lastThreeThemes.includes(t));
      selectedCategory = availableThemes.length > 0
        ? availableThemes[Math.floor(Math.random() * availableThemes.length)]
        : themes[Math.floor(Math.random() * themes.length)];
      selectionReasoning = `Diversification des thèmes étudiés`;
    } else {
      // Sélection aléatoire pour débutants
      selectedCategory = themes[Math.floor(Math.random() * themes.length)];
      selectionReasoning = `Découverte de nouveaux thèmes`;
    }

    // Calcul intelligent de la difficulté
    const adaptiveDifficulty = this.calculateAdaptiveDifficulty(userStats, selectedCategory);

    // Sélectionner les questions adaptées
    const selectedCompiled = this.selectAdaptiveQuestions(
      userStats,
      questionCount,
      adaptiveDifficulty.level
    );

    // Convertir en format Question
    const questions = selectedCompiled.map(cq => this.convertToQuestion(cq));

    const fullReasoning = `${selectionReasoning} | ${adaptiveDifficulty.reasoning}`;

    console.log('🎯 Session adaptative V2 générée:', {
      theme: selectedCategory,
      difficulty: adaptiveDifficulty.text,
      level: adaptiveDifficulty.level,
      reasoning: fullReasoning,
      questionCount: questions.length,
      compiledQuestionsAvailable: this.compiledQuestions.length,
      enrichedQuestionsAvailable: this.enrichedQuestions.length,
      modulesAvailable: modulesIndex.modules.length
    });

    // Marquer les questions comme vues
    questions.forEach(q => StorageService.markQuestionAsSeen(q.id));

    return {
      questions,
      theme: selectedCategory,
      difficulty: adaptiveDifficulty.text,
      adaptiveReasoning: fullReasoning
    };
  }

  /**
   * Enregistre la réponse utilisateur et met à jour le spaced repetition
   * Utilise maintenant l'algorithme SM-2 pour un calcul scientifique
   */
  static recordAnswer(questionId: string, isCorrect: boolean, timeSpent: number): void {
    const userProfile = StorageService.getUserProfile();
    
    // Trouver la question pour obtenir sa difficulté
    const question = this.compiledQuestions.find(q => q.id === questionId);
    const difficulty = (question?.difficulty || 'Moyen') as 'Facile' | 'Moyen' | 'Difficile';

    // Calculer la qualité de la réponse selon SM-2
    const quality = SpacedRepetitionEngine.calculateQuality(isCorrect, timeSpent);

    // Récupérer ou créer le schedule
    let schedule: RepetitionSchedule;
    const existingReview = userProfile.questionsToReview.find(q => q.questionId === questionId);
    
    if (existingReview) {
      // Convertir le format existant en RepetitionSchedule
      schedule = {
        questionId,
        easinessFactor: 2.5, // À améliorer : stocker cette valeur
        interval: 1,
        repetitions: existingReview.repetitionLevel,
        nextReview: new Date(existingReview.nextReviewDate),
        lastReviewed: new Date(),
        consecutiveFailures: 0,
      };
    } else {
      // Nouvelle question
      schedule = SpacedRepetitionEngine.initializeSchedule(questionId);
    }

    // Mettre à jour selon l'algorithme SM-2
    const updatedSchedule = SpacedRepetitionEngine.updateSchedule(schedule, quality, difficulty);

    // Sauvegarder dans le format attendu par StorageService
    StorageService.scheduleQuestionReview(questionId, isCorrect);
    
    // Détection des questions "sangsues"
    if (SpacedRepetitionEngine.isLeech(updatedSchedule)) {
      console.warn(`🐛 Question sangsue détectée: ${questionId} (${updatedSchedule.consecutiveFailures} échecs consécutifs)`);
    }

    // Log pour analytics avec détails scientifiques
    console.log('📝 Réponse enregistrée:', {
      questionId,
      isCorrect,
      timeSpent: `${timeSpent}s`,
      quality: `${quality}/5`,
      nextReview: updatedSchedule.nextReview.toLocaleDateString('fr-FR'),
      interval: `${Math.round(updatedSchedule.interval)} jours`,
      easinessFactor: updatedSchedule.easinessFactor.toFixed(2),
      repetitions: updatedSchedule.repetitions,
    });
  }
}

