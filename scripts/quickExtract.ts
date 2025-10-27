/**
 * Quick extract - Extraire vite les questions depuis le texte
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractQuick(text: string): any[] {
  const questions: any[] = [];
  
  // Split par phrases qui commencent par des verbes d'action
  const patterns = [
    /(?:^|\.\s+)(Définissez|Citez|占有nez|Expliquez|Choisissez|Remplissez|Vrai ou faux)[^.]*\./gim,
    /(\d+\)[^.]*\.)/gm,
    /(\([a-eA-E]\)[^.]*\.)/gm
  ];
  
  let qNum = 1;
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      questions.push({
        id: `q_${qNum++}`,
        text: match[0].trim(),
        type: 'QROC',
        difficulty: 'base'
      });
    }
  }
  
  return questions;
}

async function main() {
  console.log('🚀 Quick Extract\n');
  
  // Utiliser le texte brut observé
  const volume1Path = path.join(__dirname, '../src/data/concours/annales-volume-1.json');
  const data = JSON.parse(fs.readFileSync(volume1Path, 'utf-8'));
  const rawText = data.examSets[0]?.questions[0]?.text || '';
  
  console.log('📝 Texte brut:', rawText.substring(0, 300));
  console.log('\n🔍 Extraction...');
  
  const questions = extractQuick(rawText);
  
  console.log(`\n✅ ${questions.length} questions extraites`);
  
  if (questions.length > 0) {
    // Sauvegarder
    data.examSets[0].questions = questions;
    fs.writeFileSync(volume1Path, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`💾 Sauvegardé`);
  }
}

main().catch(console.error);

