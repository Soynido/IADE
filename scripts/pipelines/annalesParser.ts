import type { ExtractedContent } from './baseExtractor.js';

/**
 * Interface pour les annales structurées
 */
export interface StructuredAnnales {
  source: string;
  type: 'annales';
  volume: 1 | 2;
  difficulty: 'base' | 'intermediate' | 'advanced';
  extractedAt: string;
  examSets: ExamSet[];
}

export interface ExamSet {
  id: string;
  title: string;
  themes: string[];
  questions: Question[];
}

export interface Question {
  id: string;
  type: 'QCM' | 'QROC' | 'CasClinique';
  text: string;
  options?: string[];
  correctAnswer: number | string;
  correction?: Correction;
  difficultyLevel: 'base' | 'intermediate' | 'advanced';
  themes: string[];
  embedding?: number[] | null;
}

export interface Correction {
  explanation: string;
  keyPoints?: string[];
  relatedConcepts?: string[];
  references?: string[];
}

/**
 * Parse les annales depuis le contenu extrait
 */
export class AnnalesParser {
  private examSets: ExamSet[] = [];
  private currentExamSet: ExamSet | null = null;
  private questionNumber = 0;
  private volume: 1 | 2;
  private difficulty: 'base' | 'intermediate' | 'advanced';
  
  constructor(volume: 1 | 2) {
    this.volume = volume;
    this.difficulty = volume === 1 ? 'base' : 'intermediate';
  }

  parse(content: ExtractedContent): StructuredAnnales {
    console.log(`\n📝 Parsing des annales Volume ${this.volume}...`);
    
    // Déterminer la difficulté
    this.difficulty = this.detectDifficulty(content);
    
    // Analyser toutes les pages
    for (const page of content.pages) {
      this.parsePage(page.text);
    }
    
    // Si aucune série trouvée, créer un ExamSet par défaut avec tout le texte brut
    if (this.examSets.length === 0) {
      console.log('  ⚠️  Aucune série détectée, création d\'un ExamSet par défaut...');
      const allText = content.pages.map(p => p.text).join('\n\n');
      
      this.examSets.push({
        id: 'exam_default',
        title: `Annales Volume ${this.volume} - Texte brut`,
        themes: ['Général'],
        questions: [{
          id: 'q_raw',
          type: 'CasClinique',
          text: allText.substring(0, 5000),
          options: [],
          correctAnswer: '',
          difficultyLevel: this.difficulty,
          themes: []
        }]
      });
    }
    
    console.log(`✅ ${this.examSets.length} série(s) d'examen trouvée(s)`);
    
    return {
      source: content.metadata.source,
      type: 'annales',
      volume: this.volume,
      difficulty: this.difficulty,
      extractedAt: content.metadata.extractedAt,
      examSets: this.examSets
    };
  }

  private detectDifficulty(content: ExtractedContent): 'base' | 'intermediate' | 'advanced' {
    const text = content.pages.map(p => p.text).join('\n');
    const advancedKeywords = ['complexe', 'détaillé', 'analyse', 'cas clinique'];
    const advancedCount = advancedKeywords.filter(kw => 
      text.toLowerCase().includes(kw.toLowerCase())
    ).length;
    
    if (advancedCount > 2) return 'advanced';
    if (this.volume === 2) return 'intermediate';
    return 'base';
  }

  private parsePage(text: string): void {
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détection d'une nouvelle série d'examen
      if (this.isExamSetTitle(line)) {
        this.startNewExamSet(line);
      }
      // Détection d'une question
      else if (this.isQuestionStart(line)) {
        const question = this.extractQuestion(lines, i);
        if (question) {
          this.addQuestion(question);
          i = question.endLine || i;
        }
      }
    }
  }

  private isExamSetTitle(line: string): boolean {
    return /^Sujet/i.test(line) || 
           /^QCM/i.test(line) ||
           /Concours IADE/i.test(line);
  }

  private isQuestionStart(line: string): boolean {
    // Heuristiques élargies pour détecter les questions
    return /^Question\s+\d+/i.test(line) ||
           /^Q\d+\./.test(line) ||
           /^Q\d+\)/.test(line) ||
           /^\d+[\.\)]\s/.test(line) ||
           /^(Quelle|Quel|Comment|Quand|Où|Pourquoi).{10,}/i.test(line);  // Début de phrase question
  }

  private startNewExamSet(title: string): void {
    const cleanTitle = title.replace(/^#\s+/, '').trim();
    const examSetId = `exam_${this.examSets.length + 1}`;
    
    this.currentExamSet = {
      id: examSetId,
      title: cleanTitle,
      themes: this.extractThemes(cleanTitle),
      questions: []
    };
    
    this.examSets.push(this.currentExamSet);
    console.log(`  📋 Série: ${cleanTitle}`);
  }

  private extractQuestion(lines: string[], startIndex: number): { question: Question; endLine?: number } | null {
    if (!this.currentExamSet) return null;
    
    this.questionNumber++;
    
    // Extraire le texte de la question
    let questionText = '';
    let options: string[] = [];
    let correctAnswer: number | string = -1;
    let currentIndex = startIndex;
    
    // Chercher la fin de la question (prochaine question ou section)
    while (currentIndex < lines.length) {
      const line = lines[currentIndex].trim();
      
      // Fin de question trouvée
      if (currentIndex > startIndex && this.isQuestionStart(line)) {
        currentIndex--;
        break;
      }
      
      // Détection du type de question
      const questionType = this.detectQuestionType(line);
      
      if (questionType === 'QCM') {
        // Extraire les options A/B/C/D
        const qcmData = this.extractQCMOptions(lines, currentIndex);
        options = qcmData.options;
        correctAnswer = qcmData.correctAnswer;
        currentIndex = qcmData.endIndex;
        break;
      } else if (questionType === 'QROC' || questionType === 'CasClinique') {
        questionText += line + ' ';
      }
      
      currentIndex++;
    }
    
    const questionId = `q_v${this.volume}_${this.questionNumber}`;
    
    const question: Question = {
      id: questionId,
      type: this.detectQuestionType(lines[startIndex]),
      text: questionText.trim() || lines[startIndex],
      options: options.length > 0 ? options : undefined,
      correctAnswer,
      difficultyLevel: this.difficulty,
      themes: this.extractThemes(questionText),
      embedding: null
    };
    
    return { question, endLine: currentIndex };
  }

  private extractQCMOptions(lines: string[], startIndex: number): { 
    options: string[]; 
    correctAnswer: number; 
    endIndex: number 
  } {
    const options: string[] = [];
    let correctAnswer = -1;
    let index = startIndex;
    
    // Chercher les options A, B, C, D
    const optionPattern = /^[A-D]\)\s*(.+)/;
    
    while (index < lines.length) {
      const line = lines[index].trim();
      const match = line.match(optionPattern);
      
      if (match) {
        options.push(match[1]);
        if (line.includes('✓') || line.includes('✓') || line.toLowerCase().includes('correct')) {
          correctAnswer = options.length - 1;
        }
      } else if (line.length === 0) {
        // Ligne vide, fin des options
        break;
      }
      
      index++;
    }
    
    // Si pas de bonne réponse détectée, la première par défaut
    if (correctAnswer === -1) {
      correctAnswer = 0;
    }
    
    return { options, correctAnswer, endIndex: index };
  }

  private detectQuestionType(line: string): 'QCM' | 'QROC' | 'CasClinique' {
    if (/^[A-D]\)/.test(line)) return 'QCM';
    if (/cas clinique/i.test(line)) return 'CasClinique';
    return 'QROC';
  }

  private addQuestion(question: Question): void {
    if (!this.currentExamSet) return;
    
    this.currentExamSet.questions.push(question);
    console.log(`    ✓ Q${this.questionNumber}: ${question.type}`);
  }

  private extractThemes(text: string): string[] {
    const themeKeywords = [
      'pharmacologie', 'anatomie', 'physiologie', 'pathologie', 'soins',
      'réanimation', 'anesthésie', 'urgences', 'cardiovasculaire',
      'respiratoire', 'métabolique', 'neurologie', 'infectieux', 'digestif'
    ];
    
    const themes: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of themeKeywords) {
      if (lowerText.includes(keyword)) {
        themes.push(keyword);
      }
    }
    
    return themes.length > 0 ? themes : ['général'];
  }
}

