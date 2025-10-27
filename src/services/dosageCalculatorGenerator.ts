import type { CompiledQuestion } from '../types/module.js';

interface DosageInfo {
  medication: string;
  dose: number;
  unit: string;
  route: string;
  context: string;
}

/**
 * Générateur de questions de calculs de doses
 * Parse les posologies et crée des exercices pratiques
 */
export class DosageCalculatorGenerator {
  /**
   * Extrait les posologies du contenu et génère des questions de calcul
   */
  static generateDosageQuestions(content: string, moduleId: string): CompiledQuestion[] {
    const questions: CompiledQuestion[] = [];
    const dosages = this.extractDosages(content);
    
    for (const dosage of dosages.slice(0, 5)) {
      // Générer plusieurs types de questions par posologie
      questions.push(...this.generateCalculationVariants(dosage, moduleId, questions.length));
      
      if (questions.length >= 20) break;
    }
    
    return questions;
  }

  /**
   * Extrait les informations de dosage du contenu
   */
  private static extractDosages(content: string): DosageInfo[] {
    const dosages: DosageInfo[] = [];
    const lines = content.split('\n');
    
    // Patterns de détection de dosage
    const dosagePatterns = [
      /(\d+(?:[.,]\d+)?)\s*(mg|µg|g|mcg|UI)\/kg/gi,
      /(\d+(?:[.,]\d+)?)\s*(mg|µg|g)\/h/gi,
      /(\d+(?:[.,]\d+)?)\s*(mg|µg|g)\s+(?:IV|IM|SC|PO)/gi,
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of dosagePatterns) {
        const matches = line.matchAll(pattern);
        
        for (const match of matches) {
          // Chercher le nom du médicament dans les lignes proches
          const medication = this.findMedicationName(lines, i);
          
          if (medication) {
            dosages.push({
              medication,
              dose: parseFloat(match[1].replace(',', '.')),
              unit: match[2],
              route: this.extractRoute(line),
              context: line.substring(0, 100),
            });
          }
        }
      }
    }
    
    return dosages;
  }

  /**
   * Trouve le nom du médicament proche d'une posologie
   */
  private static findMedicationName(lines: string[], lineIndex: number): string | null {
    // Chercher dans ±3 lignes
    for (let i = Math.max(0, lineIndex - 3); i <= Math.min(lines.length - 1, lineIndex + 3); i++) {
      const line = lines[i];
      
      // Médicaments courants IADE
      const medications = [
        'morphine', 'fentanyl', 'sufentanil', 'rémifentanil',
        'propofol', 'etomidate', 'kétamine', 'thiopental',
        'rocuronium', 'atracurium', 'cisatracurium', 'suxaméthonium',
        'midazolam', 'diazépam', 'lorazépam',
        'noradrénaline', 'adrénaline', 'dobutamine', 'dopamine',
        'héparine', 'enoxaparine', 'fondaparinux',
        'paracétamol', 'tramadol', 'néfopam',
      ];
      
      for (const med of medications) {
        if (line.toLowerCase().includes(med)) {
          return med.charAt(0).toUpperCase() + med.slice(1);
        }
      }
      
      // Pattern nom commercial (majuscules + ®)
      const brandMatch = line.match(/([A-Z][A-Z\s]+(?:®|©))/);
      if (brandMatch) {
        return brandMatch[1].trim();
      }
    }
    
    return null;
  }

  /**
   * Extrait la voie d'administration
   */
  private static extractRoute(text: string): string {
    const routes = {
      'IV': /\bIV\b|intra.?veineuse?/i,
      'IM': /\bIM\b|intra.?musculaire?/i,
      'SC': /\bSC\b|sous.?cutanée?/i,
      'PO': /\bPO\b|per\s+os|oral/i,
    };
    
    for (const [route, pattern] of Object.entries(routes)) {
      if (pattern.test(text)) {
        return route;
      }
    }
    
    return 'IV';
  }

  /**
   * Génère plusieurs variantes de calcul pour une posologie
   */
  private static generateCalculationVariants(
    dosage: DosageInfo,
    moduleId: string,
    startIndex: number
  ): CompiledQuestion[] {
    const questions: CompiledQuestion[] = [];
    
    // Variante 1 : Calcul de dose simple
    const weight = 70 + Math.floor(Math.random() * 30); // 70-100 kg
    const totalDose = dosage.dose * weight;
    
    const wrongAnswers = [
      `${Math.round(totalDose * 0.5)} ${dosage.unit}`,
      `${Math.round(totalDose * 1.5)} ${dosage.unit}`,
      `${Math.round(totalDose * 0.75)} ${dosage.unit}`,
    ];
    
    const options = this.shuffleArray([
      `${Math.round(totalDose)} ${dosage.unit}`,
      ...wrongAnswers,
    ]);
    
    questions.push({
      id: `${moduleId}_calc_${startIndex + 1}`,
      question: `Patient de ${weight} kg. Prescription : ${dosage.medication} ${dosage.dose} ${dosage.unit}/kg ${dosage.route}. Quelle est la dose totale à administrer ?`,
      options,
      correct: `${Math.round(totalDose)} ${dosage.unit}`,
      explanation: `Calcul : ${weight} kg × ${dosage.dose} ${dosage.unit}/kg = ${Math.round(totalDose)} ${dosage.unit}`,
      points: 3,
      theme: 'Calculs',
      difficulty: 'Difficile',
      pathology: dosage.medication,
      sourceModule: moduleId,
      originalText: dosage.context,
      relatedQuestions: [],
    });
    
    return questions;
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

