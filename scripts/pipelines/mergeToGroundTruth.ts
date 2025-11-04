/**
 * Script de fusion des paires Q/A alignées dans groundTruth.json
 * 
 * Ce script enrichit le fichier groundTruth.json avec les paires Q/A extraites
 * des annales pour créer un dataset hybride contenant à la fois :
 * - Les concepts théoriques (existants)
 * - Les paires Q/A réelles issues des annales (nouvelles)
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("src/data");
const GROUND_TRUTH_FILE = path.join(DATA_DIR, "groundTruth.json");
const ALIGNED_QA_FILE = path.join(DATA_DIR, "concours/annales-aligned.json");
const OUTPUT_FILE = path.join(DATA_DIR, "groundTruth.json");
const BACKUP_FILE = path.join(DATA_DIR, "groundTruth.backup.json");

interface Concept {
  id: string;
  concept: string;
  domain: string;
  subcategory: string;
  keywords: string[];
  context: string;
  cours_refs: string[];
  annales_refs: string[];
  difficulty_hint: string;
  // Nouveaux champs pour Q/A
  qa_pairs?: QAPair[];
}

interface QAPair {
  questionNumber: number;
  question: string;
  answer: string;
  confidence: string;
  source: string;
}

interface AlignedQA {
  id: string;
  questionNumber: number;
  question: string;
  answer: string;
  confidence: string;
  source: string;
}

interface AlignedData {
  metadata: {
    generatedAt: string;
    totalQuestions: number;
    withAnswer: number;
    coverageRate: string;
  };
  questions: AlignedQA[];
  questionsWithoutAnswers: AlignedQA[];
}

// ============================================================================
// FUSION INTELLIGENTE
// ============================================================================

function mergeQAToGroundTruth() {
  console.log("🔀 Fusion des paires Q/A dans groundTruth.json\n");

  // Charger le fichier groundTruth existant
  if (!fs.existsSync(GROUND_TRUTH_FILE)) {
    console.error(`❌ Fichier groundTruth.json introuvable : ${GROUND_TRUTH_FILE}`);
    process.exit(1);
  }

  const groundTruth: Concept[] = JSON.parse(fs.readFileSync(GROUND_TRUTH_FILE, "utf8"));
  console.log(`📊 ${groundTruth.length} concepts chargés depuis groundTruth.json`);

  // Créer une sauvegarde
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(groundTruth, null, 2), "utf8");
  console.log(`💾 Sauvegarde créée : ${path.basename(BACKUP_FILE)}`);

  // Charger les paires Q/A alignées
  if (!fs.existsSync(ALIGNED_QA_FILE)) {
    console.warn(`⚠️  Fichier annales-aligned.json introuvable : ${ALIGNED_QA_FILE}`);
    console.warn(`⚠️  Aucune fusion effectuée`);
    return;
  }

  const alignedData: AlignedData = JSON.parse(fs.readFileSync(ALIGNED_QA_FILE, "utf8"));
  const allQAPairs = [...alignedData.questions, ...alignedData.questionsWithoutAnswers];
  console.log(`📊 ${allQAPairs.length} paires Q/A chargées depuis annales-aligned.json`);
  console.log(`  → ${alignedData.questions.length} avec réponse`);
  console.log(`  → ${alignedData.questionsWithoutAnswers.length} sans réponse\n`);

  // Créer un mapping intelligent Q/A → Concepts
  // Stratégie : utiliser les mots-clés et le contexte pour associer les Q/A aux concepts
  let conceptsEnriched = 0;
  let newConceptsCreated = 0;

  for (const qa of allQAPairs) {
    // Rechercher un concept correspondant basé sur les mots-clés
    const matchingConcept = findMatchingConcept(groundTruth, qa);

    if (matchingConcept) {
      // Enrichir le concept existant
      if (!matchingConcept.qa_pairs) {
        matchingConcept.qa_pairs = [];
      }
      matchingConcept.qa_pairs.push({
        questionNumber: qa.questionNumber,
        question: qa.question,
        answer: qa.answer,
        confidence: qa.confidence,
        source: qa.source,
      });
      matchingConcept.annales_refs.push(qa.source);
      conceptsEnriched++;
    } else {
      // Créer un nouveau concept basé sur la Q/A
      const newConcept = createConceptFromQA(qa, groundTruth.length + newConceptsCreated + 1);
      groundTruth.push(newConcept);
      newConceptsCreated++;
    }
  }

  // Dédupliquer les annales_refs
  groundTruth.forEach(c => {
    c.annales_refs = [...new Set(c.annales_refs)];
  });

  // Sauvegarder le nouveau groundTruth
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(groundTruth, null, 2), "utf8");

  console.log("📊 RÉSULTATS DE LA FUSION");
  console.log(`  Concepts enrichis      : ${conceptsEnriched}`);
  console.log(`  Nouveaux concepts créés: ${newConceptsCreated}`);
  console.log(`  Total concepts         : ${groundTruth.length}`);
  console.log(`\n💾 Fichier mis à jour : ${path.basename(OUTPUT_FILE)}`);
  console.log(`✅ Fusion terminée !`);
}

// ============================================================================
// MATCHING INTELLIGENT Q/A → CONCEPT
// ============================================================================

function findMatchingConcept(concepts: Concept[], qa: AlignedQA): Concept | null {
  const qaText = (qa.question + " " + qa.answer).toLowerCase();

  // Stratégie 1 : Recherche par mots-clés (score > 60%)
  for (const concept of concepts) {
    const matchingKeywords = concept.keywords.filter(kw => 
      qaText.includes(kw.toLowerCase())
    );
    const matchScore = matchingKeywords.length / concept.keywords.length;
    
    if (matchScore >= 0.6) {
      return concept;
    }
  }

  // Stratégie 2 : Recherche par similarité de contexte (basique)
  for (const concept of concepts) {
    const contextWords = concept.context.toLowerCase().split(/\s+/);
    const commonWords = contextWords.filter(word => 
      word.length > 4 && qaText.includes(word)
    );
    
    if (commonWords.length >= 3) {
      return concept;
    }
  }

  return null;
}

// ============================================================================
// CRÉATION DE CONCEPT DEPUIS Q/A
// ============================================================================

function createConceptFromQA(qa: AlignedQA, nextId: number): Concept {
  // Extraire des mots-clés basiques de la question
  const keywords = extractKeywords(qa.question + " " + qa.answer);
  
  // Déterminer le domaine et la sous-catégorie (heuristique simple)
  const { domain, subcategory } = inferDomainAndSubcategory(qa.question, qa.answer);

  return {
    id: `annales-${nextId}`,
    concept: qa.question.slice(0, 50) + (qa.question.length > 50 ? "..." : ""),
    domain: domain,
    subcategory: subcategory,
    keywords: keywords,
    context: qa.answer || qa.question,
    cours_refs: [],
    annales_refs: [qa.source],
    difficulty_hint: qa.confidence === "high" ? "intermediate" : "easy",
    qa_pairs: [{
      questionNumber: qa.questionNumber,
      question: qa.question,
      answer: qa.answer,
      confidence: qa.confidence,
      source: qa.source,
    }],
  };
}

function extractKeywords(text: string): string[] {
  // Simple extraction : mots de plus de 5 caractères, fréquents
  const words = text.toLowerCase()
    .replace(/[^a-zàâäéèêëïîôöùûüÿç\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 5);
  
  const freq = new Map<string, number>();
  words.forEach(w => freq.set(w, (freq.get(w) || 0) + 1));
  
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

function inferDomainAndSubcategory(question: string, answer: string): { domain: string; subcategory: string } {
  const text = (question + " " + answer).toLowerCase();
  
  // Heuristique simple basée sur des mots-clés
  const domainMapping = [
    { keywords: ["morphine", "analgésie", "naloxone", "opiacé"], domain: "Pharmacologie", subcategory: "Analgésiques" },
    { keywords: ["glasgow", "conscience", "coma", "traumatisme"], domain: "Réanimation", subcategory: "Scores" },
    { keywords: ["rein", "créatinine", "dfg", "diurèse"], domain: "Physiologie", subcategory: "Néphrologie" },
    { keywords: ["transfusion", "sang", "groupe", "rai"], domain: "Transfusion", subcategory: "Immunohématologie" },
    { keywords: ["ventilation", "respiration", "volume"], domain: "Physiologie", subcategory: "Respiratoire" },
  ];

  for (const mapping of domainMapping) {
    const matchCount = mapping.keywords.filter(kw => text.includes(kw)).length;
    if (matchCount >= 1) {
      return { domain: mapping.domain, subcategory: mapping.subcategory };
    }
  }

  return { domain: "Médecine générale", subcategory: "Connaissances générales" };
}

// ============================================================================
// MAIN
// ============================================================================

if (import.meta.url.includes("mergeToGroundTruth.ts")) {
  mergeQAToGroundTruth();
}

export { mergeQAToGroundTruth, findMatchingConcept, createConceptFromQA };

