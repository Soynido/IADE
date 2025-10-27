import type { CompiledQuestion } from '../types/module';
import modulesIndex from '../data/modulesIndex.json';
import fs from 'fs';
import path from 'path';

interface CourseReference {
  moduleName: string;
  filePath: string;
  section: string;
  excerpt: string;
  relatedSections: {
    title: string;
    summary: string;
  }[];
}

/**
 * Moteur de références vers les cours sources
 * Permet de retrouver et afficher le contexte pédagogique complet
 */
export class CourseReferenceEngine {
  // Cache des contenus de modules
  private static contentCache: Map<string, string> = new Map();

  /**
   * Récupère la référence complète au cours pour une question
   */
  static getCourseReference(question: CompiledQuestion): CourseReference | null {
    const module = modulesIndex.modules.find(m => m.id === question.sourceModule);
    
    if (!module) {
      return null;
    }

    // Charger le contenu du module
    const content = this.loadModuleContent(module.filePath);
    
    if (!content) {
      return null;
    }

    // Extraire un excerpt plus large autour de la question
    const excerpt = this.extractExtendedExcerpt(content, question);

    // Trouver les sections connexes
    const relatedSections = this.findRelatedSections(content, question);

    return {
      moduleName: module.title,
      filePath: module.filePath,
      section: question.pedagogicalContext?.moduleSection || 'Section principale',
      excerpt,
      relatedSections,
    };
  }

  /**
   * Charge le contenu d'un module
   */
  private static loadModuleContent(filePath: string): string | null {
    // Vérifier le cache
    if (this.contentCache.has(filePath)) {
      return this.contentCache.get(filePath)!;
    }

    try {
      // Construire le chemin complet
      const fullPath = path.join(process.cwd(), 'src', 'data', filePath);
      
      // Lire le fichier
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        this.contentCache.set(filePath, content);
        return content;
      }
    } catch (error) {
      console.error(`Erreur chargement module ${filePath}:`, error);
    }

    return null;
  }

  /**
   * Extrait un excerpt étendu autour de la question
   */
  private static extractExtendedExcerpt(content: string, question: CompiledQuestion): string {
    const lines = content.split('\n');
    
    // Chercher la zone pertinente
    const searchText = question.question.substring(0, 50).toLowerCase();
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes(searchText)) {
        // Extraire 5 lignes avant et 5 lignes après
        const excerptLines: string[] = [];
        
        for (let j = Math.max(0, i - 5); j <= Math.min(lines.length - 1, i + 5); j++) {
          const line = lines[j].trim();
          if (line) {
            excerptLines.push(line);
          }
        }
        
        return excerptLines.join('\n');
      }
    }

    // Fallback : utiliser pedagogicalContext si disponible
    return question.pedagogicalContext?.courseExtract || question.originalText;
  }

  /**
   * Trouve les sections connexes dans le cours
   */
  private static findRelatedSections(content: string, question: CompiledQuestion): {
    title: string;
    summary: string;
  }[] {
    const sections: { title: string; summary: string }[] = [];
    const lines = content.split('\n');
    
    // Extraire tous les titres H2
    const allSections: { title: string; startLine: number; content: string }[] = [];
    let currentSection = { title: '', startLine: 0, content: '' };
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/^##\s+/)) {
        if (currentSection.title) {
          allSections.push(currentSection);
        }
        currentSection = {
          title: line.replace(/^##\s+/, ''),
          startLine: i,
          content: '',
        };
      } else {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection.title) {
      allSections.push(currentSection);
    }

    // Trouver les sections qui mentionnent les concepts liés
    const relatedConcepts = question.pedagogicalContext?.relatedConcepts || [];
    
    for (const section of allSections) {
      const sectionLower = section.content.toLowerCase();
      
      // Vérifier si la section mentionne un concept lié
      const hasRelatedConcept = relatedConcepts.some(concept => 
        sectionLower.includes(concept.toLowerCase())
      );
      
      if (hasRelatedConcept && section.title !== question.pedagogicalContext?.moduleSection) {
        // Générer un résumé (premières 100 caractères)
        const summary = section.content
          .substring(0, 150)
          .trim()
          .replace(/\n+/g, ' ') + '...';
        
        sections.push({
          title: section.title,
          summary,
        });
        
        if (sections.length >= 3) break;
      }
    }

    return sections;
  }

  /**
   * Génère un lien direct vers le fichier Markdown source
   */
  static getSourceFileLink(question: CompiledQuestion): string | null {
    const module = modulesIndex.modules.find(m => m.id === question.sourceModule);
    
    if (!module) {
      return null;
    }

    return `/src/data/${module.filePath}`;
  }

  /**
   * Recherche des questions similaires dans le même module
   */
  static findSimilarQuestionsInModule(
    question: CompiledQuestion,
    allQuestions: CompiledQuestion[]
  ): CompiledQuestion[] {
    return allQuestions.filter(q => 
      q.sourceModule === question.sourceModule &&
      q.id !== question.id &&
      (
        q.theme === question.theme ||
        q.pathology === question.pathology ||
        q.pedagogicalContext?.moduleSection === question.pedagogicalContext?.moduleSection
      )
    ).slice(0, 5);
  }
}

