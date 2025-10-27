import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Interface pour le contenu extrait directement depuis le PDF
 */
export interface ExtractedTextContent {
  pages: TextBlock[];
  metadata: {
    source: string;
    extractedAt: string;
    totalPages: number;
    method: 'native';
  };
}

export interface TextBlock {
  pageNumber: number;
  text: string;
  cleaned: boolean;
}

/**
 * Extracteur de texte natif depuis PDF (sans OCR)
 * Utilise pdf-parse pour extraire directement le texte
 */
export class PDFTextExtractor {
  
  /**
   * Extrait le texte d'un PDF natif
   */
  async extractFromPDF(pdfPath: string): Promise<ExtractedTextContent> {
    console.log(`\n📄 Extraction native: ${path.basename(pdfPath)}`);
    
    try {
      // Lire le fichier PDF
      const pdfBuffer = fs.readFileSync(pdfPath);
      
      // Installer pdf-parse si nécessaire
      const pdfParseModule = await import('pdf-parse');
      const pdfParse = pdfParseModule.default;
      
      // Parser le PDF (version simplifiée)
      const data = await pdfParse(pdfBuffer);
      
      // Extraire les pages
      const textBlocks: TextBlock[] = [];
      const pages = data.numpages;
      
      // Pour une extraction correcte par page, on doit parser manuellement
      // Pour l'instant, on divise grossièrement le texte
      const allText = data.text;
      const approxCharsPerPage = Math.ceil(allText.length / pages);
      
      for (let i = 0; i < pages; i++) {
        const start = i * approxCharsPerPage;
        const end = Math.min((i + 1) * approxCharsPerPage, allText.length);
        const pageText = allText.substring(start, end);
        
        textBlocks.push({
          pageNumber: i + 1,
          text: this.cleanText(pageText),
          cleaned: true
        });
      }
      
      console.log(`✅ ${pages} page(s) extraite(s)`);
      
      return {
        pages: textBlocks,
        metadata: {
          source: path.basename(pdfPath),
          extractedAt: new Date().toISOString(),
          totalPages: pages,
          method: 'native'
        }
      };
      
    } catch (error: any) {
      console.error(`❌ Erreur: ${error.message}`);
      throw error;
    }
  }

  /**
   * Nettoie le texte extrait
   */
  private cleanText(text: string): string {
    if (!text) return '';
    
    return text
      // Supprime les espaces multiples
      .replace(/\s+/g, ' ')
      // Supprime les retours à la ligne consécutifs
      .replace(/\n{3,}/g, '\n\n')
      // Trim chaque ligne
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }
}

