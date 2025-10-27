import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ContentParser, type ParsedModule, type ParsedQuestion } from '../src/services/contentParser.js';

/**
 * Script de compilation des modules Markdown en JSON
 * Exécuté avant chaque build pour générer compiledQuestions.json
 */

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULES_DIR = path.join(__dirname, '../src/data/modules');
const OUTPUT_FILE = path.join(__dirname, '../src/data/compiledQuestions.json');
const INDEX_FILE = path.join(__dirname, '../src/data/modulesIndex.json');

interface CompilationStats {
  totalModules: number;
  totalQuestions: number;
  questionsByCategory: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
  errors: string[];
}

async function compileContent() {
  console.log('🚀 Compilation des modules Markdown...\n');
  
  const stats: CompilationStats = {
    totalModules: 0,
    totalQuestions: 0,
    questionsByCategory: {},
    questionsByDifficulty: {},
    errors: []
  };

  const allQuestions: ParsedQuestion[] = [];
  const modulesIndex: ParsedModule[] = [];

  try {
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Lire tous les fichiers MD du dossier modules
    if (!fs.existsSync(MODULES_DIR)) {
      console.error(`❌ Erreur: Le dossier ${MODULES_DIR} n'existe pas`);
      process.exit(1);
    }

    const files = fs.readdirSync(MODULES_DIR).filter(f => f.endsWith('.md'));
    
    console.log(`📁 ${files.length} fichiers Markdown trouvés\n`);

    // Parser chaque fichier
    for (const file of files) {
      const filePath = path.join(MODULES_DIR, file);
      const moduleId = path.basename(file, '.md');
      const moduleName = file.replace(/^module_\d+_/, '').replace('.md', '').replace(/_/g, ' ');

      try {
        console.log(`📄 Parsing: ${file}...`);
        
        const content = fs.readFileSync(filePath, 'utf-8');
        const questions = ContentParser.parseMarkdown(content, moduleId, moduleName);

        if (questions.length > 0) {
          allQuestions.push(...questions);
          stats.totalModules++;
          stats.totalQuestions += questions.length;

          // Stats par catégorie
          questions.forEach(q => {
            stats.questionsByCategory[q.category] = (stats.questionsByCategory[q.category] || 0) + 1;
            stats.questionsByDifficulty[q.difficulty] = (stats.questionsByDifficulty[q.difficulty] || 0) + 1;
          });

          // Index du module
          modulesIndex.push({
            id: moduleId,
            title: moduleName,
            category: 'cours', // À déterminer selon le fichier
            filePath: file,
            questions,
            metadata: {
              year: extractYear(file),
              topics: extractTopics(moduleName)
            }
          });

          console.log(`   ✅ ${questions.length} questions extraites`);
        } else {
          console.log(`   ⚠️  Aucune question trouvée`);
          stats.errors.push(`${file}: Aucune question extraite`);
        }
      } catch (error) {
        console.error(`   ❌ Erreur lors du parsing: ${error}`);
        stats.errors.push(`${file}: ${error}`);
      }
    }

    console.log('\n📊 Statistiques de compilation:');
    console.log(`   Modules traités: ${stats.totalModules}/${files.length}`);
    console.log(`   Questions totales: ${stats.totalQuestions}`);
    console.log('\n   Par catégorie:');
    Object.entries(stats.questionsByCategory).forEach(([cat, count]) => {
      console.log(`   - ${cat}: ${count}`);
    });
    console.log('\n   Par difficulté:');
    Object.entries(stats.questionsByDifficulty).forEach(([diff, count]) => {
      console.log(`   - ${diff}: ${count}`);
    });

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Erreurs rencontrées:');
      stats.errors.forEach(err => console.log(`   - ${err}`));
    }

    // Sauvegarder les questions compilées
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allQuestions, null, 2), 'utf-8');
    console.log(`\n✅ Fichier généré: ${OUTPUT_FILE}`);

    // Sauvegarder l'index des modules
    fs.writeFileSync(INDEX_FILE, JSON.stringify(modulesIndex, null, 2), 'utf-8');
    console.log(`✅ Index généré: ${INDEX_FILE}`);

    console.log('\n🎉 Compilation terminée avec succès!\n');

    // Exit avec succès
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur fatale lors de la compilation:', error);
    process.exit(1);
  }
}

/**
 * Extrait l'année depuis le nom du fichier
 */
function extractYear(filename: string): number {
  const match = filename.match(/\d{4}/);
  return match ? parseInt(match[0]) : new Date().getFullYear();
}

/**
 * Extrait les topics depuis le nom du module
 */
function extractTopics(moduleName: string): string[] {
  const topics: string[] = [];
  const keywords = ['neuro', 'respir', 'pharmaco', 'anatomie', 'urgence', 'cardio', 'rénal', 'hémato'];
  
  const lower = moduleName.toLowerCase();
  for (const keyword of keywords) {
    if (lower.includes(keyword)) {
      topics.push(keyword);
    }
  }
  
  return topics.length > 0 ? topics : ['general'];
}

// Lancer la compilation
compileContent();
