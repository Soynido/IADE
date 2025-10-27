/**
 * Script simple pour extraire les questions depuis le JSON brut existant
 * et les structurer proprement
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractQuestionsFromText(text: string): any[] {
  const questions: any[] = [];
  
  // Séparer par blocs "QUESTIONS DE X À Y"
  const blocks = text.split(/QUESTIONS\s+DE\s+\d+\s+À\s+\d+/i);
  
  for (const block of blocks) {
    if (!block.trim()) continue;
    
    // Patterns pour détecter les questions
    const lines = block.split('\n').filter(l => l.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Détecter début de question
      if (/^(\d+\)|\([1-9]|Définissez|Citez|Expliquez|Donnez|Choisissez|Remplissez|Vrai ou faux|Quelle|Quel|Comment)/i.test(line)) {
        let questionText = line;
        let j = i + 1;
        
        // Continuer jusqu'à la prochaine question
        while (j < lines.length) {
          const nextLine = lines[j].trim();
          if (/^(\d+\)|\([1-9]|Définissez|Citez|Expliquez|Donnez)/i.test(nextLine)) break;
          if (nextLine.length > 5) {
            questionText += ' ' + nextLine;
          }
          j++;
        }
        
        questions.push({
          id: `q_${questions.length + 1}`,
          text: questionText.substring(0, 500).trim(),
          type: detectType(questionText),
          difficulty: 'base'
        });
        
        if (questions.length % 20 === 0) {
          console.log(`  ✅ ${questions.length} questions extraites`);
        }
      }
    }
  }
  
  return questions;
}

function detectType(text: string): string {
  if (/Choisissez|bonnes réponses/i.test(text)) return 'QCM';
  if (/Vrai ou faux/i.test(text)) return 'QCM';
  if (/Remplissez|schéma/i.test(text)) return 'DiagramCompletion';
  return 'QROC';
}

async function main() {
  console.log('📚 Extraction des questions depuis JSON brut\n');
  
  // Charger les JSON existants
  const volume1Path = path.join(__dirname, '../src/data/concours/annales-volume-1.json');
  const volume2Path = path.join(__dirname, '../src/data/concours/annales-volume-2.json');
  
  // Volume 1
  if (fs.existsSync(volume1Path)) {
    const data = JSON.parse(fs.readFileSync(volume1Path, 'utf-8'));
    const rawText = data.examSets[0]?.questions[0]?.text || '';
    
    if (rawText) {
      console.log('📄 Volume 1: Extraction en cours...');
      const questions = extractQuestionsFromText(rawText);
      
      data.examSets[0].questions = questions;
      
      fs.writeFileSync(volume1Path, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ ${questions.length} questions extraites pour Volume 1\n`);
    }
  }
  
  // Volume 2 (même logique)
  if (fs.existsSync(volume2Path)) {
    const data = JSON.parse(fs.readFileSync(volume2Path, 'utf-8'));
    const rawText = data.examSets[0]?.questions[0]?.text || '';
    
    if (rawText) {
      console.log('📄 Volume 2: Extraction en cours...');
      const questions = extractQuestionsFromText(rawText);
      
      data.examSets[0].questions = questions;
      
      fs.writeFileSync(volume2Path, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`✅ ${questions.length} questions extraites pour Volume 2\n`);
    }
  }
}

main().catch(console.error);

