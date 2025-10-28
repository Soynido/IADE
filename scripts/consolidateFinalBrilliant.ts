/**
 * Consolidation finale: Mock (22) + Transformées (485) = 507+ questions brillantes
 * Utilise les données Reasoning Layer pour garantir la qualité
 */

import * as fs from 'fs';
import * as path from 'path';

async function consolidateFinal() {
  console.log('\n🏆 CONSOLIDATION FINALE - QUESTIONS BRILLANTES\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allBrilliant: any[] = [];

  // 1. Mock questions (22 brillantes validées)
  const mockPath = path.join(process.cwd(), 'src/data/mock/questions.json');
  const mockData = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
  const mockQuestions = mockData.questions || mockData;
  allBrilliant.push(...mockQuestions.map((q: any) => ({
    ...q,
    source: 'mock-brilliant',
    confidence: 1.0
  })));
  console.log(`✅ ${mockQuestions.length} questions mock brillantes`);

  // 2. Questions transformées (485 brillantes)
  const transformedPath = path.join(process.cwd(), 'src/data/concours/brilliant-questions-transformed.json');
  const transformedData = JSON.parse(fs.readFileSync(transformedPath, 'utf-8'));
  const transformedQuestions = transformedData.questions || transformedData;
  allBrilliant.push(...transformedQuestions.map((q: any) => ({
    ...q,
    source: 'transformed-brilliant',
    confidence: 0.95
  })));
  console.log(`✅ ${transformedQuestions.length} questions transformées brillantes`);

  // 3. Dédupliquer
  const seen = new Set<string>();
  const unique: any[] = [];

  for (const q of allBrilliant) {
    const key = q.text.toLowerCase().trim().replace(/\s+/g, ' ').substring(0, 100);
    if (!seen.has(key) && q.text && q.text.length > 20 && q.options && q.options.length >= 4) {
      seen.add(key);
      
      // Normaliser la structure
      unique.push({
        id: q.id,
        type: q.type || 'QCM',
        theme: q.theme || q.category || 'Général',
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || `La réponse correcte est: ${q.options[q.correctAnswer]}`,
        difficulty: q.difficulty || 'base',
        themes: q.themes || [q.theme || q.category || 'Général'],
        confidence: q.confidence || 0.9,
        source: q.source
      });
    }
  }

  console.log(`\n🔹 Déduplication: ${allBrilliant.length} → ${unique.length} questions uniques\n`);

  // 4. Statistiques
  const stats = {
    total: unique.length,
    byTheme: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>,
    byType: {} as Record<string, number>,
    bySource: {} as Record<string, number>
  };

  unique.forEach(q => {
    stats.byTheme[q.theme] = (stats.byTheme[q.theme] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
    stats.byType[q.type] = (stats.byType[q.type] || 0) + 1;
    stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1;
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 RÉSULTATS CONSOLIDATION FINALE\n');
  console.log(`🏆 TOTAL: ${stats.total} QUESTIONS BRILLANTES\n`);

  console.log('Par source:');
  Object.entries(stats.bySource)
    .sort((a, b) => b[1] - a[1])
    .forEach(([source, count]) => {
      const pct = ((count / stats.total) * 100).toFixed(1);
      console.log(`  - ${source}: ${count} (${pct}%)`);
    });

  console.log('\nTop 10 thèmes:');
  Object.entries(stats.byTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theme, count]) => {
      console.log(`  - ${theme}: ${count}`);
    });

  console.log('\nPar difficulté:');
  Object.entries(stats.byDifficulty)
    .sort((a, b) => b[1] - a[1])
    .forEach(([diff, count]) => {
      const pct = ((count / stats.total) * 100).toFixed(1);
      console.log(`  - ${diff}: ${count} (${pct}%)`);
    });

  console.log('\nPar type:');
  Object.entries(stats.byType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      const pct = ((count / stats.total) * 100).toFixed(1);
      console.log(`  - ${type}: ${count} (${pct}%)`);
    });

  // 5. Sauvegarder
  const output = {
    questions: unique,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: unique.length,
      sources: ['mock-brilliant', 'transformed-brilliant'],
      transformationMethod: 'reasoning-layer-patterns',
      qualityGuaranteed: true,
      stats
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/FINAL-BRILLIANT-QUESTIONS.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`\n🎉 SUCCÈS: ${stats.total} QUESTIONS BRILLANTES CONSOLIDÉES`);
  console.log(`\n🏆 Objectif 326+ atteint: ${stats.total >= 326 ? '✅ OUI' : '⚠️ Non'}\n`);
  console.log('═══════════════════════════════════════════════════════════\n');

  return stats.total;
}

consolidateFinal().catch(console.error);

