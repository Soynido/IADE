/**
 * Script pour consolider toutes les questions disponibles
 * Objectif: Atteindre 100+ questions pour confiance 0.97
 */

import * as fs from 'fs';
import * as path from 'path';

interface Question {
  id: string;
  type: string;
  theme: string;
  text: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  difficulty?: string;
  themes?: string[];
  confidence?: number;
}

async function consolidateQuestions() {
  console.log('\n📊 CONSOLIDATION DES QUESTIONS\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  const allQuestions: Question[] = [];
  const seenIds = new Set<string>();
  const seenTexts = new Set<string>();

  // Sources de questions
  const sources = [
    'src/data/mock/questions.json',
    'src/data/concours/questions-merged.json',
    'src/data/concours/generated-questions-v2.json',
    'src/data/generatedQuestions.json',
    'src/data/compiledQuestions.json'
  ];

  for (const source of sources) {
    const fullPath = path.join(process.cwd(), source);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⏭️  ${source} - Non trouvé`);
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
      const questions = data.questions || data || [];
      
      let added = 0;
      for (const q of questions) {
        // Normaliser l'ID
        const id = q.id || `q_${allQuestions.length + 1}`;
        const textKey = q.text?.toLowerCase().trim();

        // Éviter les doublons
        if (seenIds.has(id) || seenTexts.has(textKey)) {
          continue;
        }

        // Valider la question
        if (!q.text || q.text.length < 10) {
          continue;
        }

        seenIds.add(id);
        seenTexts.add(textKey);

        // Normaliser la structure
        const normalized: Question = {
          id,
          type: q.type || 'QCM',
          theme: q.theme || q.category || 'Général',
          text: q.text,
          options: q.options || [],
          correctAnswer: q.correctAnswer ?? -1,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'base',
          themes: q.themes || [q.theme || 'Général'],
          confidence: q.confidence || 0.85
        };

        allQuestions.push(normalized);
        added++;
      }

      console.log(`✅ ${source}`);
      console.log(`   → ${added} questions ajoutées (${questions.length} total dans le fichier)`);
    } catch (error) {
      console.log(`❌ ${source} - Erreur: ${error}`);
    }
  }

  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`✅ Total: ${allQuestions.length} questions uniques consolidées\n`);

  // Statistiques par type
  const byType = allQuestions.reduce((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('📊 Par type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`);
  });

  // Statistiques par thème
  const byTheme = allQuestions.reduce((acc, q) => {
    acc[q.theme] = (acc[q.theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\n📊 Top 10 thèmes:');
  Object.entries(byTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theme, count]) => {
      console.log(`   - ${theme}: ${count}`);
    });

  // Sauvegarder
  const output = {
    questions: allQuestions,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: allQuestions.length,
      sources: sources.filter(s => fs.existsSync(path.join(process.cwd(), s))),
      byType,
      byTheme: Object.fromEntries(
        Object.entries(byTheme)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
      )
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/all-questions-consolidated.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log(`\n═══════════════════════════════════════════════════════════`);
  console.log(`✅ CONSOLIDATION TERMINÉE\n`);

  return allQuestions.length;
}

consolidateQuestions().catch(console.error);

