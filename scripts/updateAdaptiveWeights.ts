/**
 * Script de mise à jour des poids adaptatifs basés sur les feedbacks
 * 
 * Utilisation:
 *   npx tsx scripts/updateAdaptiveWeights.ts
 * 
 * Fonctionnalités:
 * - Recalcule les difficultés dynamiques
 * - Ajuste les poids de sélection
 * - Met à jour le dataset de questions
 */

import fs from "fs";
import path from "path";
import type { Question } from "../src/types/pathology";
import type { FeedbackStats } from "../src/types/feedback";

const FEEDBACKS_FILE = path.resolve("data/feedbacks_dump.json");
const QUESTIONS_FILE = path.resolve("src/data/questions-unified.json");
const OUTPUT_FILE = path.resolve("src/data/questions-weighted.json");

interface Feedback {
  questionId: string;
  rating: 1 | 2 | 3;
  timestamp: number;
  wasCorrect: boolean;
}

async function updateAdaptiveWeights() {
  console.log("⚙️  Mise à jour des poids adaptatifs\n");

  // 1. Charger les feedbacks
  if (!fs.existsSync(FEEDBACKS_FILE)) {
    console.error("❌ Fichier feedbacks_dump.json introuvable");
    console.log("   Exécuter d'abord: npx tsx scripts/kv_dump_feedbacks.ts");
    process.exit(1);
  }

  const feedbacks: Feedback[] = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"));
  console.log(`✅ ${feedbacks.length} feedbacks chargés`);

  // 2. Calculer les stats par question
  const feedbackStats = calculateFeedbackStats(feedbacks);
  console.log(`📊 ${feedbackStats.size} questions avec feedbacks`);

  // 3. Charger les questions
  if (!fs.existsSync(QUESTIONS_FILE)) {
    console.error("❌ Fichier questions-unified.json introuvable");
    process.exit(1);
  }

  const questionsData = JSON.parse(fs.readFileSync(QUESTIONS_FILE, "utf-8"));
  let questions: Question[] = questionsData.questions || questionsData;
  console.log(`✅ ${questions.length} questions chargées\n`);

  // 4. Enrichir avec feedbackStats et difficulté dynamique
  let enriched = 0;
  questions = questions.map(q => {
    const stats = feedbackStats.get(q.id);
    
    if (stats) {
      enriched++;
      
      // Calculer difficulté dynamique
      const dynamicDifficulty = calculateDynamicDifficulty(q.difficulty, stats);
      
      return {
        ...q,
        feedbackStats: {
          averageRating: stats.averageRating,
          totalFeedbacks: stats.totalFeedbacks,
          lastUpdated: new Date().toISOString()
        },
        userRating: undefined, // Local, pas dans le dataset global
        dynamicDifficulty: dynamicDifficulty,
        selectionWeight: calculateSelectionWeight(stats)
      };
    }
    
    return q;
  });

  console.log(`✅ ${enriched} questions enrichies avec feedbacks\n`);

  // 5. Sauvegarder le dataset enrichi
  const enrichedData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: questions.length,
      questionsWithFeedback: enriched,
      version: "1.1.0-weighted"
    },
    questions: questions
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(enrichedData, null, 2), "utf-8");

  console.log(`💾 Dataset enrichi sauvegardé: ${OUTPUT_FILE}`);
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STATISTIQUES DES AJUSTEMENTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const adjusted = questions.filter(q => q.dynamicDifficulty && q.difficulty !== q.dynamicDifficulty);
  console.log(`Questions ajustées:  ${adjusted.length}`);
  console.log(`Questions inchangées: ${enriched - adjusted.length}\n`);

  if (adjusted.length > 0) {
    console.log("Exemples d'ajustements:");
    adjusted.slice(0, 5).forEach(q => {
      console.log(`   ${q.id}:`);
      console.log(`      Base: ${q.difficulty} → Dynamique: ${q.dynamicDifficulty}`);
      console.log(`      Rating: ${q.feedbackStats?.averageRating.toFixed(2)}/3\n`);
    });
  }

  console.log("✅ Poids adaptatifs mis à jour !");
}

function calculateFeedbackStats(feedbacks: Feedback[]): Map<string, FeedbackStats> {
  const statsMap = new Map<string, FeedbackStats>();
  const grouped: Record<string, Feedback[]> = {};

  feedbacks.forEach(f => {
    if (!grouped[f.questionId]) {
      grouped[f.questionId] = [];
    }
    grouped[f.questionId].push(f);
  });

  Object.entries(grouped).forEach(([questionId, items]) => {
    const totalRating = items.reduce((sum, f) => sum + f.rating, 0);
    statsMap.set(questionId, {
      questionId,
      averageRating: totalRating / items.length,
      totalFeedbacks: items.length,
      lastUpdated: new Date().toISOString()
    });
  });

  return statsMap;
}

function calculateDynamicDifficulty(baseDifficulty: string, stats: FeedbackStats): string {
  const diffMap = { easy: 1, intermediate: 2, hard: 3 };
  const base = diffMap[baseDifficulty.toLowerCase() as keyof typeof diffMap] || 2;

  if (stats.totalFeedbacks < 3) return baseDifficulty;

  // Ajuster selon rating: bad (1) augmente difficulté, very good (3) diminue
  const adjustment = (2 - stats.averageRating) * 0.25;
  const dynamicValue = Math.max(1, Math.min(3, base * (1 + adjustment)));

  const dynamicDiff = dynamicValue < 1.5 ? 'easy' : dynamicValue > 2.5 ? 'hard' : 'intermediate';
  
  return dynamicDiff;
}

function calculateSelectionWeight(stats: FeedbackStats): number {
  // Poids de base 1.0
  let weight = 1.0;

  // Bonus si bien noté
  if (stats.averageRating > 2) {
    weight *= 1.5;
  }
  // Malus si mal noté
  if (stats.averageRating < 1.5) {
    weight *= 0.5;
  }

  return weight;
}

// Exécution
if (import.meta.url.includes("updateAdaptiveWeights.ts")) {
  updateAdaptiveWeights().catch(error => {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  });
}

export { updateAdaptiveWeights };

