/**
 * Parser robuste pour extraire les blocs de questions depuis "QUESTIONS DE X À Y"
 * Basé sur l'observation du texte brut des annales
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ParsedAnnales {
  source: string;
  type: string;
  extractedAt: string;
  examSets: ExamSet[];
}

interface ExamSet {
  id: string;
  title: string;
  themes: string[];
  questions: Question[];
}

interface Question {
  id: string;
  type: 'QCM' | 'QROC' | 'CasClinique' | 'DiagramCompletion';
  text: string;
  options?: string[];
  correctAnswer: number | string;
  correction?: any;
  difficultyLevel: string;
  themes: string[];
}

export function parseAnnalesFromText(text: string, volume: 1 | 2): ParsedAnnales {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const examSets: ExamSet[] = [];
  const questions: Question[] = [];
  const answers: any = {};
  
  let currentBlock = '';
  let currentSection: 'questions' | 'answers' = 'questions';
  let blockStartIndex = -1;
  let blockEndIndex = -1;
  
  // Patterns
  const BLOCK_PATTERN = /^QUESTIONS\s+DE\s+(\d+)\s+À\s+(\d+)/i;
  const ANSWER_BLOCK_PATTERN = /^RÉPONSES\s+DE\s+(\d+)\s+À\s+(\d+)/i;
  const QUESTION_PATTERN = /^(\d+)\)|^\(\d+\)|^[a-e]\)|^[A-E]\)/i;
  const ANSWER_PATTERN = /^RÉPONSE\s*[:\-]|^CORRECTION|^CORRIGÉ/i;
  
  // Parcourir toutes les lignes
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Détecter un nouveau bloc de questions
    const blockMatch = line.match(BLOCK_PATTERN);
    if (blockMatch) {
      blockStartIndex = i;
      currentBlock = `Questions ${blockMatch[1]}-${blockMatch[2]}`;
      currentSection = 'questions';
      continue;
    }
    
    // Détecter un bloc de réponses
    const answerBlockMatch = line.match(ANSWER_BLOCK_PATTERN);
    if (answerBlockMatch) {
      currentSection = 'answers';
      blockEndIndex = i;
      continue;
    }
    
    // Extraire les questions dans le bloc actuel
    if (currentSection === 'questions' && blockStartIndex >= 0) {
      const questionMatch = line.match(QUESTION_PATTERN);
      if (questionMatch) {
        // Extraire la question complète
        let questionText = line;
        let j = i + 1;
        
        // Continuer jusqu'à la prochaine question ou fin de bloc
        while (j < lines.length && j < (blockEndIndex > 0 ? blockEndIndex : lines.length)) {
          if (lines[j].match(QUESTION_PATTERN) || lines[j].match(BLOCK_PATTERN)) break;
          if (!lines[j].match(ANSWER_PATTERN)) {
            questionText += ' ' + lines[j];
          }
          j++;
        }
        
        const question: Question = {
          id: `q_${questions.length + 1}`,
          type: detectQuestionType(questionText),
          text: questionText.trim(),
          options: [],
          correctAnswer: '',
          difficultyLevel: volume === 1 ? 'base' : 'intermediate',
          themes: []
        };
        
        questions.push(question);
        
        if (questions.length % 20 === 0) {
          console.log(`  ✅ ${questions.length} questions extraites`);
        }
      }
    }
  }
  
  // Créer un ExamSet avec toutes les questions
  if (questions.length > 0) {
    examSets.push({
      id: 'exam_all',
      title: `Annales Volume ${volume} - ${questions.length} questions`,
      themes: ['Général'],
      questions
    });
  }
  
  console.log(`✅ Total: ${questions.length} questions dans ${examSets.length} série(s)`);
  
  return {
    source: `annalescorrigées-Volume-${volume}.pdf`,
    type: 'annales',
    extractedAt: new Date().toISOString(),
    examSets
  };
}

function detectQuestionType(text: string): Question['type'] {
  if (/Choisissez.*bonnes réponses/i.test(text)) return 'QCM';
  if (/Vrai ou faux/i.test(text)) return 'QCM';
  if (/QCM/i.test(text)) return 'QCM';
  if (/QROC/i.test(text)) return 'QROC';
  if (/Remplissez.*schéma/i.test(text)) return 'DiagramCompletion';
  return 'CasClinique';
}

// Script principal
async function main() {
  console.log('📚 Parser robuste - Annales IADE\n');
  
  const volumes = [
    { volume: 1 as const, file: 'annalescorrigées-Volume-1.pdf' },
    { volume: 2 as const, file: 'annalescorrigées-Volume-2.pdf' }
  ];
  
  for (const { volume, file } of volumes) {
    console.log(`\n📄 Traitement: ${file}`);
    
    // Charger le texte brut déjà extrait
    const textPath = path.join(__dirname, '../tmp/extracted-text-sample.txt');
    const allText = fs.readFileSync(textPath, 'utf-8');
    
    // Extraire seulement les pages de ce volume (approximatif)
    const pages = allText.split('ANNALES CORRIGÉS DE');
    
    if (volume === 1) {
      // Prendre les premières pages pour Vol1
      const volumeText = pages.slice(0, 10).join('ANNALES CORRIGÉS DE');
      const parsed = parseAnnalesFromText(volumeText, volume);
      
      // Sauvegarder
      const outputPath = path.join(__dirname, '../src/data/concours/', `annales-volume-${volume}-v2.json`);
      fs.writeFileSync(outputPath, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log(`✅ Sauvegardé: ${path.basename(outputPath)}`);
    }
  }
}

if (import.meta.url.includes('parseAnnalesBlocks.ts')) {
  main().catch(console.error);
}

