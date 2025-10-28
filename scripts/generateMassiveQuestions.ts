/**
 * Script de génération massive de questions
 * Objectif: Générer 100+ questions via tous les générateurs
 * Cycle IADE-2, Tâche 1
 */

import * as fs from 'fs';
import * as path from 'path';
import { QCMGenerator } from './generators/qcmGenerator.js';
import { DefinitionGenerator } from './generators/definitionGenerator.js';
import { CasCliniqueGenerator } from './generators/casCliniqueGenerator.js';
import type { GeneratedQuestion } from './generators/baseGenerator.js';

interface GenerationStats {
  total: number;
  byType: Record<string, number>;
  byTheme: Record<string, number>;
  byDifficulty: Record<string, number>;
  bySource: Record<string, number>;
}

async function generateMassive() {
  console.log('\n🚀 GÉNÉRATION MASSIVE DE QUESTIONS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allQuestions: GeneratedQuestion[] = [];

  // 1. Charger les questions existantes
  const existingPath = path.join(process.cwd(), 'src/data/concours/all-questions-consolidated.json');
  let existingQuestions: GeneratedQuestion[] = [];
  
  if (fs.existsSync(existingPath)) {
    const data = JSON.parse(fs.readFileSync(existingPath, 'utf-8'));
    existingQuestions = data.questions || data || [];
    console.log(`📚 ${existingQuestions.length} questions existantes chargées\n`);
  }

  // 2. QCMGenerator - Exécution multiple pour maximiser la génération
  console.log('🔹 QCMGenerator en cours...');
  const qcmGen = new QCMGenerator({ maxQuestionsPerRun: 10 });
  
  // Exécuter 10 fois pour générer ~50-60 questions
  for (let i = 0; i < 10; i++) {
    const qcmQuestions = await qcmGen.generate({ existingQuestions: allQuestions });
    allQuestions.push(...qcmQuestions);
    process.stdout.write(`  Run ${i + 1}/10: +${qcmQuestions.length} questions\r`);
  }
  console.log(`\n  ✅ QCMGenerator: ${allQuestions.filter(q => q.source === 'qcm-generator').length} questions`);

  // 3. DefinitionGenerator - Exécution multiple
  console.log('\n🔹 DefinitionGenerator en cours...');
  const defGen = new DefinitionGenerator({ maxQuestionsPerRun: 8 });
  
  // Exécuter 8 fois pour générer ~30-40 questions
  for (let i = 0; i < 8; i++) {
    const defQuestions = await defGen.generate({ existingQuestions: allQuestions });
    allQuestions.push(...defQuestions);
    process.stdout.write(`  Run ${i + 1}/8: +${defQuestions.length} questions\r`);
  }
  console.log(`\n  ✅ DefinitionGenerator: ${allQuestions.filter(q => q.source === 'definition-generator').length} questions`);

  // 4. CasCliniqueGenerator - Exécution multiple
  console.log('\n🔹 CasCliniqueGenerator en cours...');
  const casGen = new CasCliniqueGenerator({ maxQuestionsPerRun: 8 });
  
  // Exécuter 10 fois pour générer ~40-50 cas cliniques
  for (let i = 0; i < 10; i++) {
    const casQuestions = await casGen.generate({ existingQuestions: allQuestions });
    allQuestions.push(...casQuestions);
    process.stdout.write(`  Run ${i + 1}/10: +${casQuestions.length} questions\r`);
  }
  console.log(`\n  ✅ CasCliniqueGenerator: ${allQuestions.filter(q => q.source === 'cas-clinique-generator').length} questions`);

  // 5. Dédupliquer (texte similaire)
  console.log('\n🔹 Déduplication en cours...');
  const uniqueQuestions = deduplicateQuestions(allQuestions);
  console.log(`  ✅ ${allQuestions.length} → ${uniqueQuestions.length} questions uniques`);

  // 6. Générer des questions supplémentaires avec variations
  console.log('\n🔹 Génération de variations...');
  const variations = generateVariations(uniqueQuestions.slice(0, 30));
  const finalQuestions = [...uniqueQuestions, ...variations];
  console.log(`  ✅ +${variations.length} variations générées`);

  // 7. Fusionner avec existantes
  const allConsolidated = [...existingQuestions, ...finalQuestions];
  const deduplicated = deduplicateQuestions(allConsolidated);
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ GÉNÉRATION TERMINÉE\n`);
  console.log(`📊 Résultat:`);
  console.log(`   - Existantes: ${existingQuestions.length}`);
  console.log(`   - Nouvelles: ${finalQuestions.length}`);
  console.log(`   - Total consolidé: ${deduplicated.length}\n`);

  // 8. Statistiques
  const stats = calculateStats(deduplicated);
  displayStats(stats);

  // 9. Sauvegarder
  const output = {
    questions: deduplicated,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: deduplicated.length,
      sources: ['qcm-generator', 'definition-generator', 'variations', 'existing'],
      stats
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/all-questions-v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`🏆 Objectif atteint: ${deduplicated.length >= 326 ? '✅' : '⚠️'} (cible: 326+)\n`);

  return deduplicated.length;
}

function deduplicateQuestions(questions: GeneratedQuestion[]): GeneratedQuestion[] {
  const seen = new Set<string>();
  const unique: GeneratedQuestion[] = [];

  for (const q of questions) {
    const key = q.text.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }

  return unique;
}

function generateVariations(baseQuestions: GeneratedQuestion[]): GeneratedQuestion[] {
  const variations: GeneratedQuestion[] = [];

  for (const base of baseQuestions) {
    if (base.type !== 'QCM' || !base.options || base.options.length < 2) continue;

    // Variation 1: Reformuler la question
    const variation1: GeneratedQuestion = {
      ...base,
      id: `${base.id}_var1`,
      text: reformulateQuestion(base.text),
      confidence: (base.confidence || 0.9) * 0.95
    };

    // Variation 2: Changer l'ordre des options
    const shuffledOptions = [...base.options];
    const correctText = base.options[base.correctAnswer as number];
    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }
    const newCorrectIndex = shuffledOptions.indexOf(correctText);

    const variation2: GeneratedQuestion = {
      ...base,
      id: `${base.id}_var2`,
      options: shuffledOptions,
      correctAnswer: newCorrectIndex,
      confidence: (base.confidence || 0.9) * 0.98
    };

    variations.push(variation1, variation2);
  }

  return variations;
}

function reformulateQuestion(text: string): string {
  // Reformulations simples
  const reformulations: Record<string, string> = {
    'Quelle est': 'Indiquez',
    'Quel est': 'Précisez',
    'Quels sont': 'Listez',
    'Définissez': 'Que désigne',
    'Citez': 'Énumérez'
  };

  for (const [old, neu] of Object.entries(reformulations)) {
    if (text.startsWith(old)) {
      return text.replace(old, neu);
    }
  }

  return text;
}

function calculateStats(questions: GeneratedQuestion[]): GenerationStats {
  const stats: GenerationStats = {
    total: questions.length,
    byType: {},
    byTheme: {},
    byDifficulty: {},
    bySource: {}
  };

  for (const q of questions) {
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    stats.byTheme[q.theme] = (stats.byTheme[q.theme] || 0) + 1;
    stats.byDifficulty[q.difficulty || 'unknown'] = (stats.byDifficulty[q.difficulty || 'unknown'] || 0) + 1;
    stats.bySource[q.source || 'unknown'] = (stats.bySource[q.source || 'unknown'] || 0) + 1;
  }

  return stats;
}

function displayStats(stats: GenerationStats) {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES DÉTAILLÉES\n');

  console.log('Par type:');
  Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const percent = ((count / stats.total) * 100).toFixed(1);
      console.log(`   - ${type}: ${count} (${percent}%)`);
    });

  console.log('\nTop 10 thèmes:');
  Object.entries(stats.byTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theme, count]) => {
      console.log(`   - ${theme}: ${count}`);
    });

  console.log('\nPar difficulté:');
  Object.entries(stats.byDifficulty)
    .sort((a, b) => b[1] - a[1])
    .forEach(([diff, count]) => {
      const percent = ((count / stats.total) * 100).toFixed(1);
      console.log(`   - ${diff}: ${count} (${percent}%)`);
    });

  console.log('\nPar source:');
  Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      const percent = ((count / stats.total) * 100).toFixed(1);
      console.log(`   - ${source}: ${count} (${percent}%)`);
    });
}

// Exécution
generateMassive().catch(console.error);

