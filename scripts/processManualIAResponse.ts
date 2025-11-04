/**
 * Traitement Réponse IA Manuelle (Chat)
 * Cycle IADE-3 - Phase 3 Alternative
 * 
 * Consolide les réponses IA des batches manuels
 */

import * as fs from 'fs';
import * as path from 'path';

interface ImprovedQuestion {
  num: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  theme: string;
  difficulty: string;
  themes: string[];
}

async function processManualIAResponses() {
  console.log('\n📥 TRAITEMENT RÉPONSES IA MANUELLES\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allImproved: any[] = [];
  const batchFiles = [
    'BATCH_1_IMPROVED.json',
    'BATCH_2_IMPROVED.json',
    'BATCH_3_IMPROVED.json'
  ];

  // Charger tous les batches améliorés
  for (const file of batchFiles) {
    const filePath = path.join(process.cwd(), file);
    
    if (fs.existsSync(filePath)) {
      console.log(`📁 Chargement ${file}...`);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const questions = Array.isArray(data) ? data : data.questions || [];
      
      allImproved.push(...questions.map((q: ImprovedQuestion) => ({
        id: `manual_ai_${Date.now()}_${q.num}`,
        type: 'QCM',
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        theme: q.theme,
        difficulty: q.difficulty,
        themes: q.themes || [q.theme],
        confidence: 0.95,
        source: 'manual-ai-improved'
      })));
      
      console.log(`  ✅ ${questions.length} questions chargées\n`);
    } else {
      console.log(`  ⚠️ ${file} non trouvé, ignoré\n`);
    }
  }

  if (allImproved.length === 0) {
    console.error('❌ Aucune question améliorée trouvée');
    console.log('\n📝 Instructions:');
    console.log('   1. Copier contenu de PROMPT_BATCH_1.md');
    console.log('   2. Coller dans le chat');
    console.log('   3. Copier réponse JSON dans BATCH_1_IMPROVED.json');
    console.log('   4. Relancer ce script\n');
    return;
  }

  console.log(`📊 Total: ${allImproved.length} questions améliorées manuellement\n`);

  // Statistiques
  const stats = {
    total: allImproved.length,
    byTheme: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>
  };

  allImproved.forEach(q => {
    stats.byTheme[q.theme] = (stats.byTheme[q.theme] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES\n');
  console.log(`Total: ${stats.total}\n`);
  console.log('Par thème:');
  Object.entries(stats.byTheme).forEach(([theme, count]) => {
    console.log(`  - ${theme}: ${count}`);
  });
  console.log('\nPar difficulté:');
  Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
    console.log(`  - ${diff}: ${count}`);
  });

  // Sauvegarder
  const output = {
    questions: allImproved,
    metadata: {
      improvedAt: new Date().toISOString(),
      method: 'manual-ai-chat',
      totalImproved: allImproved.length,
      stats
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/AI-IMPROVED-QUESTIONS.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`\n🏆 ${allImproved.length} questions brillantes prêtes pour Phase 4 !\n`);
}

processManualIAResponses().catch(console.error);

