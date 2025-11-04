/**
 * Script d'export des feedbacks depuis Vercel KV vers fichier JSON local
 * 
 * Utilisation:
 *   npx tsx scripts/kv_dump_feedbacks.ts
 * 
 * Sortie: data/feedbacks_dump.json
 */

import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

// Initialiser connexion Upstash Redis depuis .env
const redis = Redis.fromEnv();

const OUTPUT_DIR = path.resolve("data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "feedbacks_dump.json");

async function dumpFeedbacks() {
  console.log("🔄 Export des feedbacks depuis Vercel KV...\n");

  try {
    // Récupérer tous les feedbacks de la liste Redis
    const feedbacks = await redis.lrange("feedbacks:all", 0, -1);
    
    console.log(`📊 ${feedbacks.length} feedbacks trouvés dans KV`);

    if (feedbacks.length === 0) {
      console.log("ℹ️  Aucun feedback dans la base (normal si nouveau déploiement)");
      return;
    }

    // Parser les feedbacks JSON
    const parsed = feedbacks.map((f: any) => {
      try {
        return typeof f === 'string' ? JSON.parse(f) : f;
      } catch (e) {
        console.warn("⚠️  Feedback invalide ignoré:", f);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ ${parsed.length} feedbacks valides parsés`);

    // Créer le dossier de sortie si nécessaire
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Sauvegarder dans un fichier local
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsed, null, 2), "utf-8");

    console.log(`\n💾 Feedbacks exportés vers: ${OUTPUT_FILE}`);

    // Statistiques rapides
    const stats = analyzeQuickStats(parsed);
    console.log("\n📈 STATISTIQUES RAPIDES:");
    console.log(`   Total feedbacks: ${stats.total}`);
    console.log(`   Moyenne rating: ${stats.averageRating.toFixed(2)}/3`);
    console.log(`   Distribution: 👎 ${stats.bad} | 👍 ${stats.good} | 🌟 ${stats.veryGood}`);
    console.log(`   Questions uniques: ${stats.uniqueQuestions}`);
    console.log(`   Utilisateurs uniques: ${stats.uniqueUsers}`);

  } catch (error: any) {
    console.error("❌ Erreur lors de l'export:", error.message);
    
    if (error.message.includes("UPSTASH") || error.message.includes("KV_REST_API")) {
      console.log("\n⚠️  Variables Upstash Redis non configurées.");
      console.log("   Solution:");
      console.log("   1. Vérifier .env.local (UPSTASH_REDIS_REST_URL et TOKEN)");
      console.log("   2. Redémarrer terminal pour recharger .env");
    }
    
    process.exit(1);
  }
}

function analyzeQuickStats(feedbacks: any[]) {
  const stats = {
    total: feedbacks.length,
    bad: feedbacks.filter(f => f.rating === 1).length,
    good: feedbacks.filter(f => f.rating === 2).length,
    veryGood: feedbacks.filter(f => f.rating === 3).length,
    averageRating: 0,
    uniqueQuestions: new Set(feedbacks.map(f => f.questionId)).size,
    uniqueUsers: new Set(feedbacks.map(f => f.userId)).size
  };

  const totalRating = feedbacks.reduce((sum, f) => sum + f.rating, 0);
  stats.averageRating = totalRating / feedbacks.length || 0;

  return stats;
}

// Exécution
if (import.meta.url.includes("kv_dump_feedbacks.ts")) {
  dumpFeedbacks();
}

export { dumpFeedbacks };

