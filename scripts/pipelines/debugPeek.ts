/**
 * Fonction de debug pour inspecter le texte brut extrait
 */
export function peekText(raw: string, label = "RAW", maxLength = 2000): void {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🔍 DEBUG: ${label}`);
  console.log(`${'='.repeat(70)}\n`);
  
  // Afficher les premiers caractères
  console.log(`📝 Premiers ${Math.min(maxLength, raw.length)} caractères :`);
  console.log(raw.slice(0, maxLength));
  console.log(`\n... (total: ${raw.length} caractères)\n`);
  
  // Analyser les patterns
  console.log(`📊 Analyse des patterns (80 premières lignes) :`);
  const lines = raw.split(/\r?\n/);
  const sample = lines.slice(0, 80);
  
  sample.forEach((l, i) => {
    const trimmed = l.trim();
    if (!trimmed) return;
    
    const flags = [
      /CHAPITRE/i.test(trimmed) && 'CHAP',
      /^([IVXLC]+\.\s|#\s)/.test(trimmed) && 'TITRE',
      /^\d+(\.\d+)*\s/.test(trimmed) && 'NUM',
      /(Définition|Indication|Traitement)\s*:/.test(trimmed) && 'CONCEPT',
      /(mg\/kg|µg\/kg\/min|mmHg|mmol\/L)/i.test(trimmed) && 'CALC',
      /^Q\d+[\.\)]\s/.test(trimmed) && 'Q?',
      /^([A-E]\)\s)/.test(trimmed) && 'OPTION'
    ].filter(Boolean);
    
    if (flags.length > 0 || trimmed.length > 50) {
      console.log(`${String(i).padStart(3, '0')} [${flags.join('|') || 'TEXT'}] ${trimmed.substring(0, 100)}`);
    }
  });
  
  console.log(`\n${'='.repeat(70)}\n`);
}

