/**
 * Script d'alignement intelligent Questions ↔ Réponses
 * 
 * Ce script analyse les PDFs extraits pour créer des paires Q/A complètes et alignées.
 * Il améliore l'extraction brute en associant intelligemment chaque question à sa réponse.
 * 
 * Fonctionnalités :
 * - Détection robuste des blocs "QUESTIONS DE..." et "RÉPONSES DE..."
 * - Alignement intelligent par numéro de question
 * - Nettoyage et normalisation OCR
 * - Validation de la cohérence des paires Q/A
 * - Export vers annales-aligned.json
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";

const OCR_DIR = path.resolve("tmp/ocr-cache");
const OUT_DIR = path.resolve("src/data/concours");
const OUTPUT_FILE = path.join(OUT_DIR, "annales-aligned.json");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// ============================================================================
// NORMALISATION OCR AVANCÉE
// ============================================================================

function normalizeOcrText(text: string): string {
  return text
    .replace(/QUESTIONSDE/gi, "QUESTIONS DE")
    .replace(/R[ÉE]PONSESDE/gi, "RÉPONSES DE")
    .replace(/\r/g, "\n")
    .replace(/'/g, "'")
    .replace(/[°º]/g, "o")
    .replace(/\bO\b/g, "0")
    .replace(/\bI\b/g, "1")
    .replace(/\bl\b/g, "1")
    .replace(/(\d)[Oo]/g, "$10") // 2O -> 20
    .replace(/([a-zéèêëàâîïôöùûüç])1([a-z])/gi, "$1l$2")
    .replace(/([a-z])0([a-z])/gi, "$1o$2")
    .replace(/ph\s*\?/gi, "pH ?")
    .replace(/é1ement/gi, "élément")
    .replace(/I2O\s?g/gi, "120 g")
    .replace(/2O(\b|[^0-9])/g, "20$1")
    .replace(/1O(\b|[^0-9])/g, "10$1")
    .replace(/QUESTIONS\s*DE\s*I\s*À\s*2O/gi, "QUESTIONS DE 1 À 20")
    .replace(/QUESTIONS\s*DE\s*2I\s*À\s*4O/gi, "QUESTIONS DE 21 À 40")
    .replace(/QUESTIONS\s*DE\s*4I\s*À\s*6O/gi, "QUESTIONS DE 41 À 60")
    .replace(/[•·●■▪]/g, "-")
    .replace(/-\s*\n\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function stripGlobalNoise(t: string): string {
  return t
    .replace(/ANNALES?\s+CORRIG[ÉE]S.*?(?=\bQ)/gi, "")
    .replace(/ONCOURSIADE\.COM/gi, "")
    .replace(/PR[ÉE]PACONCOURSIADE\.COM/gi, "")
    .replace(/\bPAGE\s+\d+/gi, "")
    .replace(/\d+\s*\/\s*\d+/g, "")
    .trim();
}

function cleanOne(s: string): string {
  return s
    .replace(/^\d{1,3}\s*[.)-]\s+/, "")
    .replace(/QUESTIONS?\s+DE\s+\d+\s+À\s+\d+/gi, "")
    .replace(/R[ÉE]PONSES?\s+DE\s+\d+\s+À\s+\d+/gi, "")
    .replace(/PR[ÉE]PACONCOURSIADE\.COM|ONCOURSIADE\.COM/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([?.:;!])/g, "$1")
    .trim();
}

// ============================================================================
// DÉTECTION DES BLOCS Q/A
// ============================================================================

const QUESTION_BLOCK_RE = /Q[uO0]ESTI[O0]NS?\s+D[éeE3]\s+(\d+)\s+[àA]\s+(\d+)/gi;
const ANSWER_BLOCK_RE = /R[éeE3]P[O0]NSES?\s+D[éeE3]\s+(\d+)\s+[àA]\s+(\d+)/gi;

interface Block {
  type: "questions" | "answers";
  rangeStart: number;
  rangeEnd: number;
  startIdx: number;
  endIdx: number;
  content: string;
}

function detectBlocks(text: string): { questions: Block[]; answers: Block[] } {
  const questions: Block[] = [];
  const answers: Block[] = [];

  // Détection des blocs QUESTIONS
  let match;
  QUESTION_BLOCK_RE.lastIndex = 0;
  while ((match = QUESTION_BLOCK_RE.exec(text)) !== null) {
    const from = parseInt(match[1]);
    const to = parseInt(match[2]);
    const start = match.index;
    
    // Trouver la fin du bloc (prochain bloc QUESTIONS ou RÉPONSES)
    const nextQMatch = text.slice(start + 10).search(/QUESTIONS\s+DE|RÉPONSES\s+DE/i);
    const end = nextQMatch > -1 ? start + 10 + nextQMatch : text.length;
    
    questions.push({
      type: "questions",
      rangeStart: from,
      rangeEnd: to,
      startIdx: start,
      endIdx: end,
      content: text.slice(start, end),
    });
  }

  // Détection des blocs RÉPONSES
  ANSWER_BLOCK_RE.lastIndex = 0;
  while ((match = ANSWER_BLOCK_RE.exec(text)) !== null) {
    const from = parseInt(match[1]);
    const to = parseInt(match[2]);
    const start = match.index;
    
    // Trouver la fin du bloc
    const nextRMatch = text.slice(start + 10).search(/QUESTIONS\s+DE|RÉPONSES\s+DE/i);
    const end = nextRMatch > -1 ? start + 10 + nextRMatch : text.length;
    
    answers.push({
      type: "answers",
      rangeStart: from,
      rangeEnd: to,
      startIdx: start,
      endIdx: end,
      content: text.slice(start, end),
    });
  }

  return { questions, answers };
}

// ============================================================================
// PARSING DES ITEMS NUMÉROTÉS
// ============================================================================

interface ParsedItem {
  number: number;
  text: string;
}

function parseNumberedItems(content: string, type: "questions" | "answers", rangeStart: number): ParsedItem[] {
  const items: ParsedItem[] = [];
  const text = content.trim();
  
  // Supprimer l'en-tête du bloc
  const cleanContent = text
    .replace(/Q[uO0]ESTI[O0]NS?\s+D[éeE3]\s+\d+\s+[àA]\s+\d+/gi, "")
    .replace(/R[éeE3]P[O0]NSES?\s+D[éeE3]\s+\d+\s+[àA]\s+\d+/gi, "")
    .trim();
  
  if (type === "answers") {
    // Pour les réponses, utiliser la détection par numéro explicite
    const lines = cleanContent.split(/\n/).map(l => l.trim());
    let currentNumber: number | null = null;
    let currentBuffer: string[] = [];

    for (const line of lines) {
      // Détection d'une nouvelle ligne numérotée avec plusieurs formats OCR variés
      // Formats supportés: "1)", "I)", "@", "©", "®", "&@", "42", "aI", "2I]", "6,", etc.
      const matchPatterns = [
        /^[IVX]+\)\s*(.*)$/i,                            // I), II), III), IV), etc.
        /^[(@©®&]+\s*(.*)$/,                             // @, ©, ®, &@, etc.
        /^a?[IVX]+\s+(.*)$/i,                            // aI, aII (OCR errors)
        /^(\d{1,2})\s*[.,)\]:-]\s*(.*)$/,                // 1., 2), 3], 4:, 5-
        /^[(&]?\s*(\d{1,2})[,)\]]\s*(.*)$/,              // (42), 2I], 6,
      ];
      
      let matched = false;
      
      for (const pattern of matchPatterns) {
        const match = line.match(pattern);
        if (match) {
          // Sauvegarder l'item précédent
          if (currentNumber !== null && currentBuffer.length > 0) {
            items.push({
              number: currentNumber,
              text: cleanOne(currentBuffer.join(" ")),
            });
          }
          
          // Démarrer un nouvel item
          // Convertir les numéros romains et symboles en numéros arabes
          currentNumber = rangeStart + items.length;
          const content = match[match.length - 1]; // Dernier groupe de capture
          currentBuffer = content ? [content] : [];
          matched = true;
          break;
        }
      }
      
      if (!matched && currentNumber !== null && line.length > 0) {
        // Continuer l'item en cours
        if (!/^(QUESTIONS|RÉPONSES)\s+DE/i.test(line) && 
            !/ANNALES CORRIGÉS|PREPACONCOURSIADE|^PAGE/i.test(line)) {
          currentBuffer.push(line);
        }
      }
    }

    // Ajouter le dernier item
    if (currentNumber !== null && currentBuffer.length > 0) {
      items.push({
        number: currentNumber,
        text: cleanOne(currentBuffer.join(" ")),
      });
    }
  } else {
    // Pour les questions, utiliser une heuristique basée sur les phrases
    // Les questions sont souvent séparées par des phrases se terminant par ? ou .
    const sentences = cleanContent
      .split(/(?<=[.?!])\s+(?=[A-ZÀÉÈÊËÎÏÔÖÛÜÙ@(])|(?<=\d\))\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && !/ANNALES|PREPACONCOURSIADE|^PAGE/i.test(s));
    
    sentences.forEach((sentence, idx) => {
      // Attribuer un numéro séquentiel basé sur rangeStart
      items.push({
        number: rangeStart + idx,
        text: cleanOne(sentence),
      });
    });
  }

  return items.filter(item => item.text.length >= 15);
}

// ============================================================================
// ALIGNEMENT INTELLIGENT Q ↔ R
// ============================================================================

interface AlignedQA {
  id: string;
  questionNumber: number;
  question: string;
  answer: string;
  confidence: "high" | "medium" | "low";
  source: string;
}

function alignQuestionsAnswers(
  questionBlocks: Block[],
  answerBlocks: Block[],
  sourceName: string
): AlignedQA[] {
  const aligned: AlignedQA[] = [];

  for (const qBlock of questionBlocks) {
    // Parser les questions du bloc en passant rangeStart pour la numérotation
    const questions = parseNumberedItems(qBlock.content, "questions", qBlock.rangeStart);
    
    console.log(`    → ${questions.length} questions extraites du bloc ${qBlock.rangeStart}-${qBlock.rangeEnd}`);
    
    // Trouver le bloc de réponses correspondant
    const aBlock = answerBlocks.find(
      a => Math.abs(a.rangeStart - qBlock.rangeStart) <= 5 &&
           Math.abs(a.rangeEnd - qBlock.rangeEnd) <= 5
    );

    if (!aBlock) {
      console.warn(`    ⚠️  Aucun bloc RÉPONSES trouvé pour QUESTIONS ${qBlock.rangeStart}-${qBlock.rangeEnd}`);
      // Ajouter les questions sans réponse
      questions.forEach(q => {
        aligned.push({
          id: `${sourceName}-${q.number}`,
          questionNumber: q.number,
          question: q.text,
          answer: "",
          confidence: "low",
          source: sourceName,
        });
      });
      continue;
    }

    // Parser les réponses du bloc
    const answers = parseNumberedItems(aBlock.content, "answers", aBlock.rangeStart);
    console.log(`    → ${answers.length} réponses extraites du bloc ${aBlock.rangeStart}-${aBlock.rangeEnd}`);

    // Créer un index des réponses par numéro
    const answersMap = new Map(answers.map(a => [a.number, a.text]));

    // Aligner chaque question avec sa réponse
    questions.forEach(q => {
      const answer = answersMap.get(q.number) || "";
      
      aligned.push({
        id: `${sourceName}-${q.number}`,
        questionNumber: q.number,
        question: q.text,
        answer: answer,
        confidence: answer.length > 0 ? (answer.length > 20 ? "high" : "medium") : "low",
        source: sourceName,
      });
    });
  }

  return aligned;
}

// ============================================================================
// VALIDATION DE COHÉRENCE
// ============================================================================

function validateAlignment(aligned: AlignedQA[]): {
  valid: AlignedQA[];
  flagged: AlignedQA[];
  stats: any;
} {
  const valid: AlignedQA[] = [];
  const flagged: AlignedQA[] = [];

  const seenQuestions = new Set<string>();

  for (const qa of aligned) {
    const qKey = qa.question.toLowerCase().slice(0, 50);
    
    // Détection des doublons
    if (seenQuestions.has(qKey)) {
      flagged.push({ ...qa, confidence: "low" });
      continue;
    }
    
    seenQuestions.add(qKey);

    // Validation de la longueur
    if (qa.question.length < 15) {
      flagged.push({ ...qa, confidence: "low" });
      continue;
    }

    // Validation de la présence de ponctuation finale
    if (!/[.?!]$/.test(qa.question) && qa.question.length < 100) {
      // Tolérance pour les questions longues qui peuvent être tronquées
      flagged.push({ ...qa, confidence: "medium" });
      continue;
    }

    valid.push(qa);
  }

  const stats = {
    total: aligned.length,
    valid: valid.length,
    flagged: flagged.length,
    withAnswer: aligned.filter(qa => qa.answer.length > 0).length,
    highConfidence: aligned.filter(qa => qa.confidence === "high").length,
    mediumConfidence: aligned.filter(qa => qa.confidence === "medium").length,
    lowConfidence: aligned.filter(qa => qa.confidence === "low").length,
  };

  return { valid, flagged, stats };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log("🧩 Alignement intelligent Questions ↔ Réponses\n");

  const files = fs.readdirSync(OCR_DIR).filter(f => f.endsWith(".txt"));
  const targetFiles = files.filter(f => f.includes("annalescorrigées"));

  if (targetFiles.length === 0) {
    console.error("❌ Aucun fichier d'annales trouvé dans tmp/ocr-cache");
    process.exit(1);
  }

  console.log(`📚 Fichiers trouvés : ${targetFiles.length}\n`);

  let allAligned: AlignedQA[] = [];

  for (const file of targetFiles) {
    const filePath = path.join(OCR_DIR, file);
    const sourceName = file.replace(".txt", "").replace(/annalescorrigées-/, "");
    
    console.log(`📄 Traitement : ${file}`);
    
    const rawText = fs.readFileSync(filePath, "utf8");
    const cleanText = normalizeOcrText(rawText);
    const strippedText = stripGlobalNoise(cleanText);

    // Détection des blocs
    const { questions, answers } = detectBlocks(strippedText);
    
    console.log(`  📊 ${questions.length} blocs QUESTIONS, ${answers.length} blocs RÉPONSES`);
    
    // Afficher les détails des blocs pour débogage
    if (questions.length > 0) {
      console.log("  🔍 Blocs QUESTIONS:");
      questions.forEach((q, idx) => {
        console.log(`      [${idx + 1}] Range ${q.rangeStart}-${q.rangeEnd}, Position ${q.startIdx}-${q.endIdx}`);
      });
    }
    if (answers.length > 0) {
      console.log("  🔍 Blocs RÉPONSES:");
      answers.forEach((a, idx) => {
        console.log(`      [${idx + 1}] Range ${a.rangeStart}-${a.rangeEnd}, Position ${a.startIdx}-${a.endIdx}`);
      });
    }

    if (questions.length === 0) {
      console.warn(`  ⚠️  Aucun bloc détecté, passage au suivant\n`);
      continue;
    }

    // Alignement
    const aligned = alignQuestionsAnswers(questions, answers, sourceName);
    allAligned.push(...aligned);

    console.log(`  ✅ ${aligned.length} paires Q/A extraites\n`);
  }

  // Validation globale
  console.log("🔍 Validation de la cohérence...\n");
  const { valid, flagged, stats } = validateAlignment(allAligned);

  // Statistiques
  console.log("📊 STATISTIQUES FINALES");
  console.log(`  Total extrait      : ${stats.total}`);
  console.log(`  Valides            : ${stats.valid} (${((stats.valid / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Signalés           : ${stats.flagged} (${((stats.flagged / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Avec réponse       : ${stats.withAnswer} (${((stats.withAnswer / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Confiance haute    : ${stats.highConfidence}`);
  console.log(`  Confiance moyenne  : ${stats.mediumConfidence}`);
  console.log(`  Confiance basse    : ${stats.lowConfidence}`);

  // Export
  const exportData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      totalQuestions: stats.total,
      validQuestions: stats.valid,
      flaggedQuestions: stats.flagged,
      coverageRate: ((stats.withAnswer / stats.total) * 100).toFixed(1) + "%",
    },
    questions: valid,
    flaggedQuestions: flagged,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(exportData, null, 2), "utf8");
  
  console.log(`\n💾 Export réussi → ${path.basename(OUTPUT_FILE)}`);
  console.log(`\n✅ Alignement terminé !`);
  console.log(`\n📁 Fichier disponible : ${OUTPUT_FILE}`);
}

// Exécution
if (import.meta.url.includes("alignQuestionsAnswers.ts")) {
  main().catch(console.error);
}

export { alignQuestionsAnswers, detectBlocks, parseNumberedItems, validateAlignment };

