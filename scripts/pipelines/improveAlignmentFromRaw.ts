/**
 * Script d'amélioration de l'alignement Q/A depuis les fichiers raw.json
 * 
 * Ce script prend les fichiers *-raw.json déjà extraits par extractQuestions.ts
 * et améliore l'alignement en ajoutant les réponses manquantes depuis les fichiers OCR.
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve("src/data/concours");
const OCR_DIR = path.resolve("tmp/ocr-cache");
const OUTPUT_FILE = path.join(DATA_DIR, "annales-aligned.json");

interface RawQA {
  id: string;
  question: string;
  answer: string;
}

interface AlignedQA {
  id: string;
  questionNumber: number;
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low";
  source: string;
  pdfSource?: {
    filename: string;
    page: number;
    section: string;
  };
}

// ============================================================================
// EXTRACTION DES RÉPONSES DEPUIS LES FICHIERS OCR
// ============================================================================

function extractAnswersFromOCR(ocrFile: string, questionIds: string[]): Map<number, string> {
  const answersMap = new Map<number, string>();
  
  if (!fs.existsSync(ocrFile)) {
    console.warn(`  ⚠️  Fichier OCR introuvable : ${path.basename(ocrFile)}`);
    return answersMap;
  }

  const content = fs.readFileSync(ocrFile, "utf8");
  
  // Détecter les blocs RÉPONSES avec regex flexible
  // Note: Le texte OCR utilise souvent "I" (lettre) au lieu de "1" (chiffre) et "2O" au lieu de "20"
  const answerBlockMatches = content.matchAll(/R[ÉE]PONSES?\s+DE\s+[I1]\s+[ÀA]\s+[2][O0]([\s\S]*?)(?=QUESTIONS\s+DE|R[ÉE]PONSES\s+DE\s+[2-9]|$)/gi);
  
  for (const match of answerBlockMatches) {
    const blockContent = match[1];
    const from = 1; // Toujours commencer à 1
    const to = 20;  // Jusqu'à 20 pour le premier bloc
    
    console.log(`    → Bloc RÉPONSES ${from}-${to} trouvé (${blockContent.length} caractères)`);
    
    // Parser les réponses en découpant sur les marqueurs de réponses
    // Les réponses sont souvent toutes sur une seule ligne très longue, séparées par des marqueurs
    // Marqueurs possibles : "I)", "@", "©", "®", "&@", "II)", etc.
    const answerMarkers = /([IVX]+\)|[@©®]|&@|\d{1,2}[.,)\]]|a[IVX]+)/gi;
    
    // Découper le bloc en segments basés sur les marqueurs
    const segments: string[] = [];
    let lastIndex = 0;
    let markerMatch;
    answerMarkers.lastIndex = 0;
    
    while ((markerMatch = answerMarkers.exec(blockContent)) !== null) {
      if (lastIndex > 0) {
        // Sauvegarder le segment précédent
        segments.push(blockContent.slice(lastIndex, markerMatch.index).trim());
      }
      lastIndex = markerMatch.index + markerMatch[0].length;
    }
    // Ajouter le dernier segment
    if (lastIndex < blockContent.length) {
      segments.push(blockContent.slice(lastIndex).trim());
    }
    
    // Nettoyer et assigner les réponses
    segments.forEach((segment, idx) => {
      const cleaned = segment
        .replace(/ANNALES CORRIGÉS[\s\S]*?PREPACONCOURSIADE\.COM/gi, "")
        .replace(/QUESTIONS\s+DE\s+\d+\s+[ÀA]\s+\d+/gi, "")
        .trim();
      
      if (cleaned.length > 30) {  // Réponse significative
        const questionNum = from + idx;
        answersMap.set(questionNum, cleaned);
      }
    });
  }
  
  console.log(`    → ${answersMap.size} réponses extraites`);
  return answersMap;
}

// ============================================================================
// AMÉLIORATION DE L'ALIGNEMENT
// ============================================================================

async function improveAlignment() {
  console.log("🔧 Amélioration de l'alignement Q/A depuis les fichiers raw\n");

  const rawFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith("-raw.json") && f.includes("annales"));

  console.log(`📚 Fichiers raw trouvés : ${rawFiles.length}\n`);

  let allAligned: AlignedQA[] = [];

  for (const file of rawFiles) {
    const filePath = path.join(DATA_DIR, file);
    const sourceName = file.replace("-raw.json", "").replace(/annalescorrigées-/, "");
    const ocrFile = path.join(OCR_DIR, file.replace("-raw.json", ".txt"));
    
    console.log(`📄 Traitement : ${file}`);
    
    // Charger les questions brutes
    const rawData: RawQA[] = JSON.parse(fs.readFileSync(filePath, "utf8"));
    console.log(`  📊 ${rawData.length} questions dans le fichier raw`);
    
    // Extraire les réponses depuis le fichier OCR
    const questionIds = rawData.map(q => q.id);
    const answersMap = extractAnswersFromOCR(ocrFile, questionIds);
    
    // Améliorer l'alignement
    let improved = 0;
    for (const item of rawData) {
      // Extraire le numéro de question depuis l'ID
      const numMatch = item.id.match(/(\d+)-(\d+)$/);
      const questionNum = numMatch ? parseInt(numMatch[2]) : 0;
      
      let answer = item.answer || "";
      let confidence: "high" | "medium" | "low" = "low";
      
      // Si pas de réponse dans raw, essayer de la trouver dans OCR
      if (!answer || answer.length < 10) {
        const ocrAnswer = answersMap.get(questionNum);
        if (ocrAnswer) {
          answer = ocrAnswer;
          improved++;
        }
      }
      
      // Déterminer la confiance
      if (answer.length > 50) {
        confidence = "high";
      } else if (answer.length > 20) {
        confidence = "medium";
      }
      
      allAligned.push({
        id: `${sourceName}-${questionNum}`,
        questionNumber: questionNum,
        question: item.question,
        answer: answer,
        confidence: confidence,
        source: sourceName,
        pdfSource: {
          filename: file,
          page: Math.floor(questionNum / 20) + 1, // Estimation: ~20 questions par page
          section: `Questions ${Math.floor((questionNum - 1) / 20) * 20 + 1}-${Math.floor((questionNum - 1) / 20) * 20 + 20}`
        }
      });
    }
    
    console.log(`  ✅ ${improved} réponses améliorées\n`);
  }

  // Statistiques
  const stats = {
    total: allAligned.length,
    withAnswer: allAligned.filter(q => q.answer.length > 0).length,
    highConfidence: allAligned.filter(q => q.confidence === "high").length,
    mediumConfidence: allAligned.filter(q => q.confidence === "medium").length,
    lowConfidence: allAligned.filter(q => q.confidence === "low").length,
  };

  console.log("📊 STATISTIQUES FINALES");
  console.log(`  Total questions    : ${stats.total}`);
  console.log(`  Avec réponse       : ${stats.withAnswer} (${((stats.withAnswer / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Confiance haute    : ${stats.highConfidence}`);
  console.log(`  Confiance moyenne  : ${stats.mediumConfidence}`);
  console.log(`  Confiance basse    : ${stats.lowConfidence}`);

  // Export
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: stats.total,
      withAnswer: stats.withAnswer,
      coverageRate: ((stats.withAnswer / stats.total) * 100).toFixed(1) + "%",
    },
    questions: allAligned.filter(q => q.answer.length > 0),
    questionsWithoutAnswers: allAligned.filter(q => q.answer.length === 0),
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2), "utf8");
  
  console.log(`\n💾 Export réussi → ${path.basename(OUTPUT_FILE)}`);
  console.log(`\n✅ Amélioration terminée !`);
  console.log(`\n📁 Fichier disponible : ${OUTPUT_FILE}`);
}

// Exécution
if (import.meta.url.includes("improveAlignmentFromRaw.ts")) {
  improveAlignment().catch(console.error);
}

export { improveAlignment, extractAnswersFromOCR };

