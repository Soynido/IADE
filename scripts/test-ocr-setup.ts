import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { OCREngine } from './lib/ocr-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script de test pour valider l'installation de l'agent OCR
 */
async function testOCRSetup() {
  console.log('🧪 Test de l\'installation de l\'agent OCR\n');
  console.log('='.repeat(60));

  const results: { test: string; status: '✅' | '❌'; message?: string }[] = [];

  // Test 1: Vérifier les dossiers
  console.log('\n📁 Test 1: Vérification des dossiers...');
  try {
    const projectRoot = path.join(__dirname, '..');
    const requiredDirs = [
      'raw-materials',
      'raw-materials/cours',
      'raw-materials/concours-2024',
      'raw-materials/concours-2025',
      'scripts/lib',
      'tmp/ocr-cache',
      'src/data/modules',
    ];

    for (const dir of requiredDirs) {
      const dirPath = path.join(projectRoot, dir);
      if (!fs.existsSync(dirPath)) {
        throw new Error(`Dossier manquant: ${dir}`);
      }
    }

    results.push({ test: 'Structure des dossiers', status: '✅' });
    console.log('✅ Tous les dossiers sont présents');
  } catch (error) {
    results.push({
      test: 'Structure des dossiers',
      status: '❌',
      message: String(error),
    });
    console.error('❌ Erreur:', error);
  }

  // Test 2: Vérifier les modules OCR
  console.log('\n🔧 Test 2: Vérification des modules OCR...');
  try {
    const modules = [
      'ocr-engine.ts',
      'pdf-processor.ts',
      'markdown-formatter.ts',
      'diagram-detector.ts',
    ];

    for (const module of modules) {
      const modulePath = path.join(__dirname, 'lib', module);
      if (!fs.existsSync(modulePath)) {
        throw new Error(`Module manquant: ${module}`);
      }
    }

    results.push({ test: 'Modules OCR', status: '✅' });
    console.log('✅ Tous les modules sont présents');
  } catch (error) {
    results.push({
      test: 'Modules OCR',
      status: '❌',
      message: String(error),
    });
    console.error('❌ Erreur:', error);
  }

  // Test 3: Tester l'initialisation du moteur OCR
  console.log('\n🤖 Test 3: Initialisation du moteur OCR...');
  try {
    const ocrEngine = new OCREngine();
    await ocrEngine.initialize('fra');
    await ocrEngine.terminate();

    results.push({ test: 'Moteur OCR (Tesseract)', status: '✅' });
    console.log('✅ Moteur OCR initialisé avec succès');
  } catch (error) {
    results.push({
      test: 'Moteur OCR (Tesseract)',
      status: '❌',
      message: String(error),
    });
    console.error('❌ Erreur:', error);
  }

  // Test 4: Vérifier les dépendances npm
  console.log('\n📦 Test 4: Vérification des dépendances...');
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const requiredDeps = [
      'tesseract.js',
      'pdf2pic',
      'sharp',
      'inquirer',
      'commander',
      'chokidar',
      'node-notifier',
      'cli-progress',
      'ora',
    ];

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const dep of requiredDeps) {
      if (!allDeps[dep]) {
        throw new Error(`Dépendance manquante: ${dep}`);
      }
    }

    results.push({ test: 'Dépendances npm', status: '✅' });
    console.log('✅ Toutes les dépendances sont installées');
  } catch (error) {
    results.push({
      test: 'Dépendances npm',
      status: '❌',
      message: String(error),
    });
    console.error('❌ Erreur:', error);
  }

  // Test 5: Vérifier les scripts npm
  console.log('\n⚙️ Test 5: Vérification des scripts npm...');
  try {
    const packageJsonPath = path.join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

    const requiredScripts = [
      'ocr',
      'ocr:batch-cours',
      'ocr:batch-2024',
      'ocr:batch-2025',
      'watch',
      'compile',
    ];

    for (const script of requiredScripts) {
      if (!packageJson.scripts[script]) {
        throw new Error(`Script manquant: ${script}`);
      }
    }

    results.push({ test: 'Scripts npm', status: '✅' });
    console.log('✅ Tous les scripts npm sont configurés');
  } catch (error) {
    results.push({
      test: 'Scripts npm',
      status: '❌',
      message: String(error),
    });
    console.error('❌ Erreur:', error);
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));

  results.forEach(result => {
    console.log(
      `${result.status} ${result.test}${result.message ? `: ${result.message}` : ''}`
    );
  });

  const totalTests = results.length;
  const passedTests = results.filter(r => r.status === '✅').length;

  console.log('\n' + '='.repeat(60));
  console.log(`🎯 Résultat: ${passedTests}/${totalTests} tests réussis`);
  console.log('='.repeat(60));

  if (passedTests === totalTests) {
    console.log('\n✅ Installation validée ! L\'agent OCR est prêt à l\'emploi.');
    console.log('\n💡 Pour commencer:');
    console.log('   1. Placez vos PDFs dans raw-materials/cours/');
    console.log('   2. Lancez: npm run watch');
    console.log('   3. Ou: npm run ocr -- --input <fichier>\n');
  } else {
    console.log('\n⚠️ Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    console.log('💡 Essayez: npm install\n');
    process.exit(1);
  }
}

// Exécution
testOCRSetup().catch(error => {
  console.error('\n❌ Erreur fatale lors des tests:', error);
  process.exit(1);
});

