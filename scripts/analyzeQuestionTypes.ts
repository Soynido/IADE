import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  const csvPath = path.join(__dirname, '../questions_audit - questions_audit.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  
  const lines = content.split('\n').slice(1); // Skip header
  const questionTypes: Map<string, number> = new Map();
  const questionExamples: Map<string, string[]> = new Map();
  
  lines.forEach(line => {
    if (!line.trim()) return;
    
    // Extract question text (second column)
    const match = line.match(/^[^,]+,([^,]+),/);
    if (!match) return;
    
    let questionText = match[1];
    // Remove quotes if present
    questionText = questionText.replace(/^"/, '').replace(/"$/, '');
    
    // Identify question type from first words
    const firstWords = questionText.split(' ').slice(0, 5).join(' ');
    let type = 'Autre';
    
    if (firstWords.toLowerCase().startsWith('quelle est la définition')) {
      type = 'Définition';
    } else if (firstWords.toLowerCase().startsWith('quelle structure')) {
      type = 'Anatomie / Structure';
    } else if (firstWords.toLowerCase().startsWith('quelle est la valeur')) {
      type = 'Valeur normale';
    } else if (firstWords.toLowerCase().startsWith('à quelle catégorie')) {
      type = 'Classification / Catégorie';
    } else if (firstWords.toLowerCase().startsWith('quel est le mécanisme')) {
      type = 'Mécanisme d\'action';
    } else if (firstWords.toLowerCase().startsWith('quelle est la dci')) {
      type = 'DCI (Dénomination Commune Internationale)';
    } else if (firstWords.toLowerCase().startsWith('parmi les propositions')) {
      type = 'QCM à propositions multiples';
    } else if (firstWords.toLowerCase().startsWith('quelle est la')) {
      type = 'Question ouverte "Quelle est la..."';
    } else if (firstWords.toLowerCase().startsWith('quel est')) {
      type = 'Question ouverte "Quel est..."';
    } else if (firstWords.toLowerCase().startsWith('qui')) {
      type = 'Question "Qui"';
    } else if (firstWords.toLowerCase().startsWith('quand')) {
      type = 'Question "Quand"';
    } else if (firstWords.toLowerCase().startsWith('où')) {
      type = 'Question "Où"';
    } else if (firstWords.toLowerCase().startsWith('comment')) {
      type = 'Question "Comment"';
    } else if (firstWords.toLowerCase().startsWith('combien')) {
      type = 'Question "Combien"';
    } else if (firstWords.toLowerCase().startsWith('quel')) {
      type = 'Question "Quel/Quelle"';
    }
    
    // Update count
    const count = questionTypes.get(type) || 0;
    questionTypes.set(type, count + 1);
    
    // Store example
    if (!questionExamples.has(type)) {
      questionExamples.set(type, []);
    }
    const examples = questionExamples.get(type)!;
    if (examples.length < 3) {
      examples.push(questionText);
    }
  });
  
  console.log('📊 TYPES DE QUESTIONS IDENTIFIÉS\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // Sort by frequency
  const sortedTypes = Array.from(questionTypes.entries())
    .sort((a, b) => b[1] - a[1]);
  
  sortedTypes.forEach(([type, count], index) => {
    const percent = ((count / lines.length) * 100).toFixed(1);
    console.log(`${index + 1}. ${type}`);
    console.log(`   📈 ${count} questions (${percent}%)`);
    
    // Show examples
    const examples = questionExamples.get(type) || [];
    if (examples.length > 0) {
      console.log(`   📝 Exemples:`);
      examples.forEach(ex => {
        const truncated = ex.length > 80 ? ex.substring(0, 80) + '...' : ex;
        console.log(`      • "${truncated}"`);
      });
    }
    console.log('');
  });
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n📊 Total: ${lines.length} questions analysées`);
  console.log(`📊 Types différents: ${questionTypes.size}`);
}

try {
  main();
} catch (error) {
  console.error('Erreur:', error);
}

