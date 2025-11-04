/**
 * OCR Cleaner - Nettoyage profond des artefacts OCR
 * Cycle IADE-3 - Phase 1.2
 */

export interface CleaningReport {
  original: string;
  cleaned: string;
  artefactsRemoved: string[];
  confidence: number;
}

/**
 * Nettoie les artefacts OCR courants
 */
export function cleanOCRText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Supprimer tirets artefacts
  cleaned = cleaned.replace(/–/g, '-');
  cleaned = cleaned.replace(/—/g, '-');

  // 2. Espaces multiples
  cleaned = cleaned.replace(/\s+/g, ' ');

  // 3. Parenthèses mal formatées
  cleaned = cleaned.replace(/\(\s+/g, '(');
  cleaned = cleaned.replace(/\s+\)/g, ')');

  // 4. Guillemets mal formatés
  cleaned = cleaned.replace(/\"\s+/g, '"');
  cleaned = cleaned.replace(/\s+\"/g, '"');
  cleaned = cleaned.replace(/«\s+/g, '« ');
  cleaned = cleaned.replace(/\s+»/g, ' »');

  // 5. Points de suspension
  cleaned = cleaned.replace(/\.\.\./g, '…');
  cleaned = cleaned.replace(/\.{4,}/g, '…');

  // 6. Lignes brisées (reconstruction)
  // "mot-\nfin" → "mot-fin"
  cleaned = cleaned.replace(/(\w)-\s*\n\s*(\w)/g, '$1$2');

  // 7. Chiffres mal formatés (O au lieu de 0)
  cleaned = cleaned.replace(/\bO(\d)/g, '0$1'); // O5 → 05
  cleaned = cleaned.replace(/(\d)O\b/g, '$10'); // 5O → 50

  // 8. Caractères spéciaux médicaux
  cleaned = cleaned.replace(/µ/g, 'µ'); // Normaliser micro
  cleaned = cleaned.replace(/°/g, '°'); // Normaliser degré

  // 9. Supprimer sauts de ligne multiples
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // 10. Trim
  cleaned = cleaned.trim();

  return cleaned;
}

/**
 * Reconstruit le contexte médical à partir de fragments
 */
export function reconstructMedicalContext(fragments: string[]): string {
  if (!fragments || fragments.length === 0) return '';

  // Mots-clés médicaux pour détecter contexte
  const medicalKeywords = [
    'score', 'norme', 'valeur', 'signe', 'symptôme', 'diagnostic',
    'traitement', 'médicament', 'dose', 'posologie', 'indication',
    'contre-indication', 'effets secondaires', 'surveillance',
    'patient', 'pathologie', 'anatomie', 'physiologie'
  ];

  // Filtrer fragments pertinents
  const relevant = fragments.filter(f => {
    const lower = f.toLowerCase();
    return medicalKeywords.some(kw => lower.includes(kw));
  });

  if (relevant.length === 0) return fragments.join(' ');

  // Reconstruire en phrases complètes
  let reconstructed = relevant.join(' ');

  // Nettoyer
  reconstructed = cleanOCRText(reconstructed);

  // Assurer ponctuation finale
  if (!/[.!?]$/.test(reconstructed)) {
    reconstructed += '.';
  }

  return reconstructed;
}

/**
 * Détecte si un texte contient des artefacts OCR
 */
export function hasOCRArtefacts(text: string): boolean {
  if (!text) return false;

  const artefactPatterns = [
    /–/,           // Tiret long
    /\s{2,}/,      // Espaces multiples
    /\(\s+\w/,     // "( mot"
    /\w\s+\)/,     // "mot )"
    /\"\s+\w/,     // '" mot'
    /\w\s+\"/,     // 'mot "'
    /\w-\n\w/,     // Mot coupé sur 2 lignes
    /\bO\d/,       // O au lieu de 0
    /\d O\b/,      // 0 au lieu de O
    /\.{4,}/       // Points multiples
  ];

  return artefactPatterns.some(pattern => pattern.test(text));
}

/**
 * Nettoyage avancé avec rapport détaillé
 */
export function cleanOCRTextAdvanced(text: string): CleaningReport {
  const original = text;
  const artefactsRemoved: string[] = [];

  // Détecter artefacts avant nettoyage
  if (/–/.test(text)) artefactsRemoved.push('tirets longs');
  if (/\s{2,}/.test(text)) artefactsRemoved.push('espaces multiples');
  if (/\(\s+\w|\w\s+\)/.test(text)) artefactsRemoved.push('parenthèses mal formatées');
  if (/\"\s+\w|\w\s+\"/.test(text)) artefactsRemoved.push('guillemets mal formatés');
  if (/\w-\n\w/.test(text)) artefactsRemoved.push('mots coupés');
  if (/\bO\d|\d O\b/.test(text)) artefactsRemoved.push('chiffres O/0');

  // Nettoyer
  const cleaned = cleanOCRText(text);

  // Calculer confiance
  const artefactCount = artefactsRemoved.length;
  const confidence = Math.max(0.5, 1.0 - (artefactCount * 0.1));

  return {
    original,
    cleaned,
    artefactsRemoved,
    confidence
  };
}

/**
 * Nettoie un tableau d'options (pour QCM)
 */
export function cleanOptions(options: string[]): string[] {
  if (!options) return [];

  return options
    .map(opt => cleanOCRText(opt))
    .filter(opt => opt && opt.length > 0);
}

/**
 * Valide la qualité du nettoyage
 */
export function validateCleaning(original: string, cleaned: string): boolean {
  // Vérifier que le nettoyage n'a pas détruit le contenu
  if (!cleaned || cleaned.length < original.length * 0.5) {
    return false;
  }

  // Vérifier qu'il reste du contenu significatif
  const wordCount = cleaned.split(/\s+/).length;
  if (wordCount < 3) {
    return false;
  }

  // Vérifier absence artefacts majeurs
  if (hasOCRArtefacts(cleaned)) {
    // Encore des artefacts après nettoyage
    return false;
  }

  return true;
}

/**
 * Nettoie une question complète (texte + options + explication)
 */
export interface QuestionCleaned {
  text: string;
  options: string[];
  explanation: string;
  confidence: number;
  artefactsRemoved: string[];
}

export function cleanQuestion(question: {
  text: string;
  options?: string[];
  explanation?: string;
}): QuestionCleaned {
  const textReport = cleanOCRTextAdvanced(question.text);
  const optionsClean = question.options ? cleanOptions(question.options) : [];
  const explanationClean = question.explanation ? cleanOCRText(question.explanation) : '';

  // Calculer confiance globale
  const optionsConfidence = optionsClean.length >= 4 ? 1.0 : 0.5;
  const explanationConfidence = explanationClean.length > 50 ? 1.0 : 0.7;
  const avgConfidence = (textReport.confidence + optionsConfidence + explanationConfidence) / 3;

  return {
    text: textReport.cleaned,
    options: optionsClean,
    explanation: explanationClean,
    confidence: avgConfidence,
    artefactsRemoved: textReport.artefactsRemoved
  };
}

