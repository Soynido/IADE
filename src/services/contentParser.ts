import { marked } from 'marked';
import DOMPurify from 'dompurify';

export interface ParsedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  sourceModule: string;
  tags: string[];
}

export interface ParsedModule {
  id: string;
  title: string;
  category: 'cours' | 'concours_2024' | 'concours_2025';
  filePath: string;
  questions: ParsedQuestion[];
  metadata: {
    author?: string;
    year: number;
    topics: string[];
  };
}

/**
 * Parse un fichier Markdown et extrait les questions QCM/QROC
 */
export class ContentParser {
  /**
   * Parse le contenu Markdown et extrait les questions
   */
  static parseMarkdown(content: string, moduleId: string, moduleName: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];
    const lines = content.split('\n');
    
    let currentQuestion: Partial<ParsedQuestion> | null = null;
    let currentOptions: string[] = [];
    let questionCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détection d'une nouvelle question
      if (this.isQuestionLine(line)) {
        // Sauvegarder la question précédente si elle existe
        if (currentQuestion && currentOptions.length > 0) {
          questions.push(this.finalizeQuestion(currentQuestion, currentOptions, moduleId, moduleName, questionCounter));
          questionCounter++;
        }
        
        // Commencer une nouvelle question
        currentQuestion = {
          text: this.extractQuestionText(line),
          tags: this.extractTags(line),
        };
        currentOptions = [];
      }
      // Détection des options de réponse
      else if (currentQuestion && this.isOptionLine(line)) {
        currentOptions.push(this.extractOptionText(line));
      }
      // Détection de la réponse correcte
      else if (currentQuestion && this.isCorrectAnswerLine(line)) {
        const correctIndex = this.extractCorrectAnswerIndex(line, currentOptions);
        if (correctIndex !== -1) {
          currentQuestion.correctAnswer = correctIndex;
        }
      }
      // Détection de l'explication
      else if (currentQuestion && this.isExplanationLine(line)) {
        currentQuestion.explanation = this.extractExplanation(line);
      }
    }

    // Sauvegarder la dernière question
    if (currentQuestion && currentOptions.length > 0) {
      questions.push(this.finalizeQuestion(currentQuestion, currentOptions, moduleId, moduleName, questionCounter));
    }

    return questions;
  }

  /**
   * Détecte si une ligne commence une question
   */
  private static isQuestionLine(line: string): boolean {
    // Pattern: "1.", "Question 1:", "Q1.", etc.
    return /^(\d+\.|Question\s+\d+|Q\d+|QCM\s+\d+)[\s:.-]/i.test(line) ||
           /^(#+\s*)Question/.test(line);
  }

  /**
   * Détecte si une ligne est une option de réponse
   */
  private static isOptionLine(line: string): boolean {
    // Pattern: "A)", "a.", "- A", etc.
    return /^([A-Ea-e][\).\]:]\s+|[-*]\s*[A-Ea-e][\).\]:]\s+)/i.test(line);
  }

  /**
   * Détecte si une ligne indique la réponse correcte
   */
  private static isCorrectAnswerLine(line: string): boolean {
    return /^(Réponse|Correct|Answer|Solution)[\s:]/i.test(line) ||
           /^(La réponse correcte est|Bonne réponse)/i.test(line);
  }

  /**
   * Détecte si une ligne contient une explication
   */
  private static isExplanationLine(line: string): boolean {
    return /^(Explication|Justification|Pourquoi)[\s:]/i.test(line);
  }

  /**
   * Extrait le texte de la question
   */
  private static extractQuestionText(line: string): string {
    // Retirer les numéros et préfixes
    return line
      .replace(/^(\d+\.|Question\s+\d+|Q\d+|QCM\s+\d+)[\s:.-]*/i, '')
      .replace(/^(#+\s*)Question[\s:]*/i, '')
      .trim();
  }

  /**
   * Extrait le texte d'une option
   */
  private static extractOptionText(line: string): string {
    return line
      .replace(/^([A-Ea-e][\).\]:]\s+|[-*]\s*[A-Ea-e][\).\]:]\s+)/i, '')
      .trim();
  }

  /**
   * Extrait l'index de la réponse correcte
   */
  private static extractCorrectAnswerIndex(line: string, options: string[]): number {
    const match = line.match(/[A-Ea-e]/i);
    if (!match) return -1;
    
    const letter = match[0].toUpperCase();
    const index = letter.charCodeAt(0) - 'A'.charCodeAt(0);
    
    return index >= 0 && index < options.length ? index : -1;
  }

  /**
   * Extrait l'explication
   */
  private static extractExplanation(line: string): string {
    return line
      .replace(/^(Explication|Justification|Pourquoi)[\s:]*/i, '')
      .trim();
  }

  /**
   * Extrait les tags depuis le texte de la question
   */
  private static extractTags(text: string): string[] {
    const tags: string[] = [];
    
    // Tags médicaux communs
    const medicalKeywords = [
      'anesthésie', 'réanimation', 'pharmacologie', 'anatomie', 
      'physiologie', 'urgence', 'cardiologie', 'neurologie',
      'respiratoire', 'rénal', 'hépatique', 'endocrinien'
    ];
    
    const lowerText = text.toLowerCase();
    for (const keyword of medicalKeywords) {
      if (lowerText.includes(keyword)) {
        tags.push(keyword);
      }
    }
    
    return tags.length > 0 ? tags : ['general'];
  }

  /**
   * Estime la difficulté d'une question
   */
  private static estimateDifficulty(text: string, options: string[]): 'easy' | 'medium' | 'hard' {
    const textLength = text.length;
    const optionsCount = options.length;
    const avgOptionLength = options.reduce((sum, opt) => sum + opt.length, 0) / optionsCount;
    
    // Critères de difficulté
    if (textLength > 200 || avgOptionLength > 100 || optionsCount > 4) {
      return 'hard';
    } else if (textLength > 100 || avgOptionLength > 50) {
      return 'medium';
    }
    
    return 'easy';
  }

  /**
   * Finalise une question avec tous ses attributs
   */
  private static finalizeQuestion(
    partial: Partial<ParsedQuestion>,
    options: string[],
    moduleId: string,
    moduleName: string,
    counter: number
  ): ParsedQuestion {
    const difficulty = this.estimateDifficulty(partial.text || '', options);
    const points = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
    
    return {
      id: `${moduleId}_q${counter + 1}`,
      text: partial.text || 'Question sans texte',
      options,
      correctAnswer: partial.correctAnswer ?? 0,
      explanation: partial.explanation,
      category: this.extractCategory(moduleName),
      difficulty,
      points,
      sourceModule: moduleId,
      tags: partial.tags || ['general'],
    };
  }

  /**
   * Extrait la catégorie depuis le nom du module
   */
  private static extractCategory(moduleName: string): string {
    const lower = moduleName.toLowerCase();
    
    if (lower.includes('neuro')) return 'neurologie';
    if (lower.includes('respir') || lower.includes('pneumo')) return 'respiratoire';
    if (lower.includes('cardio')) return 'cardiologie';
    if (lower.includes('pharmaco') || lower.includes('medic') || lower.includes('antalgique') || lower.includes('antibiotic')) return 'pharmacologie';
    if (lower.includes('anatomie')) return 'anatomie';
    if (lower.includes('urgence')) return 'urgences';
    if (lower.includes('renal') || lower.includes('ira')) return 'néphrologie';
    if (lower.includes('hemovigilance') || lower.includes('transfusion')) return 'hématologie';
    
    return 'general';
  }

  /**
   * Sanitize HTML pour sécurité
   */
  static sanitizeHTML(html: string): string {
    return DOMPurify.sanitize(html);
  }
}
