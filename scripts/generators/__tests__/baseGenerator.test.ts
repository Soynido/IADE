/**
 * Tests unitaires pour BaseQuestionGenerator
 */

import { describe, it, expect } from 'vitest';
import { BaseQuestionGenerator, GeneratorUtils } from '../baseGenerator';
import type { GeneratedQuestion } from '../baseGenerator';

// Générateur de test concret
class TestGenerator extends BaseQuestionGenerator {
  async generate(): Promise<GeneratedQuestion[]> {
    return [
      {
        id: 'test_1',
        type: 'QCM',
        theme: 'Test',
        text: 'Question de test ?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explication de test pour validation.',
        difficulty: 'base',
        themes: ['Test'],
        confidence: 0.9,
        source: 'test-generator'
      }
    ];
  }
}

describe('BaseQuestionGenerator', () => {
  const generator = new TestGenerator();

  it('should generate questions', async () => {
    const questions = await generator.generate();
    expect(questions).toHaveLength(1);
    expect(questions[0].id).toBe('test_1');
  });

  it('should validate question structure', () => {
    const validQuestion: GeneratedQuestion = {
      id: 'q1',
      type: 'QCM',
      theme: 'Neurologie',
      text: 'Quelle est la norme du score de Glasgow ?',
      options: ['3-15', '0-20', '10-30', 'Variable'],
      correctAnswer: 0,
      explanation: 'Le score de Glasgow va de 3 (coma profond) à 15 (conscience normale).',
      difficulty: 'base',
      themes: ['Neurologie'],
      confidence: 0.95,
      source: 'test'
    };

    // @ts-ignore - Accès protected pour test
    expect(generator.validateQuestion(validQuestion)).toBe(true);
  });

  it('should reject invalid questions', () => {
    const invalidQuestion: GeneratedQuestion = {
      id: 'q2',
      type: 'QCM',
      theme: 'Test',
      text: 'Short', // Trop court
      options: ['A'], // Pas assez d'options
      correctAnswer: 0,
      explanation: 'Too short', // Trop court
      difficulty: 'base',
      themes: [],
      confidence: 0.5, // Trop faible
      source: 'test'
    };

    // @ts-ignore - Accès protected pour test
    expect(generator.validateQuestion(invalidQuestion)).toBe(false);
  });

  it('should calculate coherence score', () => {
    const question: GeneratedQuestion = {
      id: 'q3',
      type: 'QCM',
      theme: 'Pharmacologie',
      text: 'Quel est le mécanisme d\'action de la morphine ?',
      options: ['Agoniste mu', 'Antagoniste GABA', 'Inhibiteur COX', 'Bloqueur calcique'],
      correctAnswer: 0,
      explanation: 'La morphine est un agoniste des récepteurs opioïdes mu, entraînant analgésie et dépression respiratoire.',
      difficulty: 'intermediate',
      themes: ['Pharmacologie', 'Analgésie'],
      confidence: 0.92,
      source: 'test'
    };

    // @ts-ignore - Accès protected pour test
    const score = generator.calculateCoherenceScore(question);
    expect(score).toBeGreaterThan(0.8);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});

describe('GeneratorUtils', () => {
  it('should shuffle array', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = GeneratorUtils.shuffle(original);
    
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should sample N elements', () => {
    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const sampled = GeneratorUtils.sample(array, 3);
    
    expect(sampled).toHaveLength(3);
    sampled.forEach(item => {
      expect(array).toContain(item);
    });
  });

  it('should normalize text', () => {
    const text = '  Multiple   spaces   and  trailing  ';
    const normalized = GeneratorUtils.normalizeText(text);
    
    expect(normalized).toBe('Multiple spaces and trailing');
    expect(normalized).not.toMatch(/\s{2,}/);
  });

  it('should extract keywords', () => {
    const text = 'Le score de Glasgow évalue la conscience du patient';
    const keywords = GeneratorUtils.extractKeywords(text);
    
    expect(keywords).toContain('score');
    expect(keywords).toContain('glasgow');
    expect(keywords).toContain('conscience');
    expect(keywords).not.toContain('le'); // Mot court exclu
  });
});


