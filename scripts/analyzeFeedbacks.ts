/**
 * Script d'analyse approfondie des feedbacks
 * 
 * Utilisation:
 *   npx tsx scripts/analyzeFeedbacks.ts
 * 
 * Analyse:
 * - Distribution par rating
 * - Moyenne par domaine
 * - Top questions bien/mal notées
 * - Évolution temporelle
 */

import fs from "fs";
import path from "path";

const FEEDBACKS_FILE = path.resolve("data/feedbacks_dump.json");

interface Feedback {
  questionId: string;
  rating: 1 | 2 | 3;
  timestamp: number;
  userId: string;
  sessionId: string;
  wasCorrect: boolean;
  responseTime?: number;
}

interface QuestionStats {
  questionId: string;
  totalFeedbacks: number;
  averageRating: number;
  distribution: { bad: number; good: number; veryGood: number };
  correctRate: number;
}

async function analyzeFeedbacks() {
  console.log("📊 Analyse des feedbacks IADE\n");

  // Charger les feedbacks
  if (!fs.existsSync(FEEDBACKS_FILE)) {
    console.error("❌ Fichier feedbacks_dump.json introuvable");
    console.log("   Exécuter d'abord: npx tsx scripts/kv_dump_feedbacks.ts");
    process.exit(1);
  }

  const feedbacks: Feedback[] = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, "utf-8"));

  console.log(`✅ ${feedbacks.length} feedbacks chargés\n`);

  if (feedbacks.length === 0) {
    console.log("ℹ️  Aucun feedback à analyser");
    return;
  }

  // ============================================================================
  // 1. DISTRIBUTION GLOBALE
  // ============================================================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. DISTRIBUTION GLOBALE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const distribution = {
    bad: feedbacks.filter(f => f.rating === 1).length,
    good: feedbacks.filter(f => f.rating === 2).length,
    veryGood: feedbacks.filter(f => f.rating === 3).length
  };

  const total = feedbacks.length;
  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / total;

  console.log(`Total feedbacks:     ${total}`);
  console.log(`Moyenne rating:      ${averageRating.toFixed(2)}/3\n`);
  console.log(`👎 Peu utile (1):    ${distribution.bad} (${(distribution.bad / total * 100).toFixed(1)}%)`);
  console.log(`👍 Utile (2):        ${distribution.good} (${(distribution.good / total * 100).toFixed(1)}%)`);
  console.log(`🌟 Excellente (3):   ${distribution.veryGood} (${(distribution.veryGood / total * 100).toFixed(1)}%)\n`);

  // ============================================================================
  // 2. TOP QUESTIONS PAR RATING
  // ============================================================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2. TOP QUESTIONS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Grouper par question
  const questionStats = groupByQuestion(feedbacks);
  
  // Trier par rating
  const sortedByRating = questionStats.sort((a, b) => b.averageRating - a.averageRating);

  console.log("🌟 TOP 5 MEILLEURES QUESTIONS:");
  sortedByRating.slice(0, 5).forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.questionId}`);
    console.log(`      Rating: ${q.averageRating.toFixed(2)}/3 (${q.totalFeedbacks} feedbacks)`);
    console.log(`      Taux réussite: ${(q.correctRate * 100).toFixed(0)}%\n`);
  });

  console.log("👎 TOP 5 QUESTIONS À AMÉLIORER:");
  sortedByRating.slice(-5).reverse().forEach((q, i) => {
    console.log(`   ${i + 1}. ${q.questionId}`);
    console.log(`      Rating: ${q.averageRating.toFixed(2)}/3 (${q.totalFeedbacks} feedbacks)`);
    console.log(`      Taux réussite: ${(q.correctRate * 100).toFixed(0)}%\n`);
  });

  // ============================================================================
  // 3. ÉVOLUTION TEMPORELLE
  // ============================================================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3. ÉVOLUTION TEMPORELLE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const byDay = groupByDay(feedbacks);
  
  console.log("Feedbacks par jour (7 derniers):");
  byDay.slice(-7).forEach(day => {
    console.log(`   ${day.date}: ${day.count} feedbacks (avg: ${day.averageRating.toFixed(2)})`);
  });
  console.log();

  // ============================================================================
  // 4. UTILISATEURS ACTIFS
  // ============================================================================

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("4. UTILISATEURS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const uniqueUsers = new Set(feedbacks.map(f => f.userId)).size;
  const uniqueSessions = new Set(feedbacks.map(f => f.sessionId)).size;

  console.log(`Utilisateurs uniques: ${uniqueUsers}`);
  console.log(`Sessions uniques:     ${uniqueSessions}`);
  console.log(`Feedbacks/user:       ${(total / uniqueUsers).toFixed(1)}\n`);

  // ============================================================================
  // 5. EXPORT POUR ANALYSE AVANCÉE
  // ============================================================================

  const analysisReport = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalFeedbacks: total,
      analysisVersion: "1.0.0"
    },
    globalStats: {
      averageRating,
      distribution,
      uniqueUsers,
      uniqueSessions
    },
    topQuestions: sortedByRating.slice(0, 10),
    worstQuestions: sortedByRating.slice(-10).reverse(),
    evolutionByDay: byDay
  };

  const reportFile = path.join(OUTPUT_DIR, "feedbacks_analysis.json");
  fs.writeFileSync(reportFile, JSON.stringify(analysisReport, null, 2), "utf-8");

  console.log(`📊 Rapport d'analyse sauvegardé: ${reportFile}\n`);
  console.log("✅ Analyse terminée !");
}

function groupByQuestion(feedbacks: Feedback[]): QuestionStats[] {
  const grouped: Record<string, Feedback[]> = {};
  
  feedbacks.forEach(f => {
    if (!grouped[f.questionId]) {
      grouped[f.questionId] = [];
    }
    grouped[f.questionId].push(f);
  });

  return Object.entries(grouped).map(([questionId, items]) => {
    const totalRating = items.reduce((sum, f) => sum + f.rating, 0);
    const correctCount = items.filter(f => f.wasCorrect).length;
    
    return {
      questionId,
      totalFeedbacks: items.length,
      averageRating: totalRating / items.length,
      distribution: {
        bad: items.filter(f => f.rating === 1).length,
        good: items.filter(f => f.rating === 2).length,
        veryGood: items.filter(f => f.rating === 3).length
      },
      correctRate: correctCount / items.length
    };
  });
}

function groupByDay(feedbacks: Feedback[]) {
  const byDay: Record<string, Feedback[]> = {};
  
  feedbacks.forEach(f => {
    const date = new Date(f.timestamp).toISOString().split('T')[0];
    if (!byDay[date]) {
      byDay[date] = [];
    }
    byDay[date].push(f);
  });

  return Object.entries(byDay)
    .map(([date, items]) => ({
      date,
      count: items.length,
      averageRating: items.reduce((sum, f) => sum + f.rating, 0) / items.length
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const OUTPUT_DIR = path.resolve("data");

// Exécution
if (import.meta.url.includes("analyzeFeedbacks.ts")) {
  analyzeFeedbacks().catch(error => {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  });
}

export { analyzeFeedbacks };

