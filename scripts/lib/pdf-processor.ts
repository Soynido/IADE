import { fromPath } from 'pdf2pic';
import * as fs from 'fs';
import * as path from 'path';
import ora from 'ora';
import cliProgress from 'cli-progress';

export interface PDFProcessorOptions {
  density?: number;
  format?: 'png' | 'jpg';
  width?: number;
  height?: number;
  outputDir?: string;
}

export interface PDFConversionResult {
  images: string[];
  totalPages: number;
  outputDir: string;
}

/**
 * Processeur pour convertir des PDFs en images
 */
export class PDFProcessor {
  private defaultOptions: Required<PDFProcessorOptions> = {
    density: 300, // DPI
    format: 'png',
    width: 3000,
    height: 4000,
    outputDir: path.join(process.cwd(), 'tmp', 'ocr-cache'),
  };

  /**
   * Convertit un PDF en images PNG
   */
  async convertPDFToImages(
    pdfPath: string,
    options: PDFProcessorOptions = {}
  ): Promise<PDFConversionResult> {
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF introuvable: ${pdfPath}`);
    }

    const opts = { ...this.defaultOptions, ...options };
    const pdfName = path.basename(pdfPath, path.extname(pdfPath));
    const outputDir = path.join(opts.outputDir, `${pdfName}_${Date.now()}`);

    // Créer le dossier de sortie
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const spinner = ora(`Conversion du PDF: ${pdfName}...`).start();

    try {
      const converter = fromPath(pdfPath, {
        density: opts.density,
        format: opts.format,
        width: opts.width,
        height: opts.height,
        savePath: outputDir,
        saveFilename: pdfName,
      });

      // Obtenir le nombre de pages
      const firstPageResult = await converter(1, { responseType: 'image' });
      
      if (!firstPageResult) {
        throw new Error('Impossible de lire le PDF');
      }

      spinner.stop();

      // Estimer le nombre de pages (heuristique basée sur la taille du fichier)
      const stats = fs.statSync(pdfPath);
      const estimatedPages = Math.max(1, Math.ceil(stats.size / (1024 * 100))); // ~100KB par page

      const progressBar = new cliProgress.SingleBar({
        format: 'Conversion |{bar}| {percentage}% | Page {value}/{total}',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true,
      });

      progressBar.start(estimatedPages, 0);

      const images: string[] = [];
      let pageNumber = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const result = await converter(pageNumber, { responseType: 'image' });
          
          if (result && result.path) {
            images.push(result.path);
            progressBar.update(pageNumber);
            pageNumber++;
          } else {
            hasMorePages = false;
          }
        } catch (error) {
          // Fin du PDF atteinte
          hasMorePages = false;
        }
      }

      progressBar.stop();

      const totalPages = images.length;
      console.log(`✅ PDF converti: ${totalPages} page(s) → ${outputDir}`);

      return {
        images,
        totalPages,
        outputDir,
      };
    } catch (error) {
      spinner.fail('Erreur lors de la conversion du PDF');
      throw error;
    }
  }

  /**
   * Nettoie un dossier temporaire
   */
  cleanupDirectory(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          this.cleanupDirectory(filePath);
        } else {
          fs.unlinkSync(filePath);
        }
      }
      
      fs.rmdirSync(dirPath);
    }
  }

  /**
   * Nettoie tous les fichiers temporaires
   */
  cleanupAllTemp(): void {
    const tempDir = this.defaultOptions.outputDir;
    
    if (fs.existsSync(tempDir)) {
      const dirs = fs.readdirSync(tempDir);
      
      for (const dir of dirs) {
        const dirPath = path.join(tempDir, dir);
        
        if (fs.statSync(dirPath).isDirectory()) {
          this.cleanupDirectory(dirPath);
        }
      }
      
      console.log('🧹 Fichiers temporaires nettoyés');
    }
  }

  /**
   * Vérifie si un fichier est un PDF
   */
  isPDF(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.pdf';
  }

  /**
   * Vérifie si un fichier est une image
   */
  isImage(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.tiff'].includes(ext);
  }
}

