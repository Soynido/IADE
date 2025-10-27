import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { BaseExtractor } from './pipelines/baseExtractor.js';
import { peekText } from './pipelines/debugPeek.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testExtraction() {
  console.log('🧪 TEST EXTRACTION - Inspection du texte brut\n');
  
  const pdfPath = path.join(__dirname, '../raw-materials/Concours IADE/annalescorrigées-Volume-1.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ PDF introuvable:', pdfPath);
    process.exit(1);
  }
  
  console.log(`📄 Test sur: ${path.basename(pdfPath)}\n`);
  
  const extractor = new BaseExtractor();
  const extracted = await extractor.extractFromPDF(pdfPath);
  
  // Extraire le texte brut de toutes les pages
  const allText = extracted.pages.map(p => p.text).join('\n\n');
  
  // Peek pour inspecter
  peekText(allText, 'ANNALES-VOLUME-1', 3000);
  
  // Sauvegarder le texte brut
  const outputPath = path.join(__dirname, '../tmp/extracted-text-sample.txt');
  fs.writeFileSync(outputPath, allText, 'utf-8');
  
  console.log(`✅ Texte brut sauvegardé dans: ${outputPath}`);
  console.log(`📊 Pages extraites: ${extracted.pages.length}`);
  console.log(`📊 Caractères totaux: ${allText.length}`);
}

testExtraction().catch(console.error);

