import * as path from 'path';

export interface MarkdownMetadata {
  title: string;
  source: string;
  category: 'cours' | 'concours_2024' | 'concours_2025';
  extractedAt: string;
}

export interface FormattingOptions {
  detectTables?: boolean;
  detectLists?: boolean;
  detectFormulas?: boolean;
  preserveLineBreaks?: boolean;
}

/**
 * Formateur intelligent pour structurer le texte OCR en Markdown
 */
export class MarkdownFormatter {
  private pageTexts: string[] = [];
  private metadata: MarkdownMetadata;

  constructor(metadata: MarkdownMetadata) {
    this.metadata = metadata;
  }

  /**
   * Ajoute le texte d'une page
   */
  addPage(text: string, pageNumber: number): void {
    this.pageTexts.push(text);
  }

  /**
   * Détecte et formate les titres
   */
  private detectAndFormatTitles(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (!line) {
        formattedLines.push('');
        continue;
      }

      // Détection des titres en majuscules (potentiellement des titres de section)
      if (line === line.toUpperCase() && line.length > 3 && line.length < 100) {
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : '';
        
        // Si la ligne suivante est vide ou courte, c'est probablement un titre
        if (!nextLine || nextLine.length < 50) {
          formattedLines.push(`## ${this.toTitleCase(line)}`);
          formattedLines.push('');
          continue;
        }
      }

      // Détection des titres avec numérotation (1., 2., A., I., etc.)
      const titleNumberPattern = /^([IVX]+|\d+|[A-Z])\.\s+(.+)$/;
      const titleMatch = line.match(titleNumberPattern);
      
      if (titleMatch && line.length < 100) {
        formattedLines.push(`### ${titleMatch[2]}`);
        formattedLines.push('');
        continue;
      }

      formattedLines.push(line);
    }

    return formattedLines.join('\n');
  }

  /**
   * Convertit un texte en MAJUSCULES en TitleCase
   */
  private toTitleCase(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Détecte et formate les listes
   */
  private detectAndFormatLists(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Détection des listes à puces
      if (trimmed.match(/^[•·▪▫■□●○-]\s+/)) {
        const content = trimmed.replace(/^[•·▪▫■□●○-]\s+/, '');
        formattedLines.push(`- ${content}`);
        continue;
      }

      // Détection des listes numérotées
      if (trimmed.match(/^\d+[\.)]\s+/)) {
        const content = trimmed.replace(/^\d+[\.)]\s+/, '');
        const number = trimmed.match(/^(\d+)/)![1];
        formattedLines.push(`${number}. ${content}`);
        continue;
      }

      formattedLines.push(line);
    }

    return formattedLines.join('\n');
  }

  /**
   * Détecte et formate les tableaux
   */
  private detectAndFormatTables(text: string): string {
    const lines = text.split('\n');
    const formattedLines: string[] = [];
    let inTable = false;
    let tableLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Détection de séparateurs de colonnes potentiels
      const hasPipes = trimmed.includes('|');
      const hasMultipleTabs = (line.match(/\t/g) || []).length >= 2;
      const hasMultipleSpaces = (line.match(/\s{3,}/g) || []).length >= 2;

      const looksLikeTable = hasPipes || hasMultipleTabs || hasMultipleSpaces;

      if (looksLikeTable && trimmed.length > 0) {
        if (!inTable) {
          inTable = true;
          tableLines = [];
        }
        tableLines.push(trimmed);
      } else {
        if (inTable && tableLines.length >= 2) {
          // Convertir les lignes accumulées en tableau Markdown
          formattedLines.push(...this.convertToMarkdownTable(tableLines));
          formattedLines.push('');
          tableLines = [];
        }
        inTable = false;
        formattedLines.push(line);
      }
    }

    // Traiter le dernier tableau si présent
    if (tableLines.length >= 2) {
      formattedLines.push(...this.convertToMarkdownTable(tableLines));
    }

    return formattedLines.join('\n');
  }

  /**
   * Convertit des lignes en tableau Markdown
   */
  private convertToMarkdownTable(lines: string[]): string[] {
    if (lines.length === 0) return [];

    const rows = lines.map(line => {
      // Séparer par pipes, tabs ou espaces multiples
      let cells: string[];
      
      if (line.includes('|')) {
        cells = line.split('|').map(c => c.trim()).filter(c => c);
      } else if (line.includes('\t')) {
        cells = line.split('\t').map(c => c.trim()).filter(c => c);
      } else {
        cells = line.split(/\s{3,}/).map(c => c.trim()).filter(c => c);
      }

      return cells;
    });

    // Trouver le nombre maximum de colonnes
    const maxCols = Math.max(...rows.map(r => r.length));

    // Normaliser toutes les lignes
    const normalizedRows = rows.map(row => {
      while (row.length < maxCols) {
        row.push('');
      }
      return row;
    });

    // Créer le tableau Markdown
    const header = `| ${normalizedRows[0].join(' | ')} |`;
    const separator = `|${normalizedRows[0].map(() => '---').join('|')}|`;
    const body = normalizedRows.slice(1).map(row => `| ${row.join(' | ')} |`);

    return [header, separator, ...body];
  }

  /**
   * Nettoie le texte OCR
   */
  private cleanOCRText(text: string): string {
    return text
      // Supprimer les caractères de contrôle
      .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '')
      // Normaliser les espaces multiples
      .replace(/ {2,}/g, ' ')
      // Normaliser les sauts de ligne multiples
      .replace(/\n{4,}/g, '\n\n\n')
      // Supprimer les espaces en fin de ligne
      .replace(/ +$/gm, '')
      // Supprimer les lignes ne contenant que des espaces
      .replace(/^\s+$/gm, '');
  }

  /**
   * Génère le fichier Markdown complet
   */
  generateMarkdown(options: FormattingOptions = {}): string {
    const opts = {
      detectTables: true,
      detectLists: true,
      detectFormulas: false,
      preserveLineBreaks: false,
      ...options,
    };

    let markdown = '';

    // En-tête avec métadonnées
    markdown += `# ${this.metadata.title}\n\n`;
    markdown += `_Source: ${this.metadata.source}_\n\n`;
    markdown += `_Extrait le: ${this.metadata.extractedAt}_\n\n`;
    markdown += '---\n\n';

    // Traiter chaque page
    for (let i = 0; i < this.pageTexts.length; i++) {
      let pageText = this.pageTexts[i];

      // Nettoyer le texte
      pageText = this.cleanOCRText(pageText);

      if (!pageText.trim()) {
        markdown += `## Page ${i + 1}\n\n`;
        markdown += '_(vide)_\n\n';
        continue;
      }

      // Appliquer les transformations
      if (opts.detectTitles !== false) {
        pageText = this.detectAndFormatTitles(pageText);
      }

      if (opts.detectLists) {
        pageText = this.detectAndFormatLists(pageText);
      }

      if (opts.detectTables) {
        pageText = this.detectAndFormatTables(pageText);
      }

      // Ajouter le contenu de la page
      markdown += `## Page ${i + 1}\n\n`;
      markdown += pageText + '\n\n';
    }

    return markdown;
  }

  /**
   * Génère un nom de fichier pour le module
   */
  static generateModuleFilename(
    sourceName: string,
    category: string
  ): string {
    // Nettoyer le nom
    const cleanName = sourceName
      .replace(/\.[^/.]+$/, '') // Supprimer l'extension
      .replace(/[^a-z0-9_-]/gi, '_') // Remplacer caractères spéciaux
      .toLowerCase();

    // Trouver le prochain numéro de module disponible
    // Pour simplifier, on utilise un timestamp
    const timestamp = Date.now().toString().slice(-6);

    let prefix = 'module';
    if (category === 'concours_2024' || category === 'concours_2025') {
      prefix = 'sujet';
    }

    return `${prefix}_${timestamp}_${cleanName}.md`;
  }
}

