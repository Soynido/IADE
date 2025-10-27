import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { BaseExtractor } from './baseExtractor.js';
import { PDFTextExtractor } from './pdfTextExtractor.js';
import { CourseParser, StructuredCourse } from './courseParser.js';
import { AnnalesParser, StructuredAnnales } from './annalesParser.js';
import { CorrectionParser } from './correctionParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Manager principal pour orchestrer l'extraction complète
 */
export class PipelineManager {
  private baseExtractor: BaseExtractor;
  private pdfTextExtractor: PDFTextExtractor;
  private courseParser: CourseParser;
  private annalesParserV1: AnnalesParser;
  private annalesParserV2: AnnalesParser;
  private correctionParser: CorrectionParser;

  constructor() {
    this.baseExtractor = new BaseExtractor();
    this.pdfTextExtractor = new PDFTextExtractor();
    this.courseParser = new CourseParser();
    this.annalesParserV1 = new AnnalesParser(1);
    this.annalesParserV2 = new AnnalesParser(2);
    this.correctionParser = new CorrectionParser();
  }

  /**
   * Traite tous les PDFs du dossier Concours IADE
   */
  async processAll(): Promise<void> {
    const startTime = Date.now();
    
    console.log('\n🚀 PIPELINE D\'EXTRACTION IADE\n');
    console.log('════════════════════════════════════════════════════════════════\n');

    const pdfsDir = path.join(__dirname, '../../raw-materials/Concours IADE');
    
    if (!fs.existsSync(pdfsDir)) {
      console.error(`❌ Dossier introuvable: ${pdfsDir}`);
      process.exit(1);
    }

    const pdfFiles = fs.readdirSync(pdfsDir)
      .filter(f => f.endsWith('.pdf'))
      .map(f => path.join(pdfsDir, f));

    console.log(`📁 ${pdfFiles.length} fichier(s) PDF trouvé(s)\n`);

    // Créer le dossier de sortie
    const outputDir = path.join(__dirname, '../../src/data/concours');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Throttling : traiter 2 PDFs à la fois pour éviter les freezes
    const limit = 2;
    for (let i = 0; i < pdfFiles.length; i += limit) {
      const batch = pdfFiles.slice(i, i + limit);
      await Promise.all(batch.map(pdfPath => this.processPDF(pdfPath, outputDir)));
    }

    console.log('\n════════════════════════════════════════════════════════════════');
    
    // Health check final (outputDir déjà défini plus haut)
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('✅ Extraction terminée !');
    console.log(`\n⏱️  Durée totale : ${duration}s\n`);
    
    // Afficher les fichiers générés
    if (fs.existsSync(outputDir)) {
      const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        console.log('📁 Fichiers générés :');
        for (const file of files) {
          const filePath = path.join(outputDir, file);
          const size = (fs.statSync(filePath).size / 1e6).toFixed(2);
          console.log(`   - ${file} (${size} MB)`);
        }
      }
    }
  }

  /**
   * Traite un PDF unique
   */
  private async processPDF(pdfPath: string, outputDir: string): Promise<void> {
    const filename = path.basename(pdfPath);
    console.log(`\n📄 Traitement: ${filename}`);
    console.log(`${'─'.repeat(60)}`);

    try {
      // 1. Extraction du texte (native d'abord, puis OCR si échec)
      let extractedContent;
      try {
        console.log('  🔍 Tentative extraction native...');
        extractedContent = await this.pdfTextExtractor.extractFromPDF(pdfPath);
      } catch (error: any) {
        console.log('  ⚠️  Extraction native échouée, passage à OCR...');
        extractedContent = await this.baseExtractor.extractFromPDF(pdfPath);
      }

      // 2. Auto-détection du type de PDF
      const pdfType = this.detectPDFType(filename, extractedContent);

      console.log(`📊 Type détecté: ${pdfType}`);

      // 3. Parsing selon le type
      let outputPath: string;
      let outputData: any;

      switch (pdfType) {
        case 'cours':
          outputData = this.courseParser.parse(extractedContent);
          outputPath = path.join(outputDir, 'cours-complet.json');
          break;

        case 'annales_v1':
          outputData = this.annalesParserV1.parse(extractedContent);
          outputPath = path.join(outputDir, 'annales-volume-1.json');
          break;

        case 'annales_v2':
          outputData = this.annalesParserV2.parse(extractedContent);
          outputPath = path.join(outputDir, 'annales-volume-2.json');
          break;

        default:
          console.log(`⚠️  Type non reconnu, passage du parseur`);
          return;
      }

      // 4. Sauvegarder le JSON
      fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

      console.log(`✅ Sauvegardé: ${path.basename(outputPath)}`);
      console.log(`   📈 Confiance moyenne: ${extractedContent.metadata.averageConfidence.toFixed(1)}%`);

    } catch (error: any) {
      console.error(`❌ Erreur lors du traitement de ${filename}:`, error.message);
    }
  }

  /**
   * Détecte automatiquement le type de PDF
   */
  private detectPDFType(filename: string, content: ExtractedContent): 'cours' | 'annales_v1' | 'annales_v2' | 'unknown' {
    // Détection par nom de fichier
    if (filename.includes('Prepaconcours') || filename.includes('Complet')) {
      return 'cours';
    }
    
    if (filename.includes('Volume-1') || filename.includes('volume-1') || filename.includes('volume1')) {
      return 'annales_v1';
    }
    
    if (filename.includes('Volume-2') || filename.includes('volume-2') || filename.includes('volume2')) {
      return 'annales_v2';
    }

    // Détection par contenu
    const firstPagesText = content.pages
      .slice(0, 3)
      .map(p => p.text.toLowerCase())
      .join('\n');

    if (firstPagesText.includes('chapitre') || firstPagesText.includes('cours')) {
      return 'cours';
    }

    if (firstPagesText.includes('volume 1') || firstPagesText.includes('première')) {
      return 'annales_v1';
    }

    if (firstPagesText.includes('volume 2') || firstPagesText.includes('deuxième')) {
      return 'annales_v2';
    }

    return 'unknown';
  }
}

// Exécution si appelé directement
const manager = new PipelineManager();
manager.processAll().catch(console.error);

