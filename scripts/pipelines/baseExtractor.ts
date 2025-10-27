import * as path from 'path';
import { PDFProcessor, PDFConversionResult } from '../lib/pdf-processor.js';
import { OCREngine, OCRResult } from '../lib/ocr-engine.js';

/**
 * Interface pour le contenu extrait
 */
export interface ExtractedContent {
  pages: TextBlock[];
  metadata: {
    source: string;
    extractedAt: string;
    totalPages: number;
    averageConfidence: number;
  };
}

export interface TextBlock {
  pageNumber: number;
  text: string;
  confidence: number;
  cleaned: boolean;
}

/**
 * Extracteur de base - Wrapper autour de PDFProcessor + OCREngine
 * Nettoie le texte brut et retourne des blocs structurés
 */
export class BaseExtractor {
  private pdfProcessor: PDFProcessor;
  private ocrEngine: OCREngine;

  constructor() {
    this.pdfProcessor = new PDFProcessor();
    this.ocrEngine = new OCREngine();
  }

  /**
   * Extrait le texte d'un PDF
   */
  async extractFromPDF(pdfPath: string): Promise<ExtractedContent> {
    console.log(`\n📄 Extraction: ${path.basename(pdfPath)}`);
    
    // 1. Convertir PDF en images
    const conversionResult = await this.pdfProcessor.convertPDFToImages(pdfPath);
    
    // 2. Initialiser OCR
    await this.ocrEngine.initialize('fra');
    
    // 3. Extraire le texte de chaque image
    const textBlocks: TextBlock[] = [];
    let totalConfidence = 0;

    for (let i = 0; i < conversionResult.images.length; i++) {
      const imagePath = conversionResult.images[i];
      
      console.log(`\n🔍 Page ${i + 1}/${conversionResult.images.length}`);
      
      // OCR
      const ocrResult: OCRResult = await this.ocrEngine.processWithTesseract(imagePath, {
        language: 'fra',
        preprocessImage: true
      });
      
      // Nettoyer le texte
      const cleanedText = this.cleanText(ocrResult.text);
      
      textBlocks.push({
        pageNumber: i + 1,
        text: cleanedText,
        confidence: ocrResult.confidence,
        cleaned: true
      });
      
      totalConfidence += ocrResult.confidence;
    }
    
    // 4. Calculer confiance moyenne
    const avgConfidence = textBlocks.length > 0 ? totalConfidence / textBlocks.length : 0;
    
    // 5. Nettoyer les images temporaires
    this.pdfProcessor.cleanupDirectory(conversionResult.outputDir);
    
    return {
      pages: textBlocks,
      metadata: {
        source: path.basename(pdfPath),
        extractedAt: new Date().toISOString(),
        totalPages: textBlocks.length,
        averageConfidence: avgConfidence
      }
    };
  }

  /**
   * Nettoie le texte brut imposté par OCR
   */
  private cleanText(text: string): string {
    if (!text) return '';
    
    return text
      // Supprime les espaces multiples
      .replace(/\s+/g, ' ')
      // Supprime les retours à la ligne consécutifs
      .replace(/\n{3,}/g, '\n\n')
      // Fix les caractères mal OCRisés courants
      .replace(/0/g, 'O')
      .replace(/1/g, 'I')
      // Supprime les artefacts de page
      .replace(/^\d+$/gm, '')
      // Trim chaque ligne
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
  }
}

