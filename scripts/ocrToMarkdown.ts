import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import { OCREngine } from './lib/ocr-engine.js';
import { PDFProcessor } from './lib/pdf-processor.js';
import { MarkdownFormatter } from './lib/markdown-formatter.js';
import { DiagramDetector } from './lib/diagram-detector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..');
const RAW_MATERIALS_DIR = path.join(PROJECT_ROOT, 'raw-materials');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'data', 'modules');

interface ProcessingStats {
  filesProcessed: number;
  pagesProcessed: number;
  diagramsAdded: number;
  errors: Array<{ file: string; error: string }>;
  duration: number;
}

/**
 * Agent OCR - Convertit PDFs et images en Markdown structuré
 */
class OCRAgent {
  private ocrEngine: OCREngine;
  private pdfProcessor: PDFProcessor;
  private stats: ProcessingStats;

  constructor() {
    this.ocrEngine = new OCREngine();
    this.pdfProcessor = new PDFProcessor();
    this.stats = {
      filesProcessed: 0,
      pagesProcessed: 0,
      diagramsAdded: 0,
      errors: [],
      duration: 0,
    };
  }

  /**
   * Traite un fichier unique
   */
  async processFile(
    filePath: string,
    options: {
      category?: 'cours' | 'concours_2024' | 'concours_2025';
      outputName?: string;
      interactive?: boolean;
      dryRun?: boolean;
    }
  ): Promise<void> {
    const startTime = Date.now();

    console.log(`\n${'='.repeat(70)}`);
    console.log(`📄 Traitement: ${path.basename(filePath)}`);
    console.log(`${'='.repeat(70)}\n`);

    try {
      let imagePaths: string[] = [];
      let cleanupDir: string | null = null;

      // Étape 1: Conversion PDF → Images si nécessaire
      if (this.pdfProcessor.isPDF(filePath)) {
        const result = await this.pdfProcessor.convertPDFToImages(filePath);
        imagePaths = result.images;
        cleanupDir = result.outputDir;
      } else if (this.pdfProcessor.isImage(filePath)) {
        imagePaths = [filePath];
      } else {
        throw new Error('Format de fichier non supporté');
      }

      // Étape 2: OCR sur chaque image
      await this.ocrEngine.initialize('fra');

      const formatter = new MarkdownFormatter({
        title: this.generateTitle(filePath),
        source: path.basename(filePath),
        category: options.category || this.detectCategory(filePath),
        extractedAt: new Date().toISOString().split('T')[0],
      });

      console.log(`\n🔍 Extraction du texte (${imagePaths.length} page(s))...\n`);

      for (let i = 0; i < imagePaths.length; i++) {
        const imagePath = imagePaths[i];
        
        try {
          const result = await this.ocrEngine.processImage(imagePath, {
            preprocessImage: true,
          });

          formatter.addPage(result.text, i + 1);
          this.stats.pagesProcessed++;
        } catch (error) {
          console.error(`❌ Erreur page ${i + 1}:`, error);
          formatter.addPage('_Erreur lors de l\'extraction_', i + 1);
          this.stats.errors.push({
            file: filePath,
            error: `Page ${i + 1}: ${error}`,
          });
        }
      }

      // Étape 3: Génération du Markdown
      console.log('\n📝 Génération du Markdown...\n');
      let markdown = formatter.generateMarkdown();

      // Étape 4: Détection et génération de diagrammes
      if (options.interactive !== false) {
        const detector = new DiagramDetector(true);
        const result = await detector.processDetections(markdown);
        markdown = result.text;
        this.stats.diagramsAdded += result.diagramsAdded;
      }

      // Étape 5: Sauvegarde
      if (!options.dryRun) {
        const outputFilename =
          options.outputName ||
          MarkdownFormatter.generateModuleFilename(
            path.basename(filePath),
            options.category || this.detectCategory(filePath)
          );

        const outputPath = path.join(OUTPUT_DIR, outputFilename);

        if (!fs.existsSync(OUTPUT_DIR)) {
          fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        fs.writeFileSync(outputPath, markdown, 'utf-8');
        console.log(`\n✅ Fichier créé: ${outputFilename}`);
        console.log(`   📂 ${outputPath}\n`);
      } else {
        console.log('\n🔍 Mode Dry-run: Aperçu du contenu:\n');
        console.log(markdown.substring(0, 500));
        console.log('\n...\n');
      }

      // Nettoyage
      if (cleanupDir) {
        this.pdfProcessor.cleanupDirectory(cleanupDir);
      }

      await this.ocrEngine.terminate();

      this.stats.filesProcessed++;
      this.stats.duration = Date.now() - startTime;

      this.printStats();
    } catch (error) {
      console.error(`\n❌ Erreur lors du traitement de ${filePath}:`, error);
      this.stats.errors.push({
        file: filePath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Traite un dossier en lot
   */
  async processBatch(
    dirPath: string,
    options: {
      category?: 'cours' | 'concours_2024' | 'concours_2025';
      interactive?: boolean;
      dryRun?: boolean;
    }
  ): Promise<void> {
    if (!fs.existsSync(dirPath)) {
      console.error(`❌ Dossier introuvable: ${dirPath}`);
      return;
    }

    const files = fs
      .readdirSync(dirPath)
      .filter(
        f =>
          f.endsWith('.pdf') ||
          f.endsWith('.png') ||
          f.endsWith('.jpg') ||
          f.endsWith('.jpeg')
      )
      .map(f => path.join(dirPath, f));

    if (files.length === 0) {
      console.log('⚠️ Aucun fichier PDF/image trouvé dans ce dossier');
      return;
    }

    console.log(`\n📚 Traitement par lot: ${files.length} fichier(s)\n`);

    for (let i = 0; i < files.length; i++) {
      console.log(`\n[${i + 1}/${files.length}]`);
      await this.processFile(files[i], options);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Traitement par lot terminé !');
    console.log('='.repeat(70));
    this.printStats();
  }

  /**
   * Détecte automatiquement la catégorie selon le chemin
   */
  private detectCategory(
    filePath: string
  ): 'cours' | 'concours_2024' | 'concours_2025' {
    const lower = filePath.toLowerCase();

    if (lower.includes('concours-2024') || lower.includes('concours_2024')) {
      return 'concours_2024';
    }

    if (lower.includes('concours-2025') || lower.includes('concours_2025')) {
      return 'concours_2025';
    }

    return 'cours';
  }

  /**
   * Génère un titre à partir du nom de fichier
   */
  private generateTitle(filePath: string): string {
    const basename = path.basename(filePath, path.extname(filePath));
    
    return basename
      .replace(/[_-]/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Affiche les statistiques
   */
  private printStats(): void {
    console.log('\n📊 Statistiques:');
    console.log('─'.repeat(50));
    console.log(`📄 Fichiers traités: ${this.stats.filesProcessed}`);
    console.log(`📃 Pages extraites: ${this.stats.pagesProcessed}`);
    console.log(`📊 Diagrammes ajoutés: ${this.stats.diagramsAdded}`);
    console.log(`⏱️  Durée: ${Math.round(this.stats.duration / 1000)}s`);

    if (this.stats.errors.length > 0) {
      console.log(`\n⚠️ Erreurs: ${this.stats.errors.length}`);
      this.stats.errors.forEach(err => {
        console.log(`   - ${err.file}: ${err.error}`);
      });
    }
    console.log('');
  }
}

/**
 * CLI Principal
 */
async function main() {
  const program = new Command();

  program
    .name('ocr-to-markdown')
    .description('Agent OCR - Convertit PDFs et images en Markdown structuré')
    .version('1.0.0');

  program
    .option('-i, --input <path>', 'Fichier ou dossier à traiter')
    .option('-o, --output <name>', 'Nom du fichier de sortie (optionnel)')
    .option(
      '-c, --category <type>',
      'Catégorie (cours|concours_2024|concours_2025)'
    )
    .option('-b, --batch <dir>', 'Traitement par lot d\'un dossier')
    .option('--no-interactive', 'Désactiver le mode interactif')
    .option('--dry-run', 'Prévisualisation sans écriture')
    .option('--google-api', 'Utiliser Google Vision API (non implémenté)');

  program.parse();

  const options = program.opts();

  // Vérification des dossiers
  if (!fs.existsSync(RAW_MATERIALS_DIR)) {
    console.log('📁 Création du dossier raw-materials...');
    fs.mkdirSync(RAW_MATERIALS_DIR, { recursive: true });
    fs.mkdirSync(path.join(RAW_MATERIALS_DIR, 'cours'), { recursive: true });
    fs.mkdirSync(path.join(RAW_MATERIALS_DIR, 'concours-2024'), {
      recursive: true,
    });
    fs.mkdirSync(path.join(RAW_MATERIALS_DIR, 'concours-2025'), {
      recursive: true,
    });
    console.log('✅ Structure créée\n');
  }

  const agent = new OCRAgent();

  // Mode batch
  if (options.batch) {
    const dirPath = path.isAbsolute(options.batch)
      ? options.batch
      : path.join(PROJECT_ROOT, options.batch);

    await agent.processBatch(dirPath, {
      category: options.category,
      interactive: options.interactive,
      dryRun: options.dryRun,
    });
    return;
  }

  // Mode fichier unique
  if (options.input) {
    const filePath = path.isAbsolute(options.input)
      ? options.input
      : path.join(PROJECT_ROOT, options.input);

    await agent.processFile(filePath, {
      category: options.category,
      outputName: options.output,
      interactive: options.interactive,
      dryRun: options.dryRun,
    });
    return;
  }

  // Aucune option: afficher l'aide
  console.log('⚠️ Aucun fichier spécifié. Utilisez --input ou --batch\n');
  program.help();
}

// Exécution
main().catch(error => {
  console.error('\n❌ Erreur fatale:', error);
  process.exit(1);
});

