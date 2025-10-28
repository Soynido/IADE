import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIR = path.resolve(__dirname, "../../src/data/concours");
const outputFile = path.resolve(__dirname, "../../src/data/concours/questions-merged.json");

const inputFiles = [
  "annalescorrigées-Volume-1-raw.json",
  "annalescorrigées-Volume-2-raw.json",
  "Prepaconcoursiade-Complet-raw.json",
];

function cleanQuestion(q: string): string {
  return q
    .replace(/ONCOURSIADE\.COM/gi, "")
    .replace(/PR[ÉE]PACONCOURSIADE\.COM/gi, "")
    .replace(/QUESTIONS DE\s*\d+\s*À\s*\d+/gi, "")
    .replace(/R[ÉE]PONSES DE\s*\d+\s*À\s*\d+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

interface QuestionItem {
  id?: string;
  question?: string;
  answer?: string;
  [key: string]: any;
}

function mergeQuestions() {
  console.log("🚀 Fusion des questions OCR...\n");
  
  let merged: QuestionItem[] = [];

  for (const file of inputFiles) {
    const filePath = path.join(INPUT_DIR, file);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier introuvable: ${file}`);
      continue;
    }

    console.log(`📄 Lecture: ${file}`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    
    if (Array.isArray(data)) {
      merged.push(...data);
      console.log(`   ✅ ${data.length} questions ajoutées`);
    } else {
      console.log(`   ⚠️  Format non-tableau ignoré`);
    }
  }

  console.log(`\n📊 Total brut: ${merged.length} questions`);

  // Nettoyage
  merged = merged
    .filter(q => q?.question && typeof q.question === 'string' && q.question.length > 10)
    .map(q => ({
      ...q,
      question: cleanQuestion(q.question || ""),
      answer: q.answer ? cleanQuestion(q.answer) : "",
    }));

  console.log(`✅ Après nettoyage: ${merged.length} questions`);

  // Déduplication
  const seen = new Set<string>();
  merged = merged.filter(q => {
    const key = q.question.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`🧹 Après déduplication: ${merged.length} questions uniques`);

  // Sauvegarde
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2), "utf-8");

  console.log(`\n✅ Fusion terminée !`);
  console.log(`📁 Fichier: ${path.relative(process.cwd(), outputFile)}`);
  console.log(`📊 ${merged.length} questions unifiées\n`);
}

mergeQuestions();

