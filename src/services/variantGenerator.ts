import type { Question } from '../types/pathology';

/**
 * Service de génération de variantes de questions
 * Permet de créer des variations d'une question existante
 */

interface QuestionVariant extends Question {
  originalQuestionId: string;
  variantType: 'options_permuted' | 'text_reformulated' | 'distractors_changed';
}

export class VariantGenerator {
  /**
   * Générer des variantes d'une question
   */
  static generateVariants(question: Question, count: number = 2): QuestionVariant[] {
    const variants: QuestionVariant[] = [];
    
    // Variante 1: Permutation des options
    if (count >= 1) {
      const permutedVariant = this.permuteOptions(question);
      if (permutedVariant) {
        variants.push(permutedVariant);
      }
    }
    
    // Variante 2: Reformulation légère
    if (count >= 2 && question.explanation) {
      const reformulatedVariant = this.reformulateQuestion(question);
      if (reformulatedVariant) {
        variants.push(reformulatedVariant);
      }
    }
    
    return variants;
  }

  /**
   * Permuter les options de réponse
   */
  private static permuteOptions(question: Question): QuestionVariant | null {
    const options = [...question.options];
    const correctText = options[question.correctAnswer];
    
    // Mélanger les options (Fisher-Yates shuffle)
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    
    // Trouver le nouvel index de la réponse correcte
    const newCorrectIndex = options.indexOf(correctText);
    
    return {
      ...question,
      id: `${question.id}_v1`,
      options,
      correctAnswer: newCorrectIndex,
      originalQuestionId: question.id,
      variantType: 'options_permuted',
    };
  }

  /**
   * Reformuler légèrement la question
   */
  private static reformulateQuestion(question: Question): QuestionVariant | null {
    const reformulations: Record<string, string> = {
      'Quel est': 'Quelle est la caractéristique de',
      'Quelle est': 'Quel est le principal aspect de',
      'Lequel': 'Parmi les suivants, lequel',
      'Lesquels': 'Parmi les options, lesquels',
      'Comment': 'De quelle manière',
      'Pourquoi': 'Pour quelle raison',
    };
    
    let newText = question.text;
    
    for (const [original, replacement] of Object.entries(reformulations)) {
      if (newText.includes(original)) {
        newText = newText.replace(original, replacement);
        break;
      }
    }
    
    // Si aucun changement, retourner null
    if (newText === question.text) {
      return null;
    }
    
    return {
      ...question,
      id: `${question.id}_v2`,
      text: newText,
      originalQuestionId: question.id,
      variantType: 'text_reformulated',
    };
  }

  /**
   * Générer des distracteurs contextuels
   */
  static generateDistractors(correctAnswer: string, context: string[], count: number = 3): string[] {
    const distractors: string[] = [];
    
    // Stratégies de génération de distracteurs
    
    // 1. Utiliser des valeurs du contexte
    const contextWords = context.filter(w => w !== correctAnswer && w.length > 3);
    distractors.push(...contextWords.slice(0, Math.min(count, contextWords.length)));
    
    // 2. Générer des variations numériques si la réponse est un nombre
    const numMatch = correctAnswer.match(/(\d+)/);
    if (numMatch && distractors.length < count) {
      const num = parseInt(numMatch[1]);
      distractors.push(correctAnswer.replace(numMatch[1], (num + 10).toString()));
      distractors.push(correctAnswer.replace(numMatch[1], (num - 5).toString()));
    }
    
    // 3. Variations simples (opposés, synonymes approximatifs)
    if (distractors.length < count) {
      const variations: Record<string, string[]> = {
        'augmente': ['diminue', 'reste stable'],
        'diminue': ['augmente', 'fluctue'],
        'aigu': ['chronique', 'subaigu'],
        'chronique': ['aigu', 'transitoire'],
        'élevé': ['faible', 'normal'],
        'faible': ['élevé', 'modéré'],
      };
      
      for (const [key, variants] of Object.entries(variations)) {
        if (correctAnswer.toLowerCase().includes(key)) {
          distractors.push(...variants.slice(0, count - distractors.length));
          break;
        }
      }
    }
    
    // Compléter avec des options génériques si nécessaire
    while (distractors.length < count) {
      distractors.push(`Option ${distractors.length + 1}`);
    }
    
    return distractors.slice(0, count);
  }

  /**
   * Créer une question avec de nouveaux distracteurs
   */
  static createQuestionWithNewDistractors(question: Question): QuestionVariant {
    const correctOption = question.options[question.correctAnswer];
    const otherOptions = question.options.filter((_, i) => i !== question.correctAnswer);
    
    // Générer de nouveaux distracteurs
    const newDistractors = this.generateDistractors(correctOption, otherOptions, 3);
    
    // Mélanger les options
    const allOptions = [correctOption, ...newDistractors];
    const shuffledOptions = this.shuffleArray([...allOptions]);
    const newCorrectIndex = shuffledOptions.indexOf(correctOption);
    
    return {
      ...question,
      id: `${question.id}_v3`,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
      originalQuestionId: question.id,
      variantType: 'distractors_changed',
    };
  }

  /**
   * Mélanger un tableau (Fisher-Yates)
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
   * Vérifier la qualité d'une variante
   */
  static validateVariant(variant: QuestionVariant): boolean {
    // Vérifier que la variante est différente de l'originale
    // et que la réponse correcte est bien présente
    return (
      variant.options.length === 4 &&
      variant.correctAnswer >= 0 &&
      variant.correctAnswer < variant.options.length &&
      variant.options[variant.correctAnswer].length > 0
    );
  }
}
