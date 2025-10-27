/**
 * Extracteur de texte depuis PDFs (native + fallback OCR)
 * Génère les fichiers .txt dans tmp/ocr-cache/
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '../../raw-materials/Concours IADE');
const OUT_DIR = path.join(__dirname, '../../tmp/ocr-cache');

async function extractPdf(file: string) {
  const filepath = path.join(RAW_DIR, file);
  const outpath = path.join(OUT_DIR, file.replace(/\.pdf$/, '.txt'));
  
  console.log(`📄 ${file}`);
  const buffer = fs.readFileSync(filepath);

  // Tentative extraction native
  try {
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    const { text } = await (pdfParse as any)(buffer);
    
    if (text && text.length > 1000) {
      fs.writeFileSync(outpath, text);
      console.log(`  ✅ Texte natif: ${text.length} caractères`);
      return;
    }
  } catch (err) {
    console.log(`  ⚠️  Extraction native échouée, fallback OCR`);
  }

  // TODO: Fallback OCR avec tesseract.js si nécessaire
  console.log(`  ⚠️  OCR non implémenté pour l'instant`);
  fs.writeFileSync(outpath, ''); // Fichier vide temporaire
}

// Point d'entrée
if (import.meta.url.includes('pdfTextExtractor.ts')) {
  (async () => {
    if (!fs.existsSync(RAW_DIR)) {
      console.error(`❌ Dossier introuvable: ${RAW_DIR}`);
      process.exit(1);
    }
    
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }
    
    const pdfs = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.pdf'));
    
    console.log(`🚀 Extraction de ${pdfs.length} PDF(s)\n`);
    
    for (const pdf of pdfs) {
      await extractPdf(pdf);
      console.log('');
    }
    
    console.log('✅ Tous les PDFs traités');
  })().catch(console.error);
}
