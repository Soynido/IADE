import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_FILE = path.resolve(__dirname, "../BATCH_1_IMPROVED.json");
const MOCK_FILE = path.resolve(__dirname, "../src/data/mock/questions.json");
const MERGED_FILE = path.resolve(__dirname, "../src/data/concours/questions-merged.json");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/questions-unified.json");

interface Question {
  id?: string;
  num?: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  theme: string;
  difficulty: string;
  themes: string[];
  type?: string;
  question?: string;
  answer?: string;
}

function integrateQuestions() {
  console.log("🚀 Intégration des questions BATCH_1...\n");
  
  // 1. Charger les nouvelles questions
  const batchQuestions: Question[] = JSON.parse(fs.readFileSync(BATCH_FILE, "utf-8"));
  console.log(`📄 Questions BATCH_1 : ${batchQuestions.length}`);
  
  // 2. Charger les questions mock existantes
  const mockData = JSON.parse(fs.readFileSync(MOCK_FILE, "utf-8"));
  const mockQuestions: Question[] = mockData.questions;
  console.log(`📄 Questions mock : ${mockQuestions.length}`);
  
  // 3. Charger les questions OCR
  let ocrQuestions: Question[] = [];
  if (fs.existsSync(MERGED_FILE)) {
    const ocrData = JSON.parse(fs.readFileSync(MERGED_FILE, "utf-8"));
    ocrQuestions = ocrData.map((q: any, index: number) => ({
      id: `ocr_${index + 1}`,
      text: q.question || "",
      options: [], // Questions OCR n'ont pas d'options
      correctAnswer: -1,
      explanation: q.answer || "",
      theme: "Extrait OCR",
      difficulty: "base",
      themes: ["Extrait OCR"],
      type: "QROC"
    }));
    console.log(`📄 Questions OCR : ${ocrQuestions.length}`);
  }
  
  // 4. Normaliser les questions BATCH_1
  const normalizedBatch = batchQuestions.map((q, index) => ({
    id: `batch_${q.num || index + 1}`,
    text: q.text,
    options: q.options,
    correctAnswer: q.correctAnswer,
    explanation: q.explanation,
    theme: q.theme,
    difficulty: q.difficulty,
    themes: q.themes,
    type: "QCM"
  }));
  
  // 5. Fusionner toutes les questions
  const allQuestions = [
    ...normalizedBatch,
    ...mockQuestions,
    ...ocrQuestions
  ];
  
  console.log(`\n📊 Total fusionné : ${allQuestions.length} questions`);
  
  // 6. Déduplication basée sur le texte
  const seen = new Set<string>();
  const uniqueQuestions = allQuestions.filter(q => {
    const key = q.text.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  console.log(`🧹 Après déduplication : ${uniqueQuestions.length} questions uniques`);
  
  // 7. Sauvegarder
  const output = {
    questions: uniqueQuestions,
    metadata: {
      source: "BATCH_1 + Mock + OCR",
      totalQuestions: uniqueQuestions.length,
      batchQuestions: normalizedBatch.length,
      mockQuestions: mockQuestions.length,
      ocrQuestions: ocrQuestions.length,
      createdAt: new Date().toISOString()
    }
  };
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");
  
  console.log(`\n✅ Intégration terminée !`);
  console.log(`📁 Fichier : ${path.relative(process.cwd(), OUTPUT_FILE)}`);
  console.log(`📊 ${uniqueQuestions.length} questions unifiées`);
  
  // 8. Statistiques par thème
  const themeStats = uniqueQuestions.reduce((acc, q) => {
    acc[q.theme] = (acc[q.theme] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`\n📈 Répartition par thème :`);
  Object.entries(themeStats)
    .sort(([,a], [,b]) => b - a)
    .forEach(([theme, count]) => {
      console.log(`  • ${theme}: ${count} questions`);
    });
}

integrateQuestions();
