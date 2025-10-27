/**
 * Service de chargement des questions compilées
 * Charge les questions depuis compiledQuestions.json et les transforme
 * en format compatible avec l'application
 */

import compiledQuestions from '../data/compiledQuestions.json';
import type { Question } from '../types/pathology';
import type { ParsedQuestion } from './contentParser';

export class CompiledQuestionsLoader {
  private static cachedQuestions: Question[] | null = null;

  /**
   * Charge toutes les questions compilées et les transforme en format Question
   */
  static loadAllQuestions(): Question[] {
    if (this.cachedQuestions) {
      return this.cachedQuestions;
    }

    const questions: Question[] = (compiledQuestions as ParsedQuestion[]).map((pq, index) => ({
      id: pq.id || `compiled_${index}`,
      question: pq.text,
      type: 'QCM' as const,
      options: pq.options || [],
      correct: pq.correctAnswer,
      explanation: pq.explanation || 'Réponse correcte basée sur le contenu du cours.',
      theme: this.mapCategoryToTheme(pq.category),
      difficulty: this.mapDifficultyToNumber(pq.difficulty),
      points: pq.points || 1,
      metadata: {
        pathologyId: pq.sourceModule,
        category: pq.category,
        source: pq.sourceModule,
        tags: pq.tags || []
      }
    }));

    this.cachedQuestions = questions;
    console.log(`✅ ${questions.length} questions compilées chargées depuis compiledQuestions.json`);
    
    return questions;
  }

  /**
   * Charge les questions pour un module spécifique
   */
  static loadQuestionsByModule(moduleId: string): Question[] {
    const allQuestions = this.loadAllQuestions();
    return allQuestions.filter(q => 
      q.metadata.pathologyId?.includes(moduleId) ||
      q.metadata.source?.includes(moduleId)
    );
  }

  /**
   * Charge les questions par catégorie
   */
  static loadQuestionsByCategory(category: string): Question[] {
    const allQuestions = this.loadAllQuestions();
    return allQuestions.filter(q => 
      q.metadata.category === category || 
      q.theme.toLowerCase().includes(category.toLowerCase())
    );
  }

  /**
   * Charge les questions par difficulté
   */
  static loadQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): Question[] {
    const allQuestions = this.loadAllQuestions();
    const difficultyMap = { easy: 1, medium: 2, hard: 3 };
    const targetDifficulty = difficultyMap[difficulty];
    
    return allQuestions.filter(q => 
      Math.abs(q.difficulty - targetDifficulty) <= 0.5
    );
  }

  /**
   * Obtenir des statistiques sur les questions chargées
   */
  static getStatistics(): {
    total: number;
    byCategory: Record<string, number>;
    byModule: Record<string, number>;
    byDifficulty: Record<string, number>;
  } {
    const questions = this.loadAllQuestions();
    
    const stats = {
      total: questions.length,
      byCategory: {} as Record<string, number>,
      byModule: {} as Record<string, number>,
      byDifficulty: {} as Record<string, number>
    };

    questions.forEach(q => {
      // Par catégorie
      const category = q.metadata.category || 'Autre';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Par module
      const module = q.metadata.source || 'Inconnu';
      stats.byModule[module] = (stats.byModule[module] || 0) + 1;

      // Par difficulté
      const diff = q.difficulty < 1.5 ? 'easy' : q.difficulty < 2.5 ? 'medium' : 'hard';
      stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + 1;
    });

    return stats;
  }

  /**
   * Mapper catégorie ParsedQuestion → thème Question
   */
  private static mapCategoryToTheme(category: string): string {
    const mapping: Record<string, string> = {
      'Neurologie': 'Neurologie',
      'Respiratoire': 'Système Respiratoire',
      'Pharmacologie': 'Pharmacologie',
      'Anatomie': 'Anatomie',
      'Général': 'Connaissances Générales',
      'Cardiovasculaire': 'Système Cardiovasculaire',
      'Rénal': 'Système Rénal'
    };

    return mapping[category] || 'Connaissances Générales';
  }

  /**
   * Mapper difficulté string → number
   */
  private static mapDifficultyToNumber(difficulty: 'easy' | 'medium' | 'hard'): number {
    const mapping = {
      'easy': 1,
      'medium': 2,
      'hard': 3
    };

    return mapping[difficulty] || 1;
  }

  /**
   * Réinitialiser le cache (utile pour les tests)
   */
  static clearCache(): void {
    this.cachedQuestions = null;
  }
}

