import Tesseract, { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export interface OCROptions {
  useGoogleVision?: boolean;
  language?: string;
  preprocessImage?: boolean;
}

/**
 * Moteur OCR utilisant Tesseract.js avec prétraitement d'images
 */
export class OCREngine {
  private worker: Tesseract.Worker | null = null;
  private initialized = false;

  /**
   * Initialise le worker Tesseract
   */
  async initialize(language = 'fra'): Promise<void> {
    if (this.initialized) return;

    const spinner = ora('Initialisation du moteur OCR...').start();
    
    try {
      this.worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            spinner.text = `OCR en cours... ${Math.round(m.progress * 100)}%`;
          }
        },
      });

      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO,
        tessedit_char_whitelist: '',
      });

      this.initialized = true;
      spinner.succeed('Moteur OCR initialisé');
    } catch (error) {
      spinner.fail('Échec initialisation OCR');
      throw error;
    }
  }

  /**
   * Prétraite une image pour améliorer la qualité de l'OCR
   */
  async preprocessImage(imagePath: string): Promise<string> {
    const outputPath = path.join(
      path.dirname(imagePath),
      `preprocessed_${path.basename(imagePath)}`
    );

    try {
      await sharp(imagePath)
        .resize(3000, null, { // Augmente la résolution
          fit: 'inside',
          withoutEnlargement: false,
        })
        .greyscale() // Convertit en niveaux de gris
        .normalize() // Normalise le contraste
        .sharpen() // Améliore la netteté
        .png({ quality: 100 })
        .toFile(outputPath);

      return outputPath;
    } catch (error) {
      console.warn('⚠️ Prétraitement impossible, utilisation image originale');
      return imagePath;
    }
  }

  /**
   * Effectue l'OCR avec Tesseract
   */
  async processWithTesseract(
    imagePath: string,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    if (!this.initialized) {
      await this.initialize(options.language || 'fra');
    }

    let processedImagePath = imagePath;

    // Prétraitement de l'image si demandé
    if (options.preprocessImage !== false) {
      const spinner = ora('Prétraitement de l\'image...').start();
      processedImagePath = await this.preprocessImage(imagePath);
      spinner.succeed('Image prétraitée');
    }

    const spinner = ora('Extraction du texte...').start();

    try {
      const { data } = await this.worker!.recognize(processedImagePath);
      
      spinner.succeed(`Texte extrait (confiance: ${Math.round(data.confidence)}%)`);

      // Nettoyage du fichier prétraité
      if (processedImagePath !== imagePath && fs.existsSync(processedImagePath)) {
        fs.unlinkSync(processedImagePath);
      }

      return {
        text: data.text,
        confidence: data.confidence,
        language: options.language || 'fra',
      };
    } catch (error) {
      spinner.fail('Erreur lors de l\'OCR');
      
      // Nettoyage en cas d'erreur
      if (processedImagePath !== imagePath && fs.existsSync(processedImagePath)) {
        fs.unlinkSync(processedImagePath);
      }
      
      throw error;
    }
  }

  /**
   * Effectue l'OCR avec Google Vision API (optionnel)
   * Note: Nécessite une clé API Google Cloud Vision
   */
  async processWithGoogleVision(imagePath: string): Promise<OCRResult> {
    // TODO: Implémenter Google Vision API si nécessaire
    // Pour l'instant, on retourne une erreur explicite
    throw new Error(
      'Google Vision API non implémentée. Utilisez Tesseract ou contribuez à l\'implémentation !'
    );
  }

  /**
   * Traite une image avec le moteur approprié
   */
  async processImage(
    imagePath: string,
    options: OCROptions = {}
  ): Promise<OCRResult> {
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Fichier introuvable: ${imagePath}`);
    }

    if (options.useGoogleVision) {
      return this.processWithGoogleVision(imagePath);
    }

    return this.processWithTesseract(imagePath, options);
  }

  /**
   * Termine le worker Tesseract
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }
}

