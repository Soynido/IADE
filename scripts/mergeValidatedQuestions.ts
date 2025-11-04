import fs from 'fs';
import path from 'path';

interface Question {
  id: string;
  question: string;
  choices?: string[];
  options?: string[];
  correct: string;
  explanation: string;
  source?: string;
  generator?: string;
  domain?: string;
  theme?: string;
  difficulty?: string;
  points?: number;
  pathology?: string;
}

function mergeValidatedQuestions() {
  console.log('🔄 Fusion des questions validées...');
  
  const existingPath = path.join(process.cwd(), 'src/data/compiledQuestions.json');
  const validatedPath = path.join(process.cwd(), 'src/data/questions-validated.json');
  
  // Vérifier que les fichiers existent
  if (!fs.existsSync(existingPath)) {
    console.error('❌ compiledQuestions.json non trouvé');
    return;
  }
  
  if (!fs.existsSync(validatedPath)) {
    console.warn('⚠️ questions-validated.json non trouvé. Rien à fusionner.');
    return;
  }
  
  // Charger
  const existing: Question[] = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
  const validated: Question[] = JSON.parse(fs.readFileSync(validatedPath, 'utf-8'));
  
  console.log(`  Existantes: ${existing.length}`);
  console.log(`  Nouvelles IA: ${validated.length}`);
  
  // Convertir format IA → format app
  const convertedIA = validated.map((q, i) => ({
    id: q.id || `ai_${i}`,
    question: q.question,
    options: q.choices || [], // Renommer choices → options
    correct: q.correct,
    explanation: q.explanation,
    theme: q.domain || 'Général',
    difficulty: mapDifficulty(q),
    points: calculatePoints(q),
    source: 'ai-generated',
    generator: q.generator || 'ollama-meditron',
    pathology: q.domain
  }));
  
  // Dédupliquer (similarité textuelle simple)
  const merged = [...existing];
  let addedCount = 0;
  
  for (const newQ of convertedIA) {
    // Vérifier que les questions ont bien un champ question
    if (!newQ.question || !newQ.question.trim()) {
      console.log(`  ⚠️ Question invalide ignorée`);
      continue;
    }
    
    const isDuplicate = existing.some(
      existingQ => 
        existingQ.question && similarity(existingQ.question, newQ.question) > 0.90
    );
    
    if (!isDuplicate) {
      merged.push(newQ);
      addedCount++;
    } else {
      console.log(`  ⚠️ Doublon ignoré: ${newQ.question.slice(0, 50)}...`);
    }
  }
  
  // Sauvegarder
  fs.writeFileSync(
    existingPath,
    JSON.stringify(merged, null, 2),
    'utf-8'
  );
  
  console.log(`✅ Fusion terminée`);
  console.log(`  Total: ${merged.length} questions`);
  console.log(`  Ajoutées: ${addedCount}`);
}

function mapDifficulty(q: any): string {
  const score = q.validation?.overall_score || 0.8;
  if (score > 0.9) return 'Difficile';
  if (score > 0.8) return 'Moyen';
  return 'Facile';
}

function calculatePoints(q: any): number {
  const difficulty = mapDifficulty(q);
  return difficulty === 'Difficile' ? 3 : (difficulty === 'Moyen' ? 2 : 1);
}

function similarity(s1: string, s2: string): number {
  // Protection contre valeurs undefined/null
  if (!s1 || !s2) return 0;
  
  // Similarité simple basée sur mots communs
  const words1 = new Set(s1.toLowerCase().split(/\s+/));
  const words2 = new Set(s2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  
  return union.size > 0 ? intersection.size / union.size : 0;
}

mergeValidatedQuestions();

