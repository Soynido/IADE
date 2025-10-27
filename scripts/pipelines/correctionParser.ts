import type { Question, Correction } from './annalesParser.js';

/**
 * Parse les corrections pour les questions d'annales
 * Associe les explications aux questions correspondantes
 */
export class CorrectionParser {
  
  /**
   * Parse les corrections depuis le texte et les associe aux questions
   */
  parseCorrections(questions: Question[], correctionText: string): Question[] {
    console.log('\n📝 Parsing des corrections...');
    
    const lines = correctionText.split('\n');
    let currentQuestionIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détection du début d'une correction
      if (this.isCorrectionStart(line)) {
        const correction = this.extractCorrection(lines, i);
        
        if (correction && currentQuestionIndex < questions.length) {
          questions[currentQuestionIndex].correction = correction;
          currentQuestionIndex++;
        }
        
        i = correction?.endIndex || i;
      }
    }
    
    console.log(`✅ ${currentQuestionIndex} correction(s) associée(s)`);
    
    return questions;
  }

  private isCorrectionStart(line: string): boolean {
    return /^Correction/i.test(line) ||
           /^Solution/i.test(line) ||
           /^R[ée]ponse/i.test(line) ||
           /^✓/.test(line) ||
           /Question\s+\d+\s*[:\-–]/.test(line);
  }

  private extractCorrection(lines: string[], startIndex: number): { 
    correction: Correction; 
    endIndex: number 
  } | null {
    let explanation = '';
    const keyPoints: string[] = [];
    const relatedConcepts: string[] = [];
    let index = startIndex;
    
    // Extraire l'explication (texte après "Correction:" ou "Réponse:")
    const match = lines[startIndex].match(/^[^\s]+\s*[:\-–]\s*(.+)/);
    if (match) {
      explanation += match[1] + ' ';
    }
    
    index++;
    
    // Parcourir les lignes jusqu'à la prochaine question/correction
    while (index < lines.length) {
      const line = lines[index].trim();
      
      // Fin de correction trouvée
      if (this.isCorrectionStart(line) && index > startIndex) {
        break;
      }
      
      // Détection des points clés (•, -, 1.)
      if (this.isKeyPoint(line)) {
        keyPoints.push(this.extractKeyPoint(line));
      }
      // Détection des concepts liés
      else if (this.isRelatedConcept(line)) {
        relatedConcepts.push(...this.extractRelatedConcepts(line));
      }
      // Texte d'explication normal
      else if (line.length > 10) {
        explanation += line + ' ';
      }
      
      index++;
    }
    
    return {
      correction: {
        explanation: explanation.trim(),
        keyPoints,
        relatedConcepts
      },
      endIndex: index - 1
    };
  }

  private isKeyPoint(line: string): boolean {
    return /^[•\-\*]\s/.test(line) || 
           /^\d+[\.\)]\s/.test(line) ||
           /^[A-Z]\s/.test(line);
  }

  private extractKeyPoint(line: string): string {
    return line.replace(/^[•\-\*]\s*/, '')
               .replace(/^\d+[\.\)]\s*/, '')
               .trim();
  }

  private isRelatedConcept(line: string): boolean {
    return line.includes('concept') ||
           line.includes('notion') ||
           line.includes('voir') ||
           line.includes('réf');
  }

  private extractRelatedConcepts(line: string): string[] {
    const concepts: string[] = [];
    
    // Extraction simple par mots-clés
    const words = line.split(/\s+/);
    for (const word of words) {
      if (word.length > 4 && /^[A-Z][a-z]+/.test(word)) {
        concepts.push(word);
      }
    }
    
    return concepts;
  }
}

