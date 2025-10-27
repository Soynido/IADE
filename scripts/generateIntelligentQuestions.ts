import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { IntelligentQuestionGenerator } from '../src/services/intelligentQuestionGenerator.js';
import type { ParsedQuestion } from '../src/services/contentParser.js';

/**
 * Script de génération automatique de questions depuis les modules MD
 * Utilise les patterns identifiés dans les concours IADE
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MODULES_DIR = path.join(__dirname, '../src/data/modules');
const OUTPUT_FILE = path.join(__dirname, '../src/data/generatedQuestions.json');
const COMPILED_FILE = path.join(__dirname, '../src/data/compiledQuestions.json');

interface GenerationStats {
  totalModules: number;
  totalQuestions: number;
  questionsByModule: Record<string, number>;
  questionsByType: Record<string, number>;
  questionsByDifficulty: Record<string, number>;
  errors: string[];
}

async function generateQuestions() {
  console.log('🧠 Générateur Intelligent de Questions IADE\n');
  console.log('════════════════════════════════════════════════════════════════\n');

  const stats: GenerationStats = {
    totalModules: 0,
    totalQuestions: 0,
    questionsByModule: {},
    questionsByType: {},
    questionsByDifficulty: {},
    errors: []
  };

  const allQuestions: ParsedQuestion[] = [];

  try {
    // Lire tous les fichiers MD
    if (!fs.existsSync(MODULES_DIR)) {
      console.error(`❌ Erreur: Le dossier ${MODULES_DIR} n'existe pas`);
      process.exit(1);
    }

    const files = fs.readdirSync(MODULES_DIR)
      .filter(f => f.endsWith('.md') && f.startsWith('module_'));

    console.log(`📁 ${files.length} modules de cours trouvés\n`);

    // Traiter chaque module
    for (const file of files) {
      const filePath = path.join(MODULES_DIR, file);
      const moduleId = path.basename(file, '.md');
      const moduleName = file
        .replace(/^module_\d+_/, '')
        .replace('.md', '')
        .replace(/_/g, ' ');

      try {
        console.log(`\n📄 Traitement: ${moduleName}`);
        console.log(`   Fichier: ${file}`);

        // Lire le contenu
        const content = fs.readFileSync(filePath, 'utf-8');

        // Générer les questions
        console.log('   🔍 Analyse du contenu et extraction des concepts...');
        const questions = IntelligentQuestionGenerator.generateQuestionsFromModule(
          content,
          moduleId,
          moduleName
        );

        if (questions.length > 0) {
          allQuestions.push(...questions);
          stats.totalModules++;
          stats.totalQuestions += questions.length;
          stats.questionsByModule[moduleName] = questions.length;

          // Stats par type et difficulté
          questions.forEach(q => {
            const category = q.category || 'Général';
            stats.questionsByType[category] = (stats.questionsByType[category] || 0) + 1;
            stats.questionsByDifficulty[q.difficulty] = (stats.questionsByDifficulty[q.difficulty] || 0) + 1;
          });

          console.log(`   ✅ ${questions.length} questions générées`);
          
          // Afficher un aperçu
          if (questions.length > 0) {
            console.log(`   📌 Exemple: "${questions[0].text.substring(0, 60)}..."`);
          }
        } else {
          console.log(`   ⚠️  Aucune question générée (contenu non structuré)`);
          stats.errors.push(`${file}: Contenu non adapté à la génération automatique`);
        }

      } catch (error) {
        console.error(`   ❌ Erreur: ${error}`);
        stats.errors.push(`${file}: ${error}`);
      }
    }

    // Afficher les statistiques
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('📊 STATISTIQUES DE GÉNÉRATION');
    console.log('════════════════════════════════════════════════════════════════\n');
    
    console.log(`✅ Modules traités: ${stats.totalModules}/${files.length}`);
    console.log(`✅ Questions générées: ${stats.totalQuestions}\n`);

    console.log('📚 Par module:');
    Object.entries(stats.questionsByModule)
      .sort((a, b) => b[1] - a[1])
      .forEach(([module, count]) => {
        const bar = '█'.repeat(Math.ceil(count / 5));
        console.log(`   ${module.padEnd(40)} ${bar} ${count}`);
      });

    console.log('\n🏷️  Par catégorie:');
    Object.entries(stats.questionsByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type.padEnd(20)} ${count}`);
      });

    console.log('\n📊 Par difficulté:');
    Object.entries(stats.questionsByDifficulty).forEach(([diff, count]) => {
      const emoji = diff === 'easy' ? '🟢' : diff === 'medium' ? '🟡' : '🔴';
      console.log(`   ${emoji} ${diff.padEnd(10)} ${count}`);
    });

    if (stats.errors.length > 0) {
      console.log('\n⚠️  Avertissements:');
      stats.errors.forEach(err => console.log(`   - ${err}`));
    }

    // Sauvegarder les questions générées
    console.log('\n════════════════════════════════════════════════════════════════');
    console.log('💾 SAUVEGARDE DES QUESTIONS');
    console.log('════════════════════════════════════════════════════════════════\n');

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allQuestions, null, 2), 'utf-8');
    console.log(`✅ Questions générées sauvegardées: ${OUTPUT_FILE}`);
    console.log(`   ${stats.totalQuestions} questions prêtes à l'emploi\n`);

    // Fusionner avec compiledQuestions.json existant
    let existingQuestions: ParsedQuestion[] = [];
    if (fs.existsSync(COMPILED_FILE)) {
      try {
        const existing = fs.readFileSync(COMPILED_FILE, 'utf-8');
        existingQuestions = JSON.parse(existing);
        console.log(`📄 ${existingQuestions.length} questions existantes trouvées`);
      } catch (error) {
        console.warn('   ⚠️  Impossible de lire compiledQuestions.json existant');
      }
    }

    // Fusionner (dédupliquer par ID)
    const existingIds = new Set(existingQuestions.map(q => q.id));
    const newQuestions = allQuestions.filter(q => !existingIds.has(q.id));
    const mergedQuestions = [...existingQuestions, ...newQuestions];

    fs.writeFileSync(COMPILED_FILE, JSON.stringify(mergedQuestions, null, 2), 'utf-8');
    console.log(`✅ Questions fusionnées dans: ${COMPILED_FILE}`);
    console.log(`   Total: ${mergedQuestions.length} questions (${existingQuestions.length} existantes + ${newQuestions.length} nouvelles)\n`);

    // Résumé final
    console.log('════════════════════════════════════════════════════════════════');
    console.log('🎉 GÉNÉRATION TERMINÉE AVEC SUCCÈS !');
    console.log('════════════════════════════════════════════════════════════════\n');

    console.log(`📦 Livrables:`);
    console.log(`   1. ${stats.totalQuestions} questions générées automatiquement`);
    console.log(`   2. ${Object.keys(stats.questionsByType).length} catégories couvertes`);
    console.log(`   3. ${mergedQuestions.length} questions totales disponibles dans l'application\n`);

    console.log(`💡 Prochaines étapes:`);
    console.log(`   1. Relancer l'application: npm run dev`);
    console.log(`   2. Tester les nouvelles questions dans les quiz`);
    console.log(`   3. Vérifier la qualité des questions générées`);
    console.log(`   4. Ajuster les patterns si nécessaire\n`);

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error);
    process.exit(1);
  }
}

// Lancer la génération
console.log('🚀 Démarrage de la génération intelligente de questions...\n');
generateQuestions();

