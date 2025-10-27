import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: string;
  points: number;
  sourceModule: string;
  tags: string[];
}

/**
 * Calcule un score de confiance pour une question basé sur plusieurs critères
 */
function calculateQuestionConfidence(question: Question): number {
  let score = 7.0; // Score de base

  // Critères négatifs
  if (question.text.length < 20) score -= 2;
  if (question.text.length > 300) score -= 0.5;
  if (question.options.length < 2 || question.options.length > 6) score -= 1;
  if (!question.text.includes('?')) score -= 0.5;
  
  // Caractères suspects ou artefacts OCR
  if (question.text.includes('(') && !question.text.includes(')')) score -= 1;
  if (question.text.includes('«') && !question.text.includes('»')) score -= 1;
  if (question.text.match(/[–\-]{2,}/)) score -= 0.5;
  
  // Mots peu informatifs
  const lowInfoTerms = ['" ?', '«""', '""', '(', ')'];
  if (lowInfoTerms.some(term => question.text.includes(term))) score -= 0.5;

  // Critères positifs
  if (question.options.length >= 3 && question.options.length <= 4) score += 0.5;
  if (question.difficulty !== 'easy') score += 0.3;
  if (question.category && question.category !== 'general' && question.category !== 'Général') score += 0.2;
  
  return Math.max(0, Math.min(10, score));
}

/**
 * Calcule un score de confiance pour les réponses proposées
 */
function calculateOptionsConfidence(question: Question): number {
  let score = 7.0;

  // Toutes les options sont trop courtes
  const avgLength = question.options.reduce((sum, opt) => sum + opt.length, 0) / question.options.length;
  if (avgLength < 10) score -= 2;
  if (avgLength > 200) score -= 1;

  // Options très courtes (probablement OCR défectueux)
  const shortOptions = question.options.filter(opt => opt.length < 5);
  if (shortOptions.length > 0) score -= shortOptions.length * 0.5;

  // Options qui semblent être des artefacts
  const artefactPattern = /^[A-Z]\s*$/; // Juste une lettre
  const artefacts = question.options.filter(opt => artefactPattern.test(opt));
  score -= artefacts.length * 0.5;

  // Toutes options différentes
  const uniqueOptions = new Set(question.options);
  if (uniqueOptions.size === question.options.length) score += 0.5;

  // Options équilibrées en longueur
  const lengths = question.options.map(opt => opt.length);
  const minLength = Math.min(...lengths);
  const maxLength = Math.max(...lengths);
  if (maxLength / minLength < 3) score += 0.5;

  return Math.max(0, Math.min(10, score));
}

/**
 * Calcule un score de confiance pour la réponse correcte
 */
function calculateCorrectAnswerConfidence(question: Question): number {
  let score = 7.0;

  // Index valide
  if (question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
    score -= 3;
  }

  // La réponse correcte existe
  const correctOption = question.options[question.correctAnswer];
  if (!correctOption) score -= 2;

  // La réponse correcte n'est pas un artefact
  if (correctOption && correctOption.length < 3) score -= 1.5;
  if (correctOption && /^[A-Z]\s*$/.test(correctOption)) score -= 1;

  // Cohérence avec la question
  if (question.text && correctOption) {
    // Si la question est bien formée, bonus
    if (question.text.length > 30 && correctOption.length > 10) score += 0.5;
  }

  return Math.max(0, Math.min(10, score));
}

/**
 * Convertit un score numérique en catégorie qualitative
 */
function scoreToCategory(score: number): string {
  if (score < 2) return '0-2';
  if (score < 5) return '2-5';
  if (score < 7) return '5-7';
  return '7-10';
}

/**
 * Nettoie le texte pour le CSV (échap les guillemets)
 */
function cleanForCSV(text: string): string {
  if (!text) return '';
  return text.replace(/"/g, '""');
}

/**
 * Extrait le label/thématique à partir des tags ou de la catégorie
 */
function extractLabel(question: Question): string {
  if (question.tags && question.tags.length > 0) {
    return question.tags.join(', ');
  }
  if (question.category) {
    return question.category;
  }
  return 'Non spécifié';
}

function main() {
  console.log('🚀 Extraction des questions vers CSV...');

  // Lecture du fichier JSON
  const questionsPath = path.join(__dirname, '../src/data/generatedQuestions.json');
  const questionsData: Question[] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));

  console.log(`📊 ${questionsData.length} questions trouvées`);

  // Création des lignes CSV
  const csvLines: string[] = [];

  // En-tête CSV
  csvLines.push([
    'ID',
    'Question',
    'Confidence Question (AI)',
    'Confidence Question (Manual)',
    'Réponses Proposées',
    'Confidence Réponses Proposées (AI)',
    'Confidence Réponses Proposées (Manual)',
    'Réponse Vraie',
    'Confidence Réponse Vraie (AI)',
    'Confidence Réponse Vraie (Manual)',
    'Label/Thématique'
  ].join(','));

  // Traitement de chaque question
  questionsData.forEach((question, index) => {
    const questionConfidence = calculateQuestionConfidence(question);
    const optionsConfidence = calculateOptionsConfidence(question);
    const correctAnswerConfidence = calculateCorrectAnswerConfidence(question);
    const label = extractLabel(question);
    
    const correctOption = question.options[question.correctAnswer] || 'Non définie';
    
    const line = [
      question.id,
      `"${cleanForCSV(question.text)}"`,
      questionConfidence.toFixed(1),
      '', // À remplir manuellement
      `"${question.options.map(cleanForCSV).join(' | ')}"`,
      optionsConfidence.toFixed(1),
      '', // À remplir manuellement
      `"${cleanForCSV(correctOption)}"`,
      correctAnswerConfidence.toFixed(1),
      '', // À remplir manuellement
      `"${cleanForCSV(label)}"`
    ].join(',');

    csvLines.push(line);

    if ((index + 1) % 100 === 0) {
      console.log(`✅ ${index + 1}/${questionsData.length} questions traitées`);
    }
  });

  // Écriture du fichier CSV
  const outputPath = path.join(__dirname, '../questions_audit.csv');
  fs.writeFileSync(outputPath, csvLines.join('\n'), 'utf-8');

  console.log(`\n✨ Fichier généré: ${outputPath}`);
  console.log(`📈 Statistiques:`);
  console.log(`   - Total questions: ${questionsData.length}`);
  
  const avgQuestionConfidence = questionsData.reduce((sum, q) => 
    sum + calculateQuestionConfidence(q), 0) / questionsData.length;
  const avgOptionsConfidence = questionsData.reduce((sum, q) => 
    sum + calculateOptionsConfidence(q), 0) / questionsData.length;
  const avgCorrectAnswerConfidence = questionsData.reduce((sum, q) => 
    sum + calculateCorrectAnswerConfidence(q), 0) / questionsData.length;

  console.log(`   - Confidence moyenne questions: ${avgQuestionConfidence.toFixed(2)}/10`);
  console.log(`   - Confidence moyenne réponses proposées: ${avgOptionsConfidence.toFixed(2)}/10`);
  console.log(`   - Confidence moyenne réponse vraie: ${avgCorrectAnswerConfidence.toFixed(2)}/10`);

  console.log(`\n💡 Le fichier est prêt. Vous pouvez maintenant remplir les colonnes "Manual" (0-2, 2-5, 5-7, 7-10)`);
}

try {
  main();
} catch (error) {
  console.error(error);
}

