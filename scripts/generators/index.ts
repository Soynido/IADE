/**
 * Point d'entrée pour tous les générateurs de questions
 * Architecture pluggable permettant d'ajouter facilement de nouveaux générateurs
 */

import { BaseQuestionGenerator } from './baseGenerator';
import type { GeneratedQuestion, GeneratorConfig } from './baseGenerator';
import { DefinitionGenerator } from './definitionGenerator';
import { QCMGenerator } from './qcmGenerator';
import * as fs from 'fs';
import * as path from 'path';

export class QuestionGeneratorOrchestrator {
  private generators: BaseQuestionGenerator[] = [];

  constructor() {
    // Enregistrer tous les générateurs disponibles
    this.registerGenerator(new DefinitionGenerator());
    this.registerGenerator(new QCMGenerator());
    // Ajouter d'autres générateurs ici au fur et à mesure
  }

  registerGenerator(generator: BaseQuestionGenerator) {
    this.generators.push(generator);
  }

  /**
   * Génère des questions avec tous les générateurs
   */
  async generateAll(config?: GeneratorConfig): Promise<GeneratedQuestion[]> {
    const allQuestions: GeneratedQuestion[] = [];

    for (const generator of this.generators) {
      try {
        const questions = await generator.generate({});
        allQuestions.push(...questions);
        console.log(`✅ ${generator.constructor.name}: ${questions.length} questions générées`);
      } catch (error) {
        console.error(`❌ Erreur avec ${generator.constructor.name}:`, error);
      }
    }

    return allQuestions;
  }

  /**
   * Sauvegarde les questions générées
   */
  async saveQuestions(questions: GeneratedQuestion[], outputPath: string) {
    const data = {
      questions,
      metadata: {
        generatedAt: new Date().toISOString(),
        totalQuestions: questions.length,
        byType: this.countByType(questions),
        byTheme: this.countByTheme(questions),
        byDifficulty: this.countByDifficulty(questions)
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`\n💾 ${questions.length} questions sauvegardées: ${outputPath}`);
  }

  private countByType(questions: GeneratedQuestion[]) {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      counts[q.type] = (counts[q.type] || 0) + 1;
    });
    return counts;
  }

  private countByTheme(questions: GeneratedQuestion[]) {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      counts[q.theme] = (counts[q.theme] || 0) + 1;
    });
    return counts;
  }

  private countByDifficulty(questions: GeneratedQuestion[]) {
    const counts: Record<string, number> = {};
    questions.forEach(q => {
      counts[q.difficulty] = (counts[q.difficulty] || 0) + 1;
    });
    return counts;
  }
}

// Script d'exécution
async function main() {
  console.log('\n🤖 GÉNÉRATEURS DE QUESTIONS INTELLIGENTS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const orchestrator = new QuestionGeneratorOrchestrator();

  const questions = await orchestrator.generateAll({
    minConfidence: 0.8,
    maxQuestionsPerRun: 10
  });

  console.log(`\n✅ Total: ${questions.length} questions générées`);

  // Sauvegarder
  const outputPath = path.join(process.cwd(), 'src/data/concours/generated-questions-v2.json');
  await orchestrator.saveQuestions(questions, outputPath);

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS\n');
}

// Exécuter si appelé directement
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const isMain = process.argv[1] === __filename;

if (isMain) {
  main().catch(console.error);
}

export { BaseQuestionGenerator, GeneratedQuestion, GeneratorConfig };
export { DefinitionGenerator } from './definitionGenerator';
export { QCMGenerator } from './qcmGenerator';

