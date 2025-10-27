import type { CompiledQuestion } from '../types/module';

/**
 * Moteur d'entrelacement (interleaving) pour optimiser la rétention
 * 
 * Principes appliqués:
 * - Alterner les thèmes pour éviter le blocage thématique
 * - Mélanger les difficultés dans un ratio optimal
 * - Espacer les questions similaires (spacing effect)
 * - Détecter et corriger les patterns monotones
 */
export class InterleavingEngine {
  // Ratio optimal de difficultés
  private static readonly DIFFICULTY_RATIO = {
    Facile: 0.30,    // 30%
    Moyen: 0.50,     // 50%
    Difficile: 0.20, // 20%
  };

  // Minimum de questions à espacer entre questions similaires
  private static readonly MIN_SPACING = 4;

  // Maximum de questions consécutives du même thème
  private static readonly MAX_THEME_CONSECUTIVE = 2;

  /**
   * Applique l'interleaving à une liste de questions
   */
  static applyInterleaving(questions: CompiledQuestion[]): CompiledQuestion[] {
    if (questions.length <= 3) {
      return questions; // Trop peu pour interleaver
    }

    // Étape 1: Grouper par thème et difficulté
    const grouped = this.groupQuestions(questions);

    // Étape 2: Construire une séquence équilibrée
    const interleaved = this.buildInterleavedSequence(grouped, questions.length);

    // Étape 3: Appliquer spacing effect (espacer questions similaires)
    const spaced = this.applySpacingEffect(interleaved);

    // Étape 4: Vérifier et corriger les patterns monotones
    const final = this.fixMonotonePatterns(spaced);

    return final;
  }

  /**
   * Groupe les questions par thème et difficulté
   */
  private static groupQuestions(questions: CompiledQuestion[]): {
    [key: string]: CompiledQuestion[];
  } {
    const groups: { [key: string]: CompiledQuestion[] } = {};

    questions.forEach(q => {
      const key = `${q.theme}_${q.difficulty}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(q);
    });

    // Mélanger chaque groupe
    Object.keys(groups).forEach(key => {
      groups[key] = this.shuffle(groups[key]);
    });

    return groups;
  }

  /**
   * Construit une séquence entrelacée équilibrée
   */
  private static buildInterleavedSequence(
    grouped: { [key: string]: CompiledQuestion[] },
    targetLength: number
  ): CompiledQuestion[] {
    const result: CompiledQuestion[] = [];
    const allGroups = Object.keys(grouped);
    
    if (allGroups.length === 0) {
      return [];
    }

    // Créer des pools par difficulté
    const easyPool: CompiledQuestion[] = [];
    const mediumPool: CompiledQuestion[] = [];
    const hardPool: CompiledQuestion[] = [];

    Object.entries(grouped).forEach(([key, questions]) => {
      if (key.includes('Facile')) {
        easyPool.push(...questions);
      } else if (key.includes('Moyen')) {
        mediumPool.push(...questions);
      } else if (key.includes('Difficile')) {
        hardPool.push(...questions);
      }
    });

    // Calculer combien de questions de chaque difficulté
    const targetEasy = Math.floor(targetLength * this.DIFFICULTY_RATIO.Facile);
    const targetMedium = Math.floor(targetLength * this.DIFFICULTY_RATIO.Moyen);
    const targetHard = Math.floor(targetLength * this.DIFFICULTY_RATIO.Difficile);

    // Sélectionner les questions selon le ratio
    const selectedEasy = this.shuffle(easyPool).slice(0, targetEasy);
    const selectedMedium = this.shuffle(mediumPool).slice(0, targetMedium);
    const selectedHard = this.shuffle(hardPool).slice(0, targetHard);

    // Entrelacer les difficultés: pattern répétitif mais varié
    // Exemple: M M E M H M M E M M E D ...
    const pattern = ['Moyen', 'Moyen', 'Facile', 'Moyen', 'Difficile'];
    let easyIndex = 0;
    let mediumIndex = 0;
    let hardIndex = 0;
    let patternIndex = 0;

    while (result.length < targetLength) {
      const difficulty = pattern[patternIndex % pattern.length];
      patternIndex++;

      let question: CompiledQuestion | undefined;

      if (difficulty === 'Facile' && easyIndex < selectedEasy.length) {
        question = selectedEasy[easyIndex++];
      } else if (difficulty === 'Moyen' && mediumIndex < selectedMedium.length) {
        question = selectedMedium[mediumIndex++];
      } else if (difficulty === 'Difficile' && hardIndex < selectedHard.length) {
        question = selectedHard[hardIndex++];
      } else {
        // Fallback: prendre n'importe quelle question disponible
        if (mediumIndex < selectedMedium.length) {
          question = selectedMedium[mediumIndex++];
        } else if (easyIndex < selectedEasy.length) {
          question = selectedEasy[easyIndex++];
        } else if (hardIndex < selectedHard.length) {
          question = selectedHard[hardIndex++];
        }
      }

      if (question) {
        result.push(question);
      } else {
        break; // Plus de questions disponibles
      }
    }

    return result;
  }

  /**
   * Applique le spacing effect: espace les questions similaires
   */
  private static applySpacingEffect(questions: CompiledQuestion[]): CompiledQuestion[] {
    const result: CompiledQuestion[] = [...questions];
    let modified = true;
    let iterations = 0;
    const maxIterations = 10;

    while (modified && iterations < maxIterations) {
      modified = false;
      iterations++;

      for (let i = 0; i < result.length; i++) {
        const current = result[i];

        // Vérifier si une question similaire est trop proche
        for (let j = i + 1; j < Math.min(i + this.MIN_SPACING, result.length); j++) {
          const other = result[j];

          if (this.areSimilar(current, other)) {
            // Trouver une position plus loin pour échanger
            const swapTarget = this.findSafeSwapPosition(result, j, current);
            
            if (swapTarget !== -1) {
              // Échanger
              [result[j], result[swapTarget]] = [result[swapTarget], result[j]];
              modified = true;
              break;
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Vérifie si deux questions sont similaires
   */
  private static areSimilar(q1: CompiledQuestion, q2: CompiledQuestion): boolean {
    // Même thème ET même pathologie
    if (q1.theme === q2.theme && q1.pathology === q2.pathology) {
      return true;
    }

    // Même source module
    if (q1.sourceModule === q2.sourceModule) {
      return true;
    }

    // Questions liées
    if (q1.relatedQuestions.includes(q2.id) || q2.relatedQuestions.includes(q1.id)) {
      return true;
    }

    return false;
  }

  /**
   * Trouve une position sûre pour échanger (pas de similarité proche)
   */
  private static findSafeSwapPosition(
    questions: CompiledQuestion[],
    currentPos: number,
    targetQuestion: CompiledQuestion
  ): number {
    // Chercher une position au moins MIN_SPACING positions plus loin
    for (let i = currentPos + this.MIN_SPACING; i < questions.length; i++) {
      // Vérifier que la nouvelle position n'est pas proche de questions similaires
      let isSafe = true;

      for (let j = Math.max(0, i - this.MIN_SPACING); j < Math.min(questions.length, i + this.MIN_SPACING); j++) {
        if (j !== currentPos && this.areSimilar(targetQuestion, questions[j])) {
          isSafe = false;
          break;
        }
      }

      if (isSafe) {
        return i;
      }
    }

    return -1; // Pas de position sûre trouvée
  }

  /**
   * Détecte et corrige les patterns monotones
   */
  private static fixMonotonePatterns(questions: CompiledQuestion[]): CompiledQuestion[] {
    const result: CompiledQuestion[] = [...questions];
    
    // Vérifier les séquences de thèmes
    for (let i = 0; i < result.length - this.MAX_THEME_CONSECUTIVE; i++) {
      const theme = result[i].theme;
      let consecutive = 1;

      // Compter les questions consécutives du même thème
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].theme === theme) {
          consecutive++;
        } else {
          break;
        }
      }

      // Si trop de questions consécutives, échanger une avec une plus loin
      if (consecutive > this.MAX_THEME_CONSECUTIVE) {
        const swapPos = i + this.MAX_THEME_CONSECUTIVE;
        
        // Trouver une question d'un thème différent plus loin
        for (let k = swapPos + 2; k < result.length; k++) {
          if (result[k].theme !== theme) {
            [result[swapPos], result[k]] = [result[k], result[swapPos]];
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Mélange un tableau (Fisher-Yates)
   */
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Analyse la qualité de l'interleaving d'une séquence
   */
  static analyzeInterleavingQuality(questions: CompiledQuestion[]): {
    score: number;  // 0-100
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let penalties = 0;

    // 1. Vérifier le ratio de difficultés
    const counts = {
      Facile: questions.filter(q => q.difficulty === 'Facile').length,
      Moyen: questions.filter(q => q.difficulty === 'Moyen').length,
      Difficile: questions.filter(q => q.difficulty === 'Difficile').length,
    };

    const total = questions.length;
    const ratios = {
      Facile: counts.Facile / total,
      Moyen: counts.Moyen / total,
      Difficile: counts.Difficile / total,
    };

    if (Math.abs(ratios.Facile - this.DIFFICULTY_RATIO.Facile) > 0.15) {
      issues.push(`Ratio de questions faciles déséquilibré (${(ratios.Facile * 100).toFixed(0)}% au lieu de 30%)`);
      penalties += 15;
    }

    // 2. Vérifier les séquences monotones
    let maxConsecutiveSameTheme = 0;
    let currentTheme = '';
    let currentCount = 0;

    questions.forEach(q => {
      if (q.theme === currentTheme) {
        currentCount++;
        maxConsecutiveSameTheme = Math.max(maxConsecutiveSameTheme, currentCount);
      } else {
        currentTheme = q.theme;
        currentCount = 1;
      }
    });

    if (maxConsecutiveSameTheme > this.MAX_THEME_CONSECUTIVE) {
      issues.push(`Trop de questions consécutives du même thème (${maxConsecutiveSameTheme})`);
      penalties += 20;
      recommendations.push('Mieux entrelacer les thèmes');
    }

    // 3. Vérifier le spacing des questions similaires
    let similarTooClose = 0;
    for (let i = 0; i < questions.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + this.MIN_SPACING, questions.length); j++) {
        if (this.areSimilar(questions[i], questions[j])) {
          similarTooClose++;
        }
      }
    }

    if (similarTooClose > 0) {
      issues.push(`${similarTooClose} paires de questions similaires trop proches`);
      penalties += similarTooClose * 5;
      recommendations.push('Espacer davantage les questions similaires');
    }

    const score = Math.max(0, 100 - penalties);

    if (score >= 80) {
      recommendations.push('Excellente qualité d\'interleaving !');
    } else if (score >= 60) {
      recommendations.push('Bonne qualité, quelques ajustements possibles');
    } else {
      recommendations.push('Interleaving à améliorer significativement');
    }

    return { score, issues, recommendations };
  }
}

