import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interface pour les questions générées
 */
interface GeneratedQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  themes: string[];
  difficultyLevel: 'base' | 'intermediate' | 'advanced';
  source: string;
  generatedAt: string;
}

interface GeneratedQuestions {
  questions: GeneratedQuestion[];
  metadata: {
    generatedAt: string;
    source: string;
    totalQuestions: number;
  };
}

/**
 * Générateur intelligent de questions basé sur les annales
 */
export class IntelligentQuestionGenerator {
  private questionHashes: Set<string> = new Set();
  private generatedQuestions: GeneratedQuestion[] = [];

  /**
   * Génère des questions à partir des annales
   */
  async generate(source: 'ocr' | 'native' = 'ocr'): Promise<GeneratedQuestions> {
    console.log('\n🎯 GÉNÉRATEUR DE QUESTIONS INTELLIGENT\n');
    console.log('════════════════════════════════════════════════════════════════\n');

    const concoursDir = path.join(__dirname, '../src/data/concours');
    
    // Charger les données
    const annalesV1 = this.loadAnnales(path.join(concoursDir, 'annales-volume-1.json'));
    const annalesV2 = this.loadAnnales(path.join(concoursDir, 'annales-volume-2.json'));

    console.log(`📚 Sources chargées :`);
    console.log(`   - Annales V1 : ${annalesV1.examSets.length} série(s)`);
    console.log(`   - Annales V2 : ${annalesV2.examSets.length} série(s)\n`);

    // Traiter les annales existantes
    await this.processAnnales(annalesV1, 'annales-v1');
    await this.processAnnales(annalesV2, 'annales-v2');

    console.log(`\n✅ Questions générées : ${this.generatedQuestions.length}\n`);

    return {
      questions: this.generatedQuestions,
      metadata: {
        generatedAt: new Date().toISOString(),
        source,
        totalQuestions: this.generatedQuestions.length
      }
    };
  }

  /**
   * Charge les annales
   */
  private loadAnnales(filePath: string): any {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier introuκεvable: ${path.basename(filePath)}`);
      return { examSets: [] };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  /**
   * Traite les annales et génère des questions
   */
  private async processAnnales(annales: any, sourceLabel: string): Promise<void> {
    for (const examSet of annales.examSets) {
      for (const question of examSet.questions) {
        // Vérifier qu'on n'a pas déjà cette question
        const hash = this.hashQuestion(question.text);
        
        if (!this.questionHashes.has(hash)) {
          this.questionHashes.add(hash);
          
          // Ajouter la question originale
          this.generatedQuestions.push({
            id: question.id,
            prompt: question.text,
            options: question.options || [],
            correctAnswer: typeof question.correctAnswer === 'number' ? question.correctAnswer : 0,
            explanation: question.correction?.explanation || '',
            themes: question.themes || [],
            difficultyLevel: question.difficultyLevel || 'base',
            source: `${sourceLabel} (original)`,
            generatedAt: new Date().toISOString()
          });
        }
      }
    }

    // Générer des variantes si possible
    // TODO: Implémenter génération de variantes avec distracteurs
  }

  /**
   * Hash une question pour détecter les doublons
   */
  private hashQuestion(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);
  }

  /**
   * Sauvegarde les questions générées
   */
  async save(questions: GeneratedQuestions): Promise<void> {
    const outputPath = path.join(__dirname, '../src/data/concours/generated-questions.json');
    
    fs.writeFileSync(
      outputPath,
      JSON.stringify(questions, null, 2),
      'utf-8'
    );
    
    console.log(`✅ Questions sauvegardées: ${outputPath}`);
    console.log(`   📊 Taille: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB\n`);
  }
}

// Exécution si appelé directement
async function main() {
  const generator = new IntelligentQuestionGenerator();
  
  const source = (process.argv[2] === '--source' && process.argv[3]) || 'ocr';
  
  const questions = await generator.generate(source as any);
  await generator.save(questions);
  
  // Health check
  if (questions.questions.length < 50) {
    console.log('⚠️  AVERTISSEMENT: Peu de questions générées, parsers nécessitent affinage');
  } else {
    console.log('✅ Questions validées (volume suffisant)');
  }
}

if (import.meta.url.includes('generateIntelligentQuestions.ts')) {
  main().catch(console.error);
}
