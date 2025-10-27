/**
 * Extracteur Q&A optimisé pour PDFs IADE
 * Extrait toutes les questions et réponses avec patterns robustes
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Interface de sortie
interface QAItem {
  source: 'annales_v1' | 'annales_v2' | 'cours';
  id: number;
  block: { from: number; to: number };
  type: 'Open' | 'TrueFalse' | 'MultipleChoice' | 'FillIn' | 'ClinicalCase';
  text: string;
  options?: string[];
  answer?: string;
  correctOptions?: number[];
  explanation?: string;
  themes?: string[];
}

interface QABlock {
  from: number;
  to: number;
  content: string;
}

// Normalisation OCR : corrige les erreurs typiques de OCR médical
function normalizeOcrText(text: string): string {
  return text
    // Corrige les chiffres mal lus
    .replace(/\bI\b/g, '1')
    .replace(/\bO\b/g, '0')
    .replace(/\bl\b/g, '1')
    .replace(/\bS\b/g, '5')
    .replace(/\bB\b/g, '8')
    // Supprime les doubles espaces ou artefacts
    .replace(/[•·●]/g, '')
    .replace(/\s{2,}/g, ' ')
    // Nettoie les caractères parasites
    .trim();
}

// Normalisation du texte
function normalize(raw: string): string {
  // Appliquer d'abord la correction OCR
  let text = normalizeOcrText(raw);
  
  return text
    // Retire en-têtes/pieds
    .replace(/ANNALES.*?PREPACONCOURSIADE\.COM/gi, '')
    .replace(/PREPACONCOURSIADE\.COM/gi, '')
    .replace(/\n?\s*\d{1,3}\s*\n/g, '\n')
    // Ligatures OCR courantes
    .replace(/ﬁ/g, 'fi')
    .replace(/ﬂ/g, 'fl')
    .replace(/'/g, "'")
    // Dé-césure
    .replace(/(\w)-\n(\w)/g, '$1$2')
    // Espaces multiples
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// Découpage en blocs QUESTIONS/RÉPONSES avec limites strictes
function sliceBlocks(text: string): { questionBlocks: QABlock[], answerBlocks: QABlock[] } {
  const questionBlocks: QABlock[] = [];
  const answerBlocks: QABlock[] = [];

  // Capture tous les blocs "QUESTIONS/REPONSES DE X À Y"
  const allMatches = Array.from(text.matchAll(/(QUESTIONS|R[ÉE]PONSES) DE\s+(\d+)\s+À\s+(\d+)/gi));
  
  for (let i = 0; i < allMatches.length; i++) {
    const match = allMatches[i];
    const [, type, from, to] = match;
    const start = match.index!;
    const end = i + 1 < allMatches.length ? allMatches[i + 1].index! : text.length;
    const content = text.slice(start, end).trim();

    if (/QUESTIONS/i.test(type)) {
      questionBlocks.push({ from: +from, to: +to, content });
    } else {
      answerBlocks.push({ from: +from, to: +to, content });
    }
  }

  return { questionBlocks, answerBlocks };
}

// Regex tolérante pour OCR : accepte chiffres et lettres mal lues
// Groupe 1: numéro, Groupe 2: texte de la question
const QUESTION_REGEX = /(?:^|\n)\s*(\d{1,3}|[IQl])\s*[.)\-]\s*(.+?)(?=(?:^\s*(?:\d{1,3}|[IQl])\s*[.)\-]\s)|$)/gms;

// Extraction des questions depuis un bloc
function extractQuestionsFromBlock(block: QABlock): Array<{ num: number; text: string }> {
  const items: Array<{ num: number; text: string }> = [];
  
  // Extraire toutes les lignes potentiellement questions
  const matches = Array.from(block.content.matchAll(QUESTION_REGEX));
  console.log(`    Debug: ${matches.length} matches trouvés dans le bloc ${block.from}-${block.to}`);
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const numStr = match[1]?.trim() || '';
    const text = match[2]?.trim() || '';
    
    console.log(`    Match ${i}: num="${numStr}", text="${text.substring(0, 50)}..."`);
    
    // Corriger les erreurs OCR dans le numéro
    const correctedNum = normalizeOcrText(numStr);
    const num = parseInt(correctedNum.replace(/[IQl]/g, '1'));
    
    // Filtrer : longueur suffisante et présence de ponctuation
    if (num >= block.from && num <= block.to && text.length > 20 && /[?.]/.test(text)) {
      items.push({ num, text });
    }
  }
  
  return items;
}

// Classification des types de questions
function classify(q: string): QAItem['type'] {
  const question = q.toLowerCase();
  
  if (/vrai ?ou ?faux/i.test(question)) return 'TrueFalse';
  if (/choisissez|chochez|parmi les propositions|la ou les bonnes/i.test(question)) return 'MultipleChoice';
  if (/remplissez|compl[ée]tez|tableau|sch[ée]ma|texte/i.test(question)) return 'FillIn';
  if (/cas clinique|vous [êe]tes|mr\.|mme |patient|infirmi[èe]r/i.test(question)) return 'ClinicalCase';
  return 'Open';
}

// Extraction des options (QCM)
function extractOptions(text: string): string[] {
  const opts: string[] = [];
  const pattern = /(?:^|\n)\s*(?:[-•·]|[A-D]\)|[A-D][\.\)])\s*(.+?)(?=\n[-•·A-D]|\n\d+\b|\n\n|$)/gis;
  
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const opt = match[1].trim();
    if (opt.length > 5 && opt.length < 200) {
      opts.push(opt);
    }
  }
  
  return opts.length > 2 ? opts : undefined; // Au moins 2 options
}

// Extraction principale avec alignement strict
export async function extractQA(pdfPath: string): Promise<QAItem[]> {
      const sourceName = path.basename(pdfPath);
      const source = sourceName.includes('volume-1') ? 'annales_v1' 
                   : sourceName.includes('volume-2') ? 'annales_v2'
                   : 'cours';
      
      console.log(`\n📄 Extraction Q&A: ${sourceName}`);
      
      try {
        // Lecture texte depuis le fichier texte
        let rawText = fs.readFileSync(pdfPath, 'utf-8');
    
    const text = normalize(rawText);
    
    // Découpage en blocs
    const { questionBlocks, answerBlocks } = sliceBlocks(text);
    console.log(`  ✓ ${questionBlocks.length} blocs QUESTIONS détectés`);
    console.log(`  ✓ ${answerBlocks.length} blocs RÉPONSES détectés`);
    
    const allQuestions: QAItem[] = [];
    
    // Traitement de chaque bloc de questions
    for (const qBlock of questionBlocks) {
      const questions = extractQuestionsFromBlock(qBlock);
      
      // Trouver le bloc de réponses correspondant
      const matchingAnswerBlock = answerBlocks.find(
        b => b.from === qBlock.from && b.to === qBlock.to
      );
      
      // Extraire les réponses
      const answers = matchingAnswerBlock 
        ? extractQuestionsFromBlock(matchingAnswerBlock)
        : [];
      
      // Créer un Map pour les réponses
      const answerMap = new Map<number, string>();
      for (const ans of answers) {
        answerMap.set(ans.num, ans.text);
      }
      
      // Générer les QAItems
      for (const q of questions) {
        const qType = classify(q.text);
        const options = extractOptions(q.text);
        
        allQuestions.push({
          source,
          id: q.num,
          block: { from: qBlock.from, to: qBlock.to },
          type: qType,
          text: q.text.substring(0, 500),
          options,
          answer: answerMap.get(q.num) || undefined,
          explanation: answerMap.get(q.num) || undefined,
          themes: []
        });
      }
    }
    
    console.log(`  ✓ ${allQuestions.length} questions extraites`);
    
    // Debug si peu de questions
    if (allQuestions.length < 5) {
      console.warn(`  ⚠️  Aucune question significative trouvée. Vérifie les caractères OCR !`);
      console.warn(`  📝 Extrait: ${text.substring(0, 500)}...`);
    }
    
    // Limiter pour éviter les dépassements
    if (allQuestions.length > 200) {
      console.log(`  ⚠️  Limitation à 200 questions (sur ${allQuestions.length})`);
      return allQuestions.slice(0, 200);
    }
    
    return allQuestions;
    
  } catch (error: any) {
    console.error(`  ❌ Erreur: ${error.message}`);
    return [];
  }
}

// Point d'entrée
if (import.meta.url.includes('extractQuestions.ts')) {
  (async () => {
    const sourceDir = path.join(__dirname, '../../tmp/ocr-cache');
    
    if (!fs.existsSync(sourceDir)) {
      console.error(`❌ Dossier introuvable: ${sourceDir}`);
      console.log(`💡 Lancer d'abord: npx tsx scripts/pipelines/extractPdfToText.ts`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.txt'));
    
    if (files.length === 0) {
      console.error(`❌ Aucun fichier .txt trouvé dans ${sourceDir}`);
      console.log(`💡 Extraire d'abord le texte des PDFs via pdfTextExtractor`);
      process.exit(1);
    }
    
    console.log(`🚀 Extraction Q&A de ${files.length} fichiers\n`);
    
    for (const file of files) {
      const fullPath = path.join(sourceDir, file);
      const qas = await extractQA(fullPath);
      
      if (qas.length > 0) {
        const outputFile = path.join(__dirname, `../../src/data/concours/${path.basename(file, '.txt')}-qas.json`);
        fs.writeFileSync(outputFile, JSON.stringify({ totalQuestions: qas.length, questions: qas }, null, 2));
        console.log(`  💾 Sauvegardé: ${outputFile}`);
        console.log(`  📊 ${qas.length} questions extraites\n`);
      } else {
        console.log(`  ⚠️  Aucune question extraite\n`);
      }
    }
    
    console.log(`✅ Extraction terminée\n`);
  })().catch(console.error);
}
