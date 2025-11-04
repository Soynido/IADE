/**
 * Préparation Questions pour Amélioration IA Manuelle (Chat)
 * Cycle IADE-3 - Phase 3 Alternative
 * 
 * Extrait et formate les questions pour amélioration via chat IA
 */

import * as fs from 'fs';
import * as path from 'path';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  theme: string;
  difficulty: string;
  confidence: number;
}

async function prepareQuestionsForManualIA() {
  console.log('\n📋 PRÉPARATION QUESTIONS POUR IA CHAT\n');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Charger questions consolidées
  const inputPath = path.join(process.cwd(), 'src/data/concours/ALL-RAW-CONSOLIDATED.json');
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  const allQuestions: Question[] = data.questions || [];

  console.log(`📚 ${allQuestions.length} questions chargées\n`);

  // Sélectionner top 30 par confiance (pour commencer)
  const sorted = allQuestions
    .filter(q => q.text && q.text.length > 20)
    .sort((a, b) => b.confidence - a.confidence);

  const batches = [
    sorted.slice(0, 10),   // Batch 1: 10 meilleures
    sorted.slice(10, 20),  // Batch 2: 10 suivantes
    sorted.slice(20, 30),  // Batch 3: 10 suivantes
  ];

  // Créer prompts pour chaque batch
  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const batchNum = i + 1;

    console.log(`📝 Création Batch ${batchNum} (${batch.length} questions)...`);

    // Format JSON minimal pour prompt
    const questionsForPrompt = batch.map((q, idx) => ({
      num: idx + 1,
      text: q.text,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      theme: q.theme,
      difficulty: q.difficulty
    }));

    // Créer prompt
    const prompt = createPrompt(questionsForPrompt, batchNum);

    // Sauvegarder prompt
    const promptPath = path.join(process.cwd(), `PROMPT_BATCH_${batchNum}.md`);
    fs.writeFileSync(promptPath, prompt, 'utf-8');

    console.log(`  ✅ Sauvegardé: PROMPT_BATCH_${batchNum}.md`);
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('\n🎯 PROMPTS CRÉÉS - PROCHAINES ÉTAPES:\n');
  console.log('1. Ouvrir PROMPT_BATCH_1.md');
  console.log('2. Copier tout le contenu');
  console.log('3. Coller dans ce chat');
  console.log('4. L\'IA analysera et améliorera les 10 questions');
  console.log('5. Copier la réponse JSON dans BATCH_1_IMPROVED.json');
  console.log('6. Répéter pour BATCH_2 et BATCH_3\n');
  console.log('═══════════════════════════════════════════════════════════\n');
}

function createPrompt(questions: any[], batchNum: number): string {
  return `# 🎯 AMÉLIORATION QUESTIONS IADE - Batch ${batchNum}

**Mission**: Tu es un expert en pédagogie médicale spécialisé dans les concours IADE (Infirmier Anesthésiste Diplômé d'État).

**Objectif**: Transformer ces 10 questions brutes en questions **brillantes** de concours.

═══════════════════════════════════════════════════════════
## CRITÈRES D'UNE QUESTION BRILLANTE
═══════════════════════════════════════════════════════════

### 1. TEXTE (Question)
- ✅ Clair, précis, sans artefacts OCR
- ✅ Contexte médical complet
- ✅ Question bien formulée avec point d'interrogation
- ✅ Longueur: 30-200 caractères

### 2. OPTIONS (Réponses)
- ✅ 4 options distinctes et non ambiguës
- ✅ 1 seule réponse correcte évidente
- ✅ 3 distracteurs plausibles mais incorrects
- ❌ Pas de "Toutes les réponses" ou "Aucune réponse"

### 3. EXPLICATION
- ✅ Détaillée: **150-300 caractères minimum**
- ✅ Contexte clinique précis
- ✅ Références physiologiques/pharmacologiques
- ✅ Valeur pédagogique élevée
- ❌ **JAMAIS** générique ("Cette notion est essentielle...")

### 4. MÉTADONNÉES
- ✅ Thème précis: Pharmacologie, Neurologie, Réanimation, Urgences, etc.
- ✅ Difficulté réaliste: base, intermediate, advanced

═══════════════════════════════════════════════════════════
## EXEMPLE DE TRANSFORMATION
═══════════════════════════════════════════════════════════

### AVANT (Brut) ❌
\`\`\`json
{
  "text": "Quelle est la définition correcte de Somatosensitif\\" ?",
  "options": [
    "A alpha (I) et A gamma (II)",
    "Mécanisme d'inhibition",
    "A alpha (I), A beta ( II)",
    "Processus d'activation"
  ],
  "correctAnswer": 0,
  "explanation": "La réponse correcte est: A alpha (I) et A gamma (II). Cette notion est essentielle.",
  "theme": "Général"
}
\`\`\`

### APRÈS (Brillant) ✅
\`\`\`json
{
  "text": "Quelles sont les fibres nerveuses impliquées dans la transmission somatosensorielle ?",
  "options": [
    "Fibres A alpha (groupe I) et A gamma (groupe II) - transmission proprioceptive rapide",
    "Fibres A delta et C uniquement - transmission nociceptive lente",
    "Fibres B - transmission autonome du système nerveux végétatif",
    "Fibres motrices efférentes uniquement - innervation musculaire"
  ],
  "correctAnswer": 0,
  "explanation": "Les fibres somatosensorielles comprennent les fibres A alpha (groupe I, diamètre 12-20µm, vitesse 70-120 m/s) qui transmettent la proprioception et le toucher discriminatif, et les fibres A gamma (groupe II, diamètre 4-12µm, vitesse 30-70 m/s) qui innervent les fuseaux neuromusculaires. En anesthésie locorégionale, leur bloc différentiel explique la perte progressive de sensibilités lors d'une rachianesthésie.",
  "theme": "Neurologie",
  "difficulty": "intermediate",
  "themes": ["Neurologie", "Physiologie", "Anesthésie"]
}
\`\`\`

**Améliorations** :
- ✅ Texte reformulé clairement
- ✅ Options complètes et contextualisées
- ✅ Explication détaillée (250+ chars) avec valeurs précises
- ✅ Thème précis + difficulté adaptée

═══════════════════════════════════════════════════════════
## QUESTIONS À AMÉLIORER (Batch ${batchNum})
═══════════════════════════════════════════════════════════

${JSON.stringify(questions, null, 2)}

═══════════════════════════════════════════════════════════
## FORMAT DE RÉPONSE
═══════════════════════════════════════════════════════════

Réponds avec un JSON valide contenant les 10 questions améliorées :

\`\`\`json
[
  {
    "num": 1,
    "text": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": 0,
    "explanation": "...",
    "theme": "...",
    "difficulty": "base|intermediate|advanced",
    "themes": ["...", "..."]
  },
  ...
]
\`\`\`

═══════════════════════════════════════════════════════════
## RÈGLES IMPORTANTES
═══════════════════════════════════════════════════════════

✅ **FAIRE** :
- Reformuler pour clarté maximale
- Ajouter contexte clinique pertinent
- Expliquer le "pourquoi" médical
- Utiliser terminologie IADE précise
- Donner valeurs/normes si pertinent
- Explication minimum 150 caractères

❌ **NE PAS FAIRE** :
- Garder artefacts OCR
- Laisser texte vague/incomplet
- Utiliser explications génériques
- Créer options ambiguës
- Oublier le contexte clinique

═══════════════════════════════════════════════════════════

🎯 **À TOI ! Transforme ces 10 questions en questions brillantes !**
`;
}

prepareQuestionsForManualIA().catch(console.error);

