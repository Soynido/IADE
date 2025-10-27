/**
 * Script d'extraction de texte depuis les PDFs
 * Sauvegarde les .txt dans tmp/ocr-cache pour exploitation par extractQuestions.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RAW_DIR = path.join(__dirname, '../../raw-materials/Concours IADE');
const OUT_DIR = path.join(__dirname, '../../tmp/ocr-cache');

async function extractTextFromPDF(file: string) {
  const filepath = path.join(RAW_DIR, file);
  const outputPath = path.join(OUT_DIR, file.replace(/\.pdf$/, '.txt'));
  
  console.log(`📄 Extraction: ${file}`);
  
  try {
    const buffer = fs.readFileSync(filepath);
    
    // Tentative extraction native
    try {
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await (pdfParse as any)(buffer);
      
      if (data.text && data.text.trim().length > 500) {
        fs.writeFileSync(outputPath, data.text);
        console.log(`✅ Texte natif extrait (${data.text.length} caractères)`);
        return;
      }
    } catch (err) {
      console.log(`⚠️  Extraction native échouée: ${err}`);
    }
    
    // TODO: Fallback OCR si nécessaire
    console.log(`⚠️  Extraction trop courte, nécessite OCR (non implémenté)`);
    fs.writeFileSync(outputPath, ''); // Fichier vide
    
  } catch (error: any) {
    console.error(`❌ Erreur: ${error.message}`);
  }
}

// Point d'entrée
if (import.meta.url.includes('extractPdfToText.ts')) {
  (async () => {
    // Créer le dossier de sortie
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }
    
    // Vérifier le dossier source
    if (!fs.existsSync(RAW_DIR)) {
      console.error(`❌ Dossier introuvable: ${RAW_DIR}`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.pdf'));
    
    if (files.length === 0) {
      console.error(`❌ Aucun PDF trouvé dans ${RAW_DIR}`);
      process.exit(1);
    }
    
    console.log(`🚀 Extraction de ${files.length} PDF(s)\n`);
    
    for (const file of files) {
      await extractTextFromPDF(file);
      console.log('');
    }
    
    console.log(`✅ Tous les PDFs traités\n`);
  })().catch(console.error);
}

