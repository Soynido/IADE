import type { ExtractedContent } from './baseExtractor.js';

/**
 * Interface pour le cours structuré
 */
export interface StructuredCourse {
  source: string;
  type: 'cours';
  extractedAt: string;
  chapters: CourseChapter[];
}

export interface CourseChapter {
  id: string;
  title: string;
  themes: string[];
  sections: CourseSection[];
}

export interface CourseSection {
  id: string;
  title: string;
  concepts: Concept[];
  protocols?: Protocol[];
  calculations?: Calculation[];
}

export interface Concept {
  id: string;
  term: string;
  definition: string;
  examples?: string[];
  relatedConcepts?: string[];
  difficultyLevel: 'base' | 'intermediate' | 'advanced';
  embedding?: number[] | null;
}

export interface Protocol {
  name: string;
  steps: string[];
  indications?: string[];
}

export interface Calculation {
  formula: string;
  variables: string[];
  examples?: string[];
}

/**
 * Parse un cours depuis le contenu extrait
 */
export class CourseParser {
  private chapters: CourseChapter[] = [];
  private currentChapter: CourseChapter | null = null;
  private currentSection: CourseSection | null = null;
  
  parse(content: ExtractedContent): StructuredCourse {
    console.log('\n📚 Parsing du cours...');
    
    // Analyser toutes les pages
    for (const page of content.pages) {
      this.parsePage(page.text);
    }
    
    console.log(`✅ ${this.chapters.length} chapitre(s) trouvé(s)`);
    
    return {
      source: content.metadata.source,
      type: 'cours',
      extractedAt: content.metadata.extractedAt,
      chapters: this.chapters
    };
  }

  private parsePage(text: string): void {
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Détection des titres de chapitres (# ou Titre principal)
      if (this.isChapterTitle(trimmed)) {
        this.startNewChapter(trimmed);
      }
      // Détection des sections (## ou sous-titres)
      else if (this.isSectionTitle(trimmed)) {
        this.startNewSection(trimmed);
      }
      // Détection des concepts (texte avec définition)
      else if (this.isConcept(trimmed)) {
        this.addConcept(trimmed);
      }
      // Détection des protocoles (listes numérotées)
      else if (this.isProtocol(trimmed)) {
        this.addProtocol(trimmed);
      }
      // Détection des calculs (formules)
      else if (this.isCalculation(trimmed)) {
        this.addCalculation(trimmed);
      }
    }
  }

  private isChapterTitle(line: string): boolean {
    // Titre principal (tout en caps, ou avec #)
    return /^#\s+[A-Z]/.test(line) || 
           /^[A-ZÉÈÊÀÁÍÓÚÙ]{2,}[^a-z]*$/g.test(line) ||
           line.match(/Chapitre\s+\d+/i);
  }

  private isSectionTitle(line: string): boolean {
    return /^##\s+/.test(line) || 
           /^[A-Z][a-z]+(?: [A-Z][a-z]+)*\s*:/.test(line);
  }

  private isConcept(line: string): boolean {
    // Mot clé avec définition après ":" ou "-"
    return /^[A-ZÉÈÊÀÁÍÓÚÙ][a-zéèêàáíóúù]+(?:\s+[A-ZÉÈÊÀÁÍÓÚÙ][a-zéèêàáíóúù]+)*\s*[:\-–]/g.test(line);
  }

  private isProtocol(line: string): boolean {
    return /^\d+[\.\)]/.test(line) || /^[•\-\*]\s/.test(line);
  }

  private isCalculation(line: string): boolean {
    // Contient des formules mathématiques
    return /=\s*\d+/.test(line) || /\d+\s*\+\s*\d+/.test(line);
  }

  private startNewChapter(title: string): void {
    const cleanTitle = title.replace(/^#\s+/, '').trim();
    const chapterId = `chap_${this.chapters.length + 1}`;
    
    this.currentChapter = {
      id: chapterId,
      title: cleanTitle,
      themes: this.extractThemes(cleanTitle),
      sections: []
    };
    
    this.chapters.push(this.currentChapter);
    console.log(`  📖 Chapitre: ${cleanTitle}`);
  }

  private startNewSection(title: string): void {
    if (!this.currentChapter) {
      this.startNewChapter('Chapitre sans titre');
    }
    
    const cleanTitle = title.replace(/^##\s+/, '').trim();
    const sectionId = `${this.currentChapter!.id}_sec_${this.currentChapter!.sections.length + 1}`;
    
    this.currentSection = {
      id: sectionId,
      title: cleanTitle,
      concepts: [],
      protocols: [],
      calculations: []
    };
    
    this.currentChapter!.sections.push(this.currentSection);
  }

  private addConcept(line: string): void {
    if (!this.currentSection) {
      this.startNewSection('Section sans titre');
    }
    
    const [term, ...definitionParts] = line.split(/[:\-–]/);
    const definition = definitionParts.join(':').trim();
    
    if (!definition || definition.length < 10) return;
    
    const conceptId = `${this.currentSection!.id}_concept_${this.currentSection!.concepts.length + 1}`;
    
    this.currentSection!.concepts.push({
      id: conceptId,
      term: term.trim(),
      definition,
      examples: this.extractExamples(definition),
      difficultyLevel: this.estimateDifficulty(definition),
      embedding: null
    });
  }

  private addProtocol(line: string): void {
    if (!this.currentSection) return;
    
    // Simplification : stocker comme concept pour l'instant
    // À améliorer pour distinguer protocoles
  }

  private addCalculation(line: string): void {
    if (!this.currentSection) return;
    
    // Simplification : stocker comme concept pour l'instant
    // À améliorer pour extraire formules
  }

  private extractThemes(title: string): string[] {
    const themeKeywords = [
      'pharmacologie', 'anatomie', 'physiologie', 'pathologie', 'soins',
      'réanimation', 'anesthésie', 'urgences', 'cardiovasculaire',
      'respiratoire', 'métabolique', 'neurologie', 'infectieux', 'digestif'
    ];
    
    const themes: string[] = [];
    const lowerTitle = title.toLowerCase();
    
    for (const keyword of themeKeywords) {
      if (lowerTitle.includes(keyword)) {
        themes.push(keyword);
      }
    }
    
    return themes.length > 0 ? themes : ['général'];
  }

  private extractExamples(definition: string): string[] {
    const examples: string[] = [];
    const exampleMatch = definition.match(/\(ex[\.:]\s*([^)]+)\)/i);
    
    if (exampleMatch) {
      examples.push(exampleMatch[1]);
    }
    
    return examples;
  }

  private estimateDifficulty(definition: string): 'base' | 'intermediate' | 'advanced' {
    const length = definition.length;
    const complexity = (definition.match(/[A-Z]{3,}/g) || []).length;
    
    if (length > 200 || complexity > 3) return 'advanced';
    if (length > 80 || complexity > 1) return 'intermediate';
    return 'base';
  }
}

