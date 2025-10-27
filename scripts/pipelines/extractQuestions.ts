import fs from "fs";
import path from "path";
import crypto from "crypto";
import pLimit from "p-limit";

const OCR_DIR = path.resolve("tmp/ocr-cache");
const OUT_DIR = path.resolve("src/data/concours");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Normalisation OCR renforcée
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
    // chiffres dans mots (é1ements -> éléments)
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

// Nettoyage global du bruit (allégé)
function stripGlobalNoise(t: string): string {
  return t
    .replace(/ANNALES?\s+CORRIG[ÉE]S.*?(?=\bQ)/gi, "")
    .replace(/ONCOURSIADE\.COM/gi, "")
    .replace(/PR[ÉE]PACONCOURSIADE\.COM/gi, "")
    .trim();
}

// Nettoyage final par item
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

// Regex tolérante OCR pour détecter les blocs
const QUESTION_BLOCK_RE = /Q[uO0]ESTI[O0]NS?\s+D[éeE3]\s+(\d+)\s+[àA]\s+(\d+)/gi;
const ANSWER_BLOCK_RE = /R[éeE3]P[O0]NSES?\s+D[éeE3]\s+(\d+)\s+[àA]\s+(\d+)/gi;

const START_Q = /(?=\b\d{1,3}\s*[.)-]\s+|(?:(?:D[ée]finir|Citez?|Donnez?|Expliquez?|Quels?|Quelle|Nommer|Indiquez|Compl[ée]tez|Distinguez|Comparez)\b))/gim;
const END_Q = /([?.:!])(?!\w)/;

// Scinde les questions intelligemment
function splitQuestions(block: string): string[] {
  const rough = block.split(START_Q).map(s => s.trim()).filter(Boolean);
  
  const merged: string[] = [];
  for (const frag of rough) {
    const okLen = frag.length >= 10;
    const hasEnd = END_Q.test(frag);
    if (!okLen || !hasEnd) {
      if (merged.length) merged[merged.length - 1] += (merged[merged.length - 1].endsWith('-') ? '' : ' ') + frag;
      else merged.push(frag);
    } else {
      merged.push(frag);
    }
  }
  
  return merged
    .map(q => q.replace(/\s{2,}/g, ' ').trim())
    .filter(q => q.length >= 12);
}

// Scinde les réponses par numéros
function splitAnswers(raw: string): string[] {
  const lines = raw.split(/\n/).map(l => l.trim()).filter(Boolean);
  const out: string[] = [];
  let buf: string[] = [];
  let started = false;

  for (const line of lines) {
    if (/^\d{1,3}\s*[.)-]\s*/.test(line)) {
      if (started && buf.length) out.push(buf.join(" "));
      buf = [line.replace(/^\d{1,3}\s*[.)-]\s*/, "")];
      started = true;
    } else if (started) {
      if (/^R[ÉE]PONSES\s+DE|^QUESTIONS\s+DE/i.test(line)) break;
      buf.push(line);
    }
  }
  if (buf.length) out.push(buf.join(" "));
  return out.map(cleanOne);
}

async function extractFromTextFile(filePath: string) {
  const rawText = fs.readFileSync(filePath, "utf8");
  const cleanText = normalizeOcrText(rawText);

  console.log(`\n📄 ${path.basename(filePath)}`);
  
  const questionBlocks = [...cleanText.matchAll(QUESTION_BLOCK_RE)];
  const answerBlocks = [...cleanText.matchAll(ANSWER_BLOCK_RE)];
  
  console.log(`  📊 ${questionBlocks.length} blocs QUESTIONS, ${answerBlocks.length} blocs RÉPONSES`);
  
  if (questionBlocks.length === 0) {
    console.warn("  ⚠️  Aucun bloc");
    return;
  }
  
  let allQA: any[] = [];
  const seenRanges = new Set<string>();
  const seenBlockHash = new Set<string>();
  
  function sha1(s: string) { 
    return crypto.createHash('sha1').update(s).digest('hex'); 
  }
  
  for (const qb of questionBlocks) {
    const from = parseInt(qb[1]);
    const to = parseInt(qb[2]);
    const range = `${from}-${to}`;
    
    const start = qb.index!;
    const nextQ = cleanText.indexOf("QUESTIONS", start + 10);
    const end = nextQ > -1 ? nextQ : cleanText.length;
    const rawBlock = cleanText.slice(start, end);
    const h = sha1(stripGlobalNoise(rawBlock).slice(0, 2000));
    
    if (seenRanges.has(range) || seenBlockHash.has(h)) {
      continue;
    }
    seenRanges.add(range);
    seenBlockHash.add(h);
    
    const block = stripGlobalNoise(rawBlock)
      .replace(/\n{2,}/g, "\n")
      .replace(/R[ÉE]PONSES[\s\S]*/i, "")
      .trim();
    const questions = splitQuestions(block);
    
    const closestAnswerBlock = answerBlocks.find(b => Math.abs(parseInt(b[1]) - from) <= 2);
    let answers: string[] = [];
    
    if (closestAnswerBlock) {
      const startA = closestAnswerBlock.index!;
      const nextA = cleanText.indexOf("RÉPONSES", startA + 10);
      const endA = nextA > -1 ? nextA : cleanText.length;
      const contentA = cleanText.slice(startA, endA);
      answers = splitAnswers(stripGlobalNoise(contentA));
    }
    
    questions.forEach((q, i) => {
      allQA.push({
        id: `${from}-${i + 1}`,
        question: q,
        answer: answers[i] || "",
      });
    });
  }
  
  // Nettoyage final et déduplication
  const seenQ = new Set<string>();
  allQA = allQA
    .map(it => ({ ...it, question: cleanOne(it.question), answer: cleanOne(it.answer || "") }))
    .filter(it => {
      const key = it.question.toLowerCase();
      if (seenQ.has(key)) return false;
      seenQ.add(key);
      return it.question.length >= 15;
    });
  
  console.log(`  ✅ ${allQA.length} questions uniques après nettoyage`);
  
  if (allQA.length > 200) allQA = allQA.slice(0, 200);
  
  const outFile = path.join(OUT_DIR, path.basename(filePath).replace(".txt", "-raw.json"));
  fs.writeFileSync(outFile, JSON.stringify(allQA, null, 2), "utf8");
  console.log(`  💾 Sauvegardé → ${path.basename(outFile)}`);
  
  // Calcul de la couverture
  const extractedChars = allQA.reduce((acc, q) => acc + q.question.length, 0);
  const totalChars = cleanText.length;
  const coverage = extractedChars / totalChars || 0;
  const coveragePct = Math.round(coverage * 100);
  
  console.log(`  📈 Couverture : ${coveragePct}% (${extractedChars}/${totalChars} caractères)`);
  
  return { allQA, coverage, outFile, processedBlocks: questionBlocks.length, totalBlocks: questionBlocks.length };
}

(async () => {
  console.log("🚀 Extraction Q&A\n");
  
  const files = fs.readdirSync(OCR_DIR).filter(f => f.endsWith(".txt"));
  const targetFile = files.find(f => f.includes('annalescorrigées-Volume-1'));
  
  if (!targetFile) {
    console.warn("⚠️  Aucun fichier cible");
    return;
  }
  
  const filePath = path.join(OCR_DIR, targetFile);
  
  if (process.argv.includes('--watch')) {
    const target = 0.9;
    const interval = 45000;
    let pass = 0;
    let lastCoverage = 0;
    const stateFile = path.join(OUT_DIR, 'extraction-state.json');
    
    while (pass < 15) {
      pass++;
      console.log(`\n🌀 Pass #${pass} — Extraction en cours...`);
      
      const result = await extractFromTextFile(filePath);
      const coverage = result?.coverage || 0;
      const diff = coverage - lastCoverage;
      const processed = result?.processedBlocks || 0;
      const total = result?.totalBlocks || 0;
      
      console.log(`✅ Pass #${pass} — ${(coverage * 100).toFixed(1)}% ${diff > 0 ? `(+${(diff * 100).toFixed(1)}%)` : ''} — ${processed}/${total} blocs`);
      
      // Sauvegarde du state
      fs.writeFileSync(stateFile, JSON.stringify({
        coverage,
        lastUpdated: new Date().toISOString(),
        pass,
        file: path.basename(filePath)
      }, null, 2));
      
      if (coverage >= target) {
        console.log(`\n🏁 Extraction complète : ${(coverage * 100).toFixed(1)}% — ${processed}/${total} blocs traités`);
        break;
      }
      
      console.log(`⏳ Attente ${interval / 1000}s...`);
      await new Promise(r => setTimeout(r, interval));
      lastCoverage = coverage;
    }
    
    if (pass >= 15) console.warn("\n⚠️  Limite de 15 passes atteinte");
  } else if (process.argv.includes('--all')) {
    // Mode parallèle pour tous les fichiers
    const limit = pLimit(2);
    const allFiles = files.filter(f => f.endsWith('.txt'));
    
    console.log(`\n🚀 Traitement de ${allFiles.length} fichiers en parallèle...`);
    
    const results = await Promise.all(
      allFiles.map(file => limit(() => extractFromTextFile(path.join(OCR_DIR, file))))
    );
    
    const totalCoverage = results.reduce((acc, r) => acc + (r?.coverage || 0), 0) / results.length;
    console.log(`\n✅ Tous fichiers traités — Couverture moyenne : ${(totalCoverage * 100).toFixed(1)}%`);
  } else {
    await extractFromTextFile(filePath);
    console.log("\n✅ Terminé\n");
  }
})();
