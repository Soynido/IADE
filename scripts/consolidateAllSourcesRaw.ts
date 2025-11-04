/**
 * Consolidation Toutes Sources - Phase 2
 * Cycle IADE-3: Rassembler + Nettoyer + Dédupliquer
 */

import * as fs from 'fs';
import * as path from 'path';
import { cleanQuestion } from './pipelines/ocrCleaner.js';

interface RawQuestion {
  text: string;
  options?: string[];
  answer?: string | number;
  explanation?: string;
  theme?: string;
  category?: string;
  difficulty?: string;
  source?: string;
  pageNumber?: number;
  [key: string]: any;
}

interface ConsolidatedQuestion {
  id: string;
  type: 'QCM' | 'QROC' | 'CasClinique';
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  themes: string[];
  confidence: number;
  source: string;
  cleaningReport: {
    artefactsRemoved: string[];
    wasProcessed: boolean;
  };
}

async function consolidateAllSources() {
  console.log('\n🔄 CONSOLIDATION TOUTES SOURCES - PHASE 2\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allRaw: RawQuestion[] = [];

  // 1. Charger all-questions-v2.json (838 questions)
  console.log('📁 Chargement all-questions-v2.json...');
  const allQuestionsPath = path.join(process.cwd(), 'src/data/concours/all-questions-v2.json');
  if (fs.existsSync(allQuestionsPath)) {
    const data = JSON.parse(fs.readFileSync(allQuestionsPath, 'utf-8'));
    const questions = data.questions || [];
    allRaw.push(...questions.map((q: any) => ({
      ...q,
      source: q.source || 'all-questions-v2'
    })));
    console.log(`  ✅ ${questions.length} questions chargées\n`);
  }

  // 2. Charger annales-volume-1.json
  console.log('📁 Chargement annales-volume-1.json...');
  const annalesV1Path = path.join(process.cwd(), 'src/data/concours/annales-volume-1.json');
  if (fs.existsSync(annalesV1Path)) {
    const data = JSON.parse(fs.readFileSync(annalesV1Path, 'utf-8'));
    const questions = data.examSets?.[0]?.questions || data.questions || [];
    allRaw.push(...questions.map((q: any) => ({
      ...q,
      source: 'annales-v1'
    })));
    console.log(`  ✅ ${questions.length} questions chargées\n`);
  }

  // 3. Charger annales-volume-2.json
  console.log('📁 Chargement annales-volume-2.json...');
  const annalesV2Path = path.join(process.cwd(), 'src/data/concours/annales-volume-2.json');
  if (fs.existsSync(annalesV2Path)) {
    const data = JSON.parse(fs.readFileSync(annalesV2Path, 'utf-8'));
    const questions = data.examSets?.[0]?.questions || data.questions || [];
    allRaw.push(...questions.map((q: any) => ({
      ...q,
      source: 'annales-v2'
    })));
    console.log(`  ✅ ${questions.length} questions chargées\n`);
  }

  // 4. Charger cours-complet.json (concepts → questions)
  console.log('📁 Chargement cours-complet.json...');
  const coursPath = path.join(process.cwd(), 'src/data/concours/cours-complet.json');
  if (fs.existsSync(coursPath)) {
    const data = JSON.parse(fs.readFileSync(coursPath, 'utf-8'));
    const chapters = data.chapters || [];
    let conceptCount = 0;
    
    chapters.forEach((chapter: any) => {
      chapter.sections?.forEach((section: any) => {
        section.concepts?.forEach((concept: any) => {
          // Convertir concept en question
          if (concept.term && concept.definition && concept.definition.length > 30) {
            allRaw.push({
              text: `Définissez : ${concept.term}`,
              options: [],
              answer: concept.definition,
              explanation: concept.definition,
              theme: chapter.themes?.[0] || 'Général',
              difficulty: concept.difficultyLevel || 'easy',
              source: 'cours-complet'
            });
            conceptCount++;
          }
        });
      });
    });
    console.log(`  ✅ ${conceptCount} concepts convertis en questions\n`);
  }

  console.log(`📊 Total brut: ${allRaw.length} questions\n`);

  // 5. Filtrer questions valides
  console.log('🔹 Filtrage questions valides...');
  const valid = allRaw.filter(q => {
    return q.text && q.text.length > 10 && q.text.length < 2000;
  });
  console.log(`  ✅ ${valid.length} questions valides (${allRaw.length - valid.length} rejetées)\n`);

  // 6. Nettoyer OCR
  console.log('🧹 Nettoyage OCR profond...');
  const cleaned: ConsolidatedQuestion[] = [];
  
  for (let i = 0; i < valid.length; i++) {
    const q = valid[i];
    
    // Nettoyer avec ocrCleaner
    const cleanedQ = cleanQuestion({
      text: q.text,
      options: q.options || [],
      explanation: q.explanation || ''
    });

    // Convertir en format consolidé
    const consolidated: ConsolidatedQuestion = {
      id: `raw_${Date.now()}_${i}`,
      type: q.type || 'QCM',
      text: cleanedQ.text,
      options: cleanedQ.options.length >= 4 ? cleanedQ.options : generateMissingOptions(cleanedQ.text, cleanedQ.options),
      correctAnswer: typeof q.answer === 'number' ? q.answer : (q.correctAnswer || 0),
      explanation: cleanedQ.explanation || `La réponse correcte est importante dans le cadre du concours IADE.`,
      theme: q.theme || q.category || 'Général',
      difficulty: normalizeDifficulty(q.difficulty),
      themes: [q.theme || q.category || 'Général'],
      confidence: cleanedQ.confidence,
      source: q.source || 'unknown',
      cleaningReport: {
        artefactsRemoved: cleanedQ.artefactsRemoved,
        wasProcessed: true
      }
    };

    cleaned.push(consolidated);

    if ((i + 1) % 100 === 0) {
      process.stdout.write(`  Nettoyées: ${i + 1}/${valid.length}\r`);
    }
  }
  console.log(`\n  ✅ ${cleaned.length} questions nettoyées\n`);

  // 7. Dédupliquer
  console.log('🔹 Déduplication...');
  const unique = deduplicateQuestions(cleaned);
  console.log(`  ✅ ${unique.length} questions uniques (${cleaned.length - unique.length} doublons supprimés)\n`);

  // 8. Filtrer top 250 par confiance
  console.log('🔹 Sélection top 250 par confiance...');
  const sorted = unique.sort((a, b) => b.confidence - a.confidence);
  const top250 = sorted.slice(0, 250);
  console.log(`  ✅ Top 250 sélectionnées (confiance moyenne: ${(top250.reduce((sum, q) => sum + q.confidence, 0) / top250.length).toFixed(2)})\n`);

  // 9. Statistiques
  const stats = calculateStats(top250);

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES CONSOLIDATION\n');
  console.log(`Total: ${stats.total}`);
  console.log(`\nPar source:`);
  Object.entries(stats.bySource).forEach(([source, count]) => {
    console.log(`  - ${source}: ${count}`);
  });
  console.log(`\nPar thème (top 10):`);
  Object.entries(stats.byTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theme, count]) => {
      console.log(`  - ${theme}: ${count}`);
    });
  console.log(`\nPar difficulté:`);
  Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
    console.log(`  - ${diff}: ${count}`);
  });
  console.log(`\nConfiance moyenne: ${stats.avgConfidence.toFixed(2)}`);

  // 10. Sauvegarder
  const output = {
    questions: top250,
    metadata: {
      consolidatedAt: new Date().toISOString(),
      totalRaw: allRaw.length,
      totalValid: valid.length,
      totalCleaned: cleaned.length,
      totalUnique: unique.length,
      totalSelected: top250.length,
      sources: ['all-questions-v2', 'annales-v1', 'annales-v2', 'cours-complet'],
      cleaningApplied: true,
      stats
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/ALL-RAW-CONSOLIDATED.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`\n🏆 PHASE 2 TERMINÉE: ${top250.length} questions prêtes pour IA\n`);

  return top250.length;
}

function generateMissingOptions(text: string, existing: string[]): string[] {
  const options = [...existing];
  const defaultOptions = [
    'Cette notion n\'est pas définie en médecine',
    'Variable selon le contexte clinique',
    'Nécessite des examens complémentaires',
    'Non applicable en pratique IADE'
  ];

  while (options.length < 4) {
    options.push(defaultOptions[options.length - existing.length] || 'Autre réponse');
  }

  return options;
}

function normalizeDifficulty(diff: any): 'easy' | 'medium' | 'hard' {
  const d = String(diff || 'easy').toLowerCase();
  if (d.includes('base') || d.includes('easy') || d.includes('facile')) return 'easy';
  if (d.includes('inter') || d.includes('medium') || d.includes('moyen')) return 'medium';
  if (d.includes('adv') || d.includes('hard') || d.includes('diff')) return 'hard';
  return 'easy';
}

function deduplicateQuestions(questions: ConsolidatedQuestion[]): ConsolidatedQuestion[] {
  const seen = new Set<string>();
  const unique: ConsolidatedQuestion[] = [];

  for (const q of questions) {
    const key = q.text.toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 100);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }

  return unique;
}

function calculateStats(questions: ConsolidatedQuestion[]) {
  const stats = {
    total: questions.length,
    bySource: {} as Record<string, number>,
    byTheme: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    avgConfidence: 0
  };

  questions.forEach(q => {
    stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1;
    stats.byTheme[q.theme] = (stats.byTheme[q.theme] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
  });

  stats.avgConfidence = questions.reduce((sum, q) => sum + q.confidence, 0) / questions.length;

  return stats;
}

// Exécution
consolidateAllSources().catch(console.error);

