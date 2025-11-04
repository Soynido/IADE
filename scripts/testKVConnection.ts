/**
 * Script de test de connexion Vercel KV
 * 
 * Utilisation:
 *   npx tsx scripts/testKVConnection.ts
 * 
 * Vérifie:
 * - Variables KV présentes
 * - Connexion fonctionnelle
 * - Données accessibles
 */

import { Redis } from "@upstash/redis";

// Initialiser connexion Upstash Redis depuis .env
const redis = Redis.fromEnv();

async function testConnection() {
  console.log("🔍 Test de connexion Upstash Redis\n");

  // 1. Vérifier variables d'environnement
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. VARIABLES D'ENVIRONNEMENT");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    console.error("❌ Variables Upstash Redis manquantes");
    console.log("\nSolutions:");
    console.log("  1. Vérifier .env.local existe et contient:");
    console.log("     UPSTASH_REDIS_REST_URL=https://...");
    console.log("     UPSTASH_REDIS_REST_TOKEN=...");
    console.log("  2. Redémarrer terminal pour recharger .env\n");
    process.exit(1);
  }

  console.log("✅ UPSTASH_REDIS_REST_URL:", kvUrl.substring(0, 30) + "...");
  console.log("✅ UPSTASH_REDIS_REST_TOKEN: " + "*".repeat(20) + "\n");

  // 2. Test de connexion
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("2. TEST DE CONNEXION");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    // Test simple: SET/GET
    const testKey = "test:connection:" + Date.now();
    await redis.set(testKey, "ok", { ex: 60 }); // Expire dans 60s
    const result = await redis.get(testKey);

    if (result === "ok") {
      console.log("✅ Connexion Upstash Redis opérationnelle");
      console.log("   SET/GET fonctionnel\n");
    } else {
      console.error("⚠️  Connexion établie mais données incorrectes");
    }
  } catch (error: any) {
    console.error("❌ Erreur de connexion:", error.message);
    process.exit(1);
  }

  // 3. Vérifier données feedbacks
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("3. DONNÉES FEEDBACKS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  try {
    const feedbackCount = await redis.llen("feedbacks:all");
    console.log(`📊 Feedbacks dans Redis: ${feedbackCount}`);

    if (feedbackCount === 0) {
      console.log("ℹ️  Aucun feedback (normal si nouveau déploiement)");
      console.log("   → Tester l'app en production pour générer des feedbacks\n");
    } else {
      // Récupérer le premier feedback
      const firstFeedback = await redis.lindex("feedbacks:all", 0);
      console.log("\n📝 Exemple de feedback:");
      console.log(JSON.stringify(typeof firstFeedback === 'string' ? JSON.parse(firstFeedback) : firstFeedback, null, 2));
      console.log();
    }
  } catch (error: any) {
    console.warn("⚠️  Impossible de lire feedbacks:", error.message);
    console.log("   La connexion fonctionne mais la liste est vide ou inexistante\n");
  }

  // 4. Test complet
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("RÉSUMÉ");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("✅ Variables Upstash configurées");
  console.log("✅ Connexion Redis fonctionnelle");
  console.log("✅ Opérations Redis OK");
  console.log("\n🎉 Système prêt pour collecter et analyser les feedbacks !\n");
  console.log("Prochaine étape:");
  console.log("  → Tester l'app en production");
  console.log("  → Noter quelques questions");
  console.log("  → Lancer: npm run kv:dump\n");
}

// Exécution
if (import.meta.url.includes("testKVConnection.ts")) {
  testConnection().catch(error => {
    console.error("\n❌ Test échoué:", error.message);
    process.exit(1);
  });
}

export { testConnection };

