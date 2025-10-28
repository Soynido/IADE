/**
 * Consolidation des questions de QUALITÉ uniquement
 * Sources: mock + generated-v2 + nouveaux générateurs (hier + aujourd'hui)
 * Cycle IADE-2
 */

import * as fs from 'fs';
import * as path from 'path';
import { QCMGenerator } from './generators/qcmGenerator.js';
import { DefinitionGenerator } from './generators/definitionGenerator.js';
import { CasCliniqueGenerator } from './generators/casCliniqueGenerator.js';
import type { GeneratedQuestion } from './generators/baseGenerator.js';

async function consolidateQuality() {
  console.log('\n🎯 CONSOLIDATION QUESTIONS DE QUALITÉ\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log('Sources validées: mock + generated-v2 + générateurs récents\n');

  const qualityQuestions: GeneratedQuestion[] = [];

  // 1. Charger questions mock (22 questions manuelles de qualité)
  console.log('📚 Chargement questions mock...');
  const mockPath = path.join(process.cwd(), 'src/data/mock/questions.json');
  if (fs.existsSync(mockPath)) {
    const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
    const normalized = normalizeQuestions(mockData, 'mock-manual');
    qualityQuestions.push(...normalized);
    console.log(`  ✅ ${normalized.length} questions mock chargées`);
  }

  // 2. Charger generated-questions-v2.json (6 questions générateurs validées)
  console.log('\n📚 Chargement generated-v2...');
  const genV2Path = path.join(process.cwd(), 'src/data/concours/generated-questions-v2.json');
  if (fs.existsSync(genV2Path)) {
    const genV2Data = JSON.parse(fs.readFileSync(genV2Path, 'utf-8'));
    const normalized = normalizeQuestions(genV2Data, 'generator-v2');
    qualityQuestions.push(...normalized);
    console.log(`  ✅ ${normalized.length} questions generated-v2 chargées`);
  }

  // 3. Générer nouvelles questions via générateurs (100+)
  console.log('\n🔹 Génération nouvelles questions (objectif: 100+)...\n');

  // QCM - Multiplier les templates
  console.log('  QCMGenerator (20 runs)...');
  const qcmGen = new QCMGenerator({ maxQuestionsPerRun: 6 });
  for (let i = 0; i < 20; i++) {
    const qcmQuestions = await qcmGen.generate();
    qualityQuestions.push(...qcmQuestions);
  }
  console.log(`  ✅ QCMGenerator: ${qualityQuestions.filter(q => q.source === 'qcm-generator').length} questions`);

  // Définitions - Multiplier
  console.log('  DefinitionGenerator (15 runs)...');
  const defGen = new DefinitionGenerator({ maxQuestionsPerRun: 8 });
  for (let i = 0; i < 15; i++) {
    const defQuestions = await defGen.generate();
    qualityQuestions.push(...defQuestions);
  }
  console.log(`  ✅ DefinitionGenerator: ${qualityQuestions.filter(q => q.source === 'definition-generator').length} questions`);

  // Cas cliniques - Multiplier
  console.log('  CasCliniqueGenerator (15 runs)...');
  const casGen = new CasCliniqueGenerator({ maxQuestionsPerRun: 8 });
  for (let i = 0; i < 15; i++) {
    const casQuestions = await casGen.generate();
    qualityQuestions.push(...casQuestions);
  }
  console.log(`  ✅ CasCliniqueGenerator: ${qualityQuestions.filter(q => q.source === 'cas-clinique-generator').length} questions`);

  // 4. Dédupliquer
  console.log('\n🔹 Déduplication...');
  const unique = deduplicateByText(qualityQuestions);
  console.log(`  ✅ ${qualityQuestions.length} → ${unique.length} questions uniques`);

  // 5. Statistiques
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 RÉSULTAT FINAL\n');
  
  const stats = {
    total: unique.length,
    byType: {} as Record<string, number>,
    byTheme: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    bySource: {} as Record<string, number>
  };

  unique.forEach(q => {
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    stats.byTheme[q.theme] = (stats.byTheme[q.theme] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
    stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1;
  });

  console.log(`Total: ${stats.total} questions de qualité\n`);
  
  console.log('Par type:');
  Object.entries(stats.byType).forEach(([type, count]) => {
    const pct = ((count / stats.total) * 100).toFixed(1);
    console.log(`  - ${type}: ${count} (${pct}%)`);
  });

  console.log('\nTop 10 thèmes:');
  Object.entries(stats.byTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theme, count]) => {
      console.log(`  - ${theme}: ${count}`);
    });

  console.log('\nPar source:');
  Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      const pct = ((count / stats.total) * 100).toFixed(1);
      console.log(`  - ${source}: ${count} (${pct}%)`);
    });

  // 6. Sauvegarder
  const output = {
    questions: unique,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: unique.length,
      sources: ['mock-manual', 'generator-v2', 'qcm-generator', 'definition-generator', 'cas-clinique-generator'],
      qualityFilter: 'only-validated-recent',
      stats
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/quality-questions-final.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════════');
  
  const target = 326;
  const achieved = unique.length >= target;
  console.log(`🎯 Objectif: ${unique.length}/${target} ${achieved ? '✅ ATTEINT' : '⚠️ En cours'}\n`);

  return unique.length;
}

function normalizeQuestions(data: any, source: string): GeneratedQuestion[] {
  const questions = Array.isArray(data) ? data : (data.questions || []);
  
  return questions.map((q: any, idx: number) => ({
    id: q.id || `${source}_${idx}`,
    type: q.type || 'QCM',
    theme: q.theme || q.category || 'Général',
    text: q.text || q.question || '',
    options: q.options || [],
    correctAnswer: q.correctAnswer ?? -1,
    explanation: q.explanation || '',
    difficulty: q.difficulty || 'base',
    themes: q.themes || [q.theme || q.category || 'Général'],
    confidence: q.confidence || 0.9,
    source
  }));
}

function deduplicateByText(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  const seen = new Set<string>();
  const unique: GeneratedQuestion[] = [];

  for (const q of questions) {
    const key = q.text.toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 100);
    if (!seen.has(key) && q.text.length > 10) {
      seen.add(key);
      unique.push(q);
    }
  }

  return unique;
}

consolidateQuality().catch(console.error);

