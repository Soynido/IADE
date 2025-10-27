import type { CompiledQuestion } from '../types/module.js';

interface TableCell {
  header: string;
  value: string;
}

interface TableRow {
  cells: TableCell[];
}

/**
 * Générateur de questions depuis les tableaux comparatifs
 * Parse les tableaux Markdown et crée des QCM de comparaison
 */
export class TableQuestionsGenerator {
  /**
   * Génère des questions depuis les tableaux du contenu
   */
  static generateTableQuestions(content: string, moduleId: string): CompiledQuestion[] {
    const questions: CompiledQuestion[] = [];
    const tables = this.extractTables(content);
    
    for (const table of tables.slice(0, 3)) {
      // Générer plusieurs types de questions par tableau
      questions.push(...this.generateComparisonQuestions(table, moduleId, questions.length));
      questions.push(...this.generateCompletionQuestions(table, moduleId, questions.length));
      
      if (questions.length >= 15) break;
    }
    
    return questions;
  }

  /**
   * Extrait les tableaux du contenu Markdown
   */
  private static extractTables(content: string): TableRow[][] {
    const tables: TableRow[][] = [];
    const lines = content.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Détecter début de tableau (ligne avec |)
      if (line.includes('|') && line.split('|').length >= 3) {
        const table: TableRow[] = [];
        const headers: string[] = [];
        
        // Extraire headers
        const headerCells = line.split('|').map(c => c.trim()).filter(Boolean);
        headers.push(...headerCells);
        i++;
        
        // Skip separator line (|---|---|)
        if (i < lines.length && lines[i].includes('---')) {
          i++;
        }
        
        // Extraire les lignes de données
        while (i < lines.length && lines[i].includes('|')) {
          const dataCells = lines[i].split('|').map(c => c.trim()).filter(Boolean);
          
          if (dataCells.length >= headers.length) {
            const row: TableRow = {
              cells: headers.map((header, index) => ({
                header,
                value: dataCells[index] || '',
              })),
            };
            table.push(row);
          }
          
          i++;
        }
        
        if (table.length >= 2) {
          tables.push(table);
        }
      } else {
        i++;
      }
    }
    
    return tables;
  }

  /**
   * Génère des questions de comparaison depuis un tableau
   */
  private static generateComparisonQuestions(
    table: TableRow[],
    moduleId: string,
    startIndex: number
  ): CompiledQuestion[] {
    const questions: CompiledQuestion[] = [];
    
    if (table.length < 2 || table[0].cells.length < 2) {
      return questions;
    }
    
    // Question : Comparer deux lignes
    const row1 = table[0];
    const row2 = table[Math.min(1, table.length - 1)];
    
    const firstColumn = row1.cells[0].header;
    const secondColumn = row1.cells[1].header;
    
    const item1 = row1.cells[0].value;
    const item2 = row2.cells[0].value;
    
    const value1 = row1.cells[1].value;
    const value2 = row2.cells[1].value;
    
    if (item1 && item2 && value1 && value2) {
      // Question de type "Quelle différence ?"
      const options = this.shuffleArray([
        `${item1} : ${value1}, ${item2} : ${value2}`,
        `${item1} : ${value2}, ${item2} : ${value1}`,
        `${item1} : ${this.generatePlausibleWrongValue(value1)}, ${item2} : ${value2}`,
        `${item1} : ${value1}, ${item2} : ${this.generatePlausibleWrongValue(value2)}`,
      ]);
      
      questions.push({
        id: `${moduleId}_table_comp_${startIndex + 1}`,
        question: `Selon le tableau comparatif, quelle est la relation correcte entre ${item1} et ${item2} pour la caractéristique "${secondColumn}" ?`,
        options,
        correct: `${item1} : ${value1}, ${item2} : ${value2}`,
        explanation: `D'après le tableau : ${item1} a pour ${secondColumn} : ${value1}, tandis que ${item2} a : ${value2}`,
        points: 2,
        theme: 'Comparaison',
        difficulty: 'Moyen',
        pathology: item1,
        sourceModule: moduleId,
        originalText: `Tableau : ${firstColumn} / ${secondColumn}`,
        relatedQuestions: [],
      });
    }
    
    return questions;
  }

  /**
   * Génère des questions de complétion depuis un tableau
   */
  private static generateCompletionQuestions(
    table: TableRow[],
    moduleId: string,
    startIndex: number
  ): CompiledQuestion[] {
    const questions: CompiledQuestion[] = [];
    
    if (table.length < 1 || table[0].cells.length < 2) {
      return questions;
    }
    
    // Question : Compléter une cellule
    const randomRow = table[Math.floor(Math.random() * table.length)];
    
    const item = randomRow.cells[0].value;
    const attribute = randomRow.cells[1].header;
    const correctValue = randomRow.cells[1].value;
    
    if (item && correctValue && correctValue.length > 2) {
      // Générer des distracteurs depuis les autres valeurs du tableau
      const allValues = table.map(row => row.cells[1]?.value).filter(Boolean);
      const wrongValues = allValues.filter(v => v !== correctValue).slice(0, 3);
      
      // Si pas assez de valeurs, générer des valeurs plausibles
      while (wrongValues.length < 3) {
        wrongValues.push(this.generatePlausibleWrongValue(correctValue));
      }
      
      const options = this.shuffleArray([
        correctValue,
        ...wrongValues.slice(0, 3),
      ]);
      
      questions.push({
        id: `${moduleId}_table_compl_${startIndex + 1}`,
        question: `Complétez le tableau : Pour "${item}", quelle est la valeur de "${attribute}" ?`,
        options,
        correct: correctValue,
        explanation: `D'après le tableau, ${item} a pour ${attribute} : ${correctValue}`,
        points: 2,
        theme: 'Tableaux',
        difficulty: 'Moyen',
        pathology: item,
        sourceModule: moduleId,
        originalText: `${item} | ${correctValue}`,
        relatedQuestions: [],
      });
    }
    
    return questions;
  }

  /**
   * Génère une valeur incorrecte mais plausible
   */
  private static generatePlausibleWrongValue(correctValue: string): string {
    // Si c'est un nombre, varier de ±20-50%
    const numMatch = correctValue.match(/(\d+(?:[.,]\d+)?)/);
    if (numMatch) {
      const num = parseFloat(numMatch[1].replace(',', '.'));
      const variation = num * (0.2 + Math.random() * 0.3);
      const wrong = Math.random() > 0.5 ? num + variation : num - variation;
      return correctValue.replace(numMatch[1], wrong.toFixed(1));
    }
    
    // Sinon, inverser ou modifier légèrement
    const opposites: Record<string, string> = {
      'augmente': 'diminue',
      'diminue': 'augmente',
      'élevé': 'bas',
      'bas': 'élevé',
      'positif': 'négatif',
      'négatif': 'positif',
      'oui': 'non',
      'non': 'oui',
    };
    
    for (const [key, value] of Object.entries(opposites)) {
      if (correctValue.toLowerCase().includes(key)) {
        return correctValue.replace(new RegExp(key, 'gi'), value);
      }
    }
    
    return `Non ${correctValue}`;
  }

  /**
   * Mélange un tableau
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

