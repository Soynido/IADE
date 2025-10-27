import type { CompiledQuestion } from '../types/module.js';

/**
 * Extracteur spécialisé pour les cas cliniques et questions de concours
 * Parse les listes de questions tirées des sujets réels
 */
export class ClinicalCasesExtractor {
  /**
   * Extrait les questions depuis les sujets de concours
   * Format typique : listes avec tirets contenant des questions/demandes
   */
  static extractConcoursQuestions(content: string, moduleId: string): CompiledQuestion[] {
    const questions: CompiledQuestion[] = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Détecter les listes avec tirets
      if (trimmed.match(/^[-•*]\s+/)) {
        const item = trimmed.replace(/^[-•*]\s+/, '').trim();
        
        // Vérifier si c'est une question ou demande
        if (this.isQuestion(item)) {
          const question = this.parseQuestionItem(item, moduleId, questions.length, lines, i);
          if (question) {
            questions.push(question);
          }
        }
      }
    }
    
    return questions;
  }

  /**
   * Vérifie si un item est une question ou demande
   */
  private static isQuestion(item: string): boolean {
    const lower = item.toLowerCase();
    
    // Questions directes
    if (item.includes('?')) return true;
    
    // Verbes d'action typiques des sujets
    const actionVerbs = [
      'définir', 'définissez', 'expliquer', 'expliquez',
      'dire', 'dites', 'citer', 'citez',
      'compléter', 'complétez', 'calculer', 'calculez',
      'décrire', 'décrivez', 'analyser', 'analysez',
      'identifier', 'identifiez', 'donner', 'donnez',
      'qcm', 'quel', 'quelle', 'quels', 'quelles',
      'comment', 'pourquoi', 'que peut-on',
    ];
    
    return actionVerbs.some(verb => lower.includes(verb));
  }

  /**
   * Parse un item de question et crée une CompiledQuestion
   */
  private static parseQuestionItem(
    item: string,
    moduleId: string,
    index: number,
    lines: string[],
    lineIndex: number
  ): CompiledQuestion | null {
    // Détecter le type de question
    const type = this.detectQuestionType(item);
    const theme = this.extractTheme(item);
    
    // Récupérer le contexte (titre de section ou cas clinique précédent)
    const context = this.getContext(lines, lineIndex);
    
    let question: CompiledQuestion;
    
    if (type === 'qcm') {
      // QCM explicite
      const cleanedQuestion = item.replace(/^qcm\s*/i, '').trim();
      question = {
        id: `${moduleId}_concours_qcm_${index + 1}`,
        question: this.capitalizeFirst(cleanedQuestion),
        options: this.generateOptionsForQCM(cleanedQuestion),
        correct: 'À vérifier dans le cours',
        explanation: `Question issue du sujet de concours. Référez-vous au cours pour la réponse exacte.`,
        points: 2,
        theme,
        difficulty: 'Moyen',
        pathology: 'Concours',
        sourceModule: moduleId,
        originalText: item,
        relatedQuestions: [],
      };
    } else if (type === 'definition') {
      // Demande de définition
      const term = this.extractTermToDefine(item);
      question = {
        id: `${moduleId}_concours_def_${index + 1}`,
        question: item.includes('?') ? item : `Définissez : ${term}`,
        correct: 'Définition à compléter selon le cours',
        explanation: `Consultez le cours pour la définition complète de ${term}.`,
        points: 2,
        theme,
        difficulty: 'Moyen',
        pathology: term,
        sourceModule: moduleId,
        originalText: item,
        relatedQuestions: [],
      };
    } else if (type === 'calculation') {
      // Calcul
      question = {
        id: `${moduleId}_concours_calc_${index + 1}`,
        question: this.capitalizeFirst(item),
        correct: 'Calcul à effectuer',
        explanation: `Appliquez les formules de calcul vues en cours.`,
        points: 3,
        theme: 'Calculs',
        difficulty: 'Difficile',
        pathology: 'Pratique',
        sourceModule: moduleId,
        originalText: item,
        relatedQuestions: [],
      };
    } else if (type === 'list') {
      // Demande de liste (citer, énumérer)
      const number = this.extractNumber(item);
      const subject = this.extractSubject(item);
      
      question = {
        id: `${moduleId}_concours_list_${index + 1}`,
        question: this.capitalizeFirst(item),
        correct: `Liste de ${number || 'plusieurs'} éléments à mémoriser`,
        explanation: `Mémorisez cette liste importante pour le concours.`,
        points: 2,
        theme,
        difficulty: 'Moyen',
        pathology: subject,
        sourceModule: moduleId,
        originalText: item,
        relatedQuestions: [],
      };
    } else {
      // Question générale
      question = {
        id: `${moduleId}_concours_${index + 1}`,
        question: this.capitalizeFirst(item.includes('?') ? item : item + ' ?'),
        correct: 'À compléter selon le cours',
        explanation: `Question du sujet de concours${context ? ` (contexte: ${context})` : ''}.`,
        points: 2,
        theme,
        difficulty: 'Moyen',
        pathology: context || 'Concours',
        sourceModule: moduleId,
        originalText: item,
        relatedQuestions: [],
      };
    }
    
    return question;
  }

  /**
   * Détecte le type de question
   */
  private static detectQuestionType(item: string): 'qcm' | 'definition' | 'calculation' | 'list' | 'general' {
    const lower = item.toLowerCase();
    
    if (lower.includes('qcm')) return 'qcm';
    if (lower.includes('définir') || lower.includes('définissez') || lower.includes('qu\'est-ce')) return 'definition';
    if (lower.includes('calculer') || lower.includes('calculez') || lower.includes('calcul')) return 'calculation';
    if (lower.match(/\d+\s+(?:facteur|élément|signe|critère|cause)/)) return 'list';
    
    return 'general';
  }

  /**
   * Extrait le terme à définir
   */
  private static extractTermToDefine(item: string): string {
    // "Définir hypoxie, hypoxemie, anoxie" → "hypoxie, hypoxemie, anoxie"
    const match = item.match(/définir?\s+(.+?)(?:\?|$)/i);
    return match ? match[1].trim() : 'terme';
  }

  /**
   * Extrait un nombre depuis un item
   */
  private static extractNumber(item: string): number | null {
    const match = item.match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Extrait le sujet principal
   */
  private static extractSubject(item: string): string {
    // "5 facteur de risque pour les maladies cardiaques" → "maladies cardiaques"
    const match = item.match(/pour\s+(?:les?\s+)?(.+?)(?:\?|$)/i);
    if (match) return match[1].trim();
    
    const match2 = item.match(/de\s+(?:la?\s+)?(.+?)(?:\?|$)/i);
    if (match2) return match2[1].trim();
    
    return 'sujet';
  }

  /**
   * Génère des options pour un QCM
   */
  private static generateOptionsForQCM(_question: string): string[] {
    const genericOptions = [
      'Selon les recommandations HAS',
      'D\'après le protocole de service',
      'Conformément aux bonnes pratiques',
      'En suivant l\'algorithme décisionnel',
    ];
    
    return genericOptions;
  }

  /**
   * Extrait le thème depuis la question
   */
  private static extractTheme(item: string): string {
    const lower = item.toLowerCase();
    
    const themeKeywords: Record<string, string[]> = {
      'Pharmacologie': ['médicament', 'traitement', 'ttt', 'dose', 'posologie', 'classe thérapeutique'],
      'Anatomie/Physiologie': ['anatomie', 'physiologie', 'organe', 'système', 'fonction'],
      'Biologie': ['gazo', 'biologie', 'bilan', 'norme', 'valeur'],
      'Urgences': ['urgence', 'gravité', 'prise en charge', 'glasgow'],
      'Cardiologie': ['cardiaque', 'coeur', 'ecg', 'électrique'],
      'Pneumologie': ['respiratoire', 'bronche', 'asthme', 'vems', 'tiffeneau'],
      'Transfusion': ['transfusion', 'sang', 'plasma', 'plaquette'],
      'Calculs': ['calculer', 'calcul', 'débit', 'dilution'],
    };
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        return theme;
      }
    }
    
    return 'Général';
  }

  /**
   * Récupère le contexte (titre de section ou cas clinique)
   */
  private static getContext(lines: string[], currentLine: number): string {
    // Chercher le titre H2 le plus proche avant
    for (let i = currentLine - 1; i >= Math.max(0, currentLine - 10); i--) {
      const line = lines[i].trim();
      if (line.match(/^##\s+/)) {
        return line.replace(/^##\s+/, '').trim();
      }
      // Ou un titre avec # simple
      if (line.match(/^#\s+[^#]/)) {
        return line.replace(/^#\s+/, '').trim();
      }
    }
    
    return '';
  }

  /**
   * Met la première lettre en majuscule
   */
  private static capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
}

