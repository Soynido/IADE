/**
 * Export des feedbacks au format CSV pour Excel/Pandas
 * 
 * Utilisation:
 *   npx tsx scripts/exportFeedbacksCSV.ts
 * 
 * Sortie: data/feedbacks.csv
 */

import fs from 'fs';
import path from 'path';

const FEEDBACKS_FILE = path.resolve("data/feedbacks_dump.json");
const OUTPUT_FILE = path.resolve("data/feedbacks.csv");

interface Feedback {
  questionId: string;
  rating: 1 | 2 | 3;
  timestamp: number;
  userId: string;
  sessionId: string;
  wasCorrect: boolean;
  responseTime?: number;
}

async function exportCSV() {
  console.log("📊 Export CSV des feedbacks\n");

  // Charger feedbacks
  if (!fs.existsSync(FEEDBACKS_FILE)) {
    console.error("❌ Fichier feedbacks_dump.json introuvable");
    console.log("   Exécuter d'abord: npx tsx scripts/kv_dump_feedbacks.ts");
    process.exit(1);
  }

  const feedbacks: Feedback[] = JSON.parse(fs.readFileSync(FEEDBACKS_FILE, 'utf-8'));
  console.log(`✅ ${feedbacks.length} feedbacks chargés\n`);

  // Créer CSV
  const headers = [
    'questionId',
    'rating',
    'wasCorrect',
    'timestamp',
    'date',
    'userId',
    'sessionId',
    'responseTime'
  ];

  const rows = feedbacks.map(f => {
    const date = new Date(f.timestamp).toISOString();
    return [
      f.questionId,
      f.rating,
      f.wasCorrect ? 'true' : 'false',
      f.timestamp,
      date,
      f.userId,
      f.sessionId,
      f.responseTime || ''
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  // Sauvegarder
  fs.writeFileSync(OUTPUT_FILE, csv, 'utf-8');

  console.log(`💾 CSV exporté: ${OUTPUT_FILE}`);
  console.log(`📊 ${feedbacks.length} lignes + 1 ligne d'en-tête`);
  console.log("\n✅ Export terminé !");
  console.log("\nOuvrir avec:");
  console.log("  - Excel: open data/feedbacks.csv");
  console.log("  - Python: pandas.read_csv('data/feedbacks.csv')");
}

// Exécution
if (import.meta.url.includes("exportFeedbacksCSV.ts")) {
  exportCSV().catch(error => {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  });
}

export { exportCSV };

