/**
 * Interface de base pour tous les générateurs de questions
 * Architecture pluggable pour scalabilité
 */

interface GeneratedQuestion {
  id: string;
  type: 'QCM' | 'QROC' | 'CasClinique';
  theme: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'base' | 'intermediate' | 'advanced';
  themes: string[];
  confidence: number; // 0-1
  source: string;
}

interface GeneratorConfig {
  minConfidence?: number;
  maxQuestionsPerRun?: number;
  targetDifficulty?: 'base' | 'intermediate' | 'advanced';
  themes?: string[];
}

export type { GeneratedQuestion, GeneratorConfig };

/**
 * Classe de base abstraite pour tous les générateurs
 */
export abstract class BaseQuestionGenerator {
  protected config: GeneratorConfig;

  constructor(config: GeneratorConfig = {}) {
    this.config = {
      minConfidence: config.minConfidence || 0.7,
      maxQuestionsPerRun: config.maxQuestionsPerRun || 10,
      targetDifficulty: config.targetDifficulty || 'base',
      themes: config.themes || []
    };
  }

  /**
   * Méthode abstraite à implémenter par chaque générateur
   */
  abstract generate(context: any): Promise<GeneratedQuestion[]>;

  /**
   * Valide la cohérence d'une question générée
   */
  protected validateQuestion(question: GeneratedQuestion): boolean {
    // Vérifications de base
    if (!question.text || question.text.length < 10) return false;
    if (!question.options || question.options.length < 2) return false;
    if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) return false;
    if (!question.explanation || question.explanation.length < 20) return false;
    if (question.confidence < this.config.minConfidence!) return false;

    // Vérifier que les options sont distinctes
    const uniqueOptions = new Set(question.options);
    if (uniqueOptions.size !== question.options.length) return false;

    // Vérifier que la question se termine par un point d'interrogation
    if (!question.text.includes('?')) return false;

    return true;
  }

  /**
   * Calcule un score de cohérence pour une question
   */
  protected calculateCoherenceScore(question: GeneratedQuestion): number {
    let score = 1.0;

    // Pénalités
    if (question.text.length < 30) score -= 0.1;
    if (question.text.length > 300) score -= 0.1;
    if (question.options.length < 3) score -= 0.2;
    if (question.options.length > 6) score -= 0.1;
    if (question.explanation.length < 50) score -= 0.2;

    // Bonus
    if (question.themes.length > 1) score += 0.1;
    if (question.explanation.includes('car') || question.explanation.includes('parce que')) score += 0.1;

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Génère un ID unique pour une question
   */
  protected generateQuestionId(prefix: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Filtre les questions selon les critères de configuration
   */
  protected filterQuestions(questions: GeneratedQuestion[]): GeneratedQuestion[] {
    return questions
      .filter(q => this.validateQuestion(q))
      .filter(q => q.confidence >= this.config.minConfidence!)
      .slice(0, this.config.maxQuestionsPerRun);
  }
}

/**
 * Utilitaires communs pour les générateurs
 */
export class GeneratorUtils {
  /**
   * Mélange un tableau
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Sélectionne N éléments aléatoires d'un tableau
   */
  static sample<T>(array: T[], n: number): T[] {
    const shuffled = this.shuffle(array);
    return shuffled.slice(0, Math.min(n, array.length));
  }

  /**
   * Normalise un texte (supprime espaces multiples, trim, etc.)
   */
  static normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\s+([?.:;!])/g, '$1')
      .trim();
  }

  /**
   * Extrait les concepts clés d'un texte
   */
  static extractKeywords(text: string, minLength: number = 4): string[] {
    const words = text
      .toLowerCase()
      .replace(/[^\w\sàâäéèêëïîôùûüÿæœç]/g, '')
      .split(/\s+/)
      .filter(w => w.length >= minLength);

    // Supprimer les mots courants
    const stopWords = new Set(['dans', 'avec', 'pour', 'sont', 'être', 'avoir', 'faire', 'cette', 'cette', 'quel', 'quelle']);
    return words.filter(w => !stopWords.has(w));
  }
}

