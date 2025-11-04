/**
 * Amélioration Questions via IA GPT-4
 * Cycle IADE-3 - Phase 3
 * 
 * ⚠️ IMPORTANT: Nécessite OPENAI_API_KEY dans .env
 */

import * as fs from 'fs';
import * as path from 'path';
import OpenAI from 'openai';
import { MEDICAL_IMPROVEMENT_PROMPT, SYSTEM_PROMPT } from './aiImprovementPrompt.js';

interface ConsolidatedQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  theme: string;
  difficulty: string;
  source: string;
  confidence: number;
}

interface ImprovedQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  theme: string;
  difficulty: 'base' | 'intermediate' | 'advanced';
  themes: string[];
}

interface ImproveConfig {
  batchSize: number;
  maxBatches: number;
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-4o';
  temperature: number;
}

const DEFAULT_CONFIG: ImproveConfig = {
  batchSize: 10,
  maxBatches: 15, // 150 questions max
  model: 'gpt-4o',
  temperature: 0.7
};

async function improveQuestionsBatch(
  questions: ConsolidatedQuestion[],
  config: ImproveConfig = DEFAULT_CONFIG
): Promise<ImprovedQuestion[]> {
  
  // Vérifier API Key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ ERREUR: OPENAI_API_KEY non définie dans .env');
    console.log('\n📝 Pour utiliser cette fonctionnalité :');
    console.log('   1. Créer fichier .env à la racine de iade-app');
    console.log('   2. Ajouter: OPENAI_API_KEY=sk-...');
    console.log('   3. Relancer le script\n');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  console.log('\n🤖 AMÉLIORATION IA GPT-4 - PHASE 3\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  console.log(`Modèle: ${config.model}`);
  console.log(`Batch size: ${config.batchSize} questions/batch`);
  console.log(`Max batches: ${config.maxBatches}`);
  console.log(`Total max: ${config.batchSize * config.maxBatches} questions\n`);

  const improved: ImprovedQuestion[] = [];
  const batches = chunkArray(questions, config.batchSize);
  const totalBatches = Math.min(batches.length, config.maxBatches);

  for (let i = 0; i < totalBatches; i++) {
    const batch = batches[i];
    
    console.log(`📤 Batch ${i + 1}/${totalBatches} (${batch.length} questions)...`);

    try {
      // Préparer batch pour prompt
      const batchForPrompt = batch.map(q => ({
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        theme: q.theme
      }));

      const prompt = `${MEDICAL_IMPROVEMENT_PROMPT}\n\n${JSON.stringify(batchForPrompt, null, 2)}`;

      // Appel API OpenAI
      const response = await openai.chat.completions.create({
        model: config.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: 8000,
        response_format: { type: 'json_object' } // Force JSON
      });

      const content = response.choices[0].message.content!;
      
      // Parser réponse
      let improvedBatch: ImprovedQuestion[];
      try {
        const parsed = JSON.parse(content);
        improvedBatch = parsed.questions || parsed;
      } catch {
        // Si JSON invalide, essayer de récupérer
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          improvedBatch = JSON.parse(jsonMatch[0]);
        } else {
          console.error(`  ❌ Batch ${i + 1}: JSON invalide, batch ignoré`);
          continue;
        }
      }

      improved.push(...improvedBatch);

      console.log(`  ✅ Batch ${i + 1}: ${improvedBatch.length} questions améliorées`);
      console.log(`  📊 Total: ${improved.length} questions\n`);

      // Rate limiting (éviter dépassement quota)
      await sleep(2000);

    } catch (error: any) {
      console.error(`  ❌ Batch ${i + 1}: Erreur API - ${error.message}`);
      console.log(`  ⏭️  Passage au batch suivant...\n`);
      continue;
    }
  }

  console.log('═══════════════════════════════════════════════════════════');
  console.log(`\n🏆 AMÉLIORATION IA TERMINÉE: ${improved.length} questions brillantes\n`);

  return improved;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Exécution principale
async function main() {
  console.log('\n🚀 LANCEMENT AMÉLIORATION IA GPT-4\n');

  // Charger questions consolidées
  const inputPath = path.join(process.cwd(), 'src/data/concours/ALL-RAW-CONSOLIDATED.json');
  if (!fs.existsSync(inputPath)) {
    console.error('❌ Fichier ALL-RAW-CONSOLIDATED.json introuvable');
    console.log('   Exécuter d\'abord: npx tsx scripts/consolidateAllSourcesRaw.ts\n');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const questions = data.questions || [];

  console.log(`📚 ${questions.length} questions chargées\n`);

  // Améliorer via IA
  const improved = await improveQuestionsBatch(questions, {
    batchSize: 10,
    maxBatches: 15, // Max 150 questions (coût ~$3-5)
    model: 'gpt-4o',
    temperature: 0.7
  });

  if (improved.length === 0) {
    console.error('❌ Aucune question améliorée, arrêt');
    process.exit(1);
  }

  // Ajouter IDs et métadonnées
  const final = improved.map((q, i) => ({
    id: `ai_improved_${Date.now()}_${i}`,
    type: 'QCM' as const,
    ...q,
    confidence: 0.95,
    source: 'gpt-4-improved'
  }));

  // Statistiques
  const stats = {
    total: final.length,
    byTheme: {} as Record<string, number>,
    byDifficulty: {} as Record<string, number>
  };

  final.forEach(q => {
    stats.byTheme[q.theme] = (stats.byTheme[q.theme] || 0) + 1;
    stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES AMÉLIORATION IA\n');
  console.log(`Total: ${stats.total}\n`);
  console.log('Par thème (top 10):');
  Object.entries(stats.byTheme)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([theme, count]) => {
      console.log(`  - ${theme}: ${count}`);
    });
  console.log('\nPar difficulté:');
  Object.entries(stats.byDifficulty).forEach(([diff, count]) => {
    console.log(`  - ${diff}: ${count}`);
  });

  // Sauvegarder
  const output = {
    questions: final,
    metadata: {
      improvedAt: new Date().toISOString(),
      model: 'gpt-4o',
      totalImproved: final.length,
      source: 'ALL-RAW-CONSOLIDATED.json',
      stats
    }
  };

  const outputPath = path.join(process.cwd(), 'src/data/concours/AI-IMPROVED-QUESTIONS.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n💾 Sauvegardé: ${outputPath}`);
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`\n🏆 PHASE 3 TERMINÉE: ${final.length} questions brillantes générées !\n`);
}

main().catch(console.error);

