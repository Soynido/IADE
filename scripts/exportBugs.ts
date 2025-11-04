/**
 * Script d'export des rapports de bugs depuis Upstash Redis
 * 
 * Utilisation:
 *   npx tsx scripts/exportBugs.ts
 * 
 * Sortie: data/bugs_dump.json
 */

import { Redis } from "@upstash/redis";
import fs from "fs";
import path from "path";

// Initialiser connexion Upstash Redis depuis .env
const redis = Redis.fromEnv();

const OUTPUT_DIR = path.resolve("data");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "bugs_dump.json");

interface BugReport {
  id: string;
  message: string;
  userAgent: string;
  url: string;
  timestamp: number;
  receivedAt: string;
  screenResolution?: string;
}

async function exportBugs() {
  console.log("🪲 Export des rapports de bugs depuis Upstash Redis...\n");

  try {
    // Récupérer tous les bugs de la liste Redis
    const bugs = await redis.lrange("bugs:all", 0, -1);
    
    console.log(`📊 ${bugs.length} rapports de bugs trouvés\n`);

    if (bugs.length === 0) {
      console.log("ℹ️  Aucun bug rapporté (tant mieux !)");
      return;
    }

    // Parser les bugs JSON
    const parsed: BugReport[] = bugs.map((b: any) => {
      try {
        return typeof b === 'string' ? JSON.parse(b) : b;
      } catch (e) {
        console.warn("⚠️  Bug invalide ignoré:", b);
        return null;
      }
    }).filter(Boolean);

    console.log(`✅ ${parsed.length} bugs valides parsés\n`);

    // Créer le dossier de sortie si nécessaire
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Sauvegarder dans un fichier local
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(parsed, null, 2), "utf-8");

    console.log(`💾 Bugs exportés vers: ${OUTPUT_FILE}\n`);

    // Statistiques rapides
    analyzeQuickStats(parsed);

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

function analyzeQuickStats(bugs: BugReport[]) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STATISTIQUES RAPIDES");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const total = bugs.length;
  console.log(`Total bugs rapportés: ${total}\n`);

  // Bugs par URL (page la plus problématique)
  const byUrl: Record<string, number> = {};
  bugs.forEach(b => {
    const url = new URL(b.url).pathname;
    byUrl[url] = (byUrl[url] || 0) + 1;
  });

  const sortedUrls = Object.entries(byUrl)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sortedUrls.length > 0) {
    console.log("📍 Top 5 pages avec bugs:");
    sortedUrls.forEach(([url, count]) => {
      console.log(`   ${url}: ${count} bug${count > 1 ? 's' : ''}`);
    });
    console.log();
  }

  // Bugs par navigateur
  const browsers: Record<string, number> = {};
  bugs.forEach(b => {
    let browser = "Autre";
    if (b.userAgent.includes("Chrome")) browser = "Chrome";
    else if (b.userAgent.includes("Firefox")) browser = "Firefox";
    else if (b.userAgent.includes("Safari") && !b.userAgent.includes("Chrome")) browser = "Safari";
    else if (b.userAgent.includes("Edge")) browser = "Edge";
    
    browsers[browser] = (browsers[browser] || 0) + 1;
  });

  console.log("🌐 Bugs par navigateur:");
  Object.entries(browsers)
    .sort((a, b) => b[1] - a[1])
    .forEach(([browser, count]) => {
      console.log(`   ${browser}: ${count}`);
    });
  console.log();

  // Bugs récents (dernières 24h)
  const now = Date.now();
  const recent = bugs.filter(b => (now - b.timestamp) < 24 * 60 * 60 * 1000);
  console.log(`⏰ Bugs des dernières 24h: ${recent.length}\n`);

  // Exemples de messages
  console.log("📝 Exemples de messages:");
  bugs.slice(0, 3).forEach((b, i) => {
    console.log(`   ${i + 1}. "${b.message.substring(0, 60)}${b.message.length > 60 ? '...' : ''}"`);
  });
  console.log();

  console.log("✅ Export terminé !");
}

// Exécution
if (import.meta.url.includes("exportBugs.ts")) {
  exportBugs().catch(error => {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  });
}

export { exportBugs };

