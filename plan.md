# Knowledge Learning Engine IADE - Plan d'Implémentation

## Vision Globale

Passer d'un système de QCM isolés à un système cognitif complet basé sur :
- Triple source de vérité (cours + annales volumes 1&2 + corrections)
- Graphe de concepts sémantique
- Moteur adaptatif avec répétition espacée
- UI multi-mode (Cours / Entraînement / Concours Blanc)

## Phase 0 : Setup Git & Documentation (AVANT TOUT DÉVELOPPEMENT)

### 0.1 Initialisation Repository GitHub

**Actions :**
1. Initialiser le repo Git localement ✅
2. Créer/utiliser le repo distant `IADE` sur GitHub ✅
3. Commit de l'existant (état actuel complet du projet) ✅
4. Push vers GitHub ✅

### 0.2 Création des Documents de Référence Absolus

**Fichier 1 : `plan.md`** (Source de vérité absolue du plan technique)
- Copie exacte de ce document de plan
- Maintenu à jour à chaque modification du plan
- Sert de référence pour toutes les décisions techniques

**Fichier 2 : `tasks.md`** (Source de vérité absolue des tâches)
- Liste structurée de toutes les tâches avec statuts
- Mis à jour après chaque tâche complétée
- Chaque commit référence une tâche : `git commit -m "feat(phase1): 1.1 - baseExtractor.ts complété"`

### 0.3 Règle de Développement

**⚠️ AUCUN DÉVELOPPEMENT ne commence avant que Phase 0 soit complétée**

Workflow strict :
1. Phase 0 terminée → commit + push
2. Avant toute nouvelle phase → vérifier plan.md + tasks.md
3. Pendant développement → mettre à jour tasks.md
4. Après chaque tâche → commit avec référence task
5. Fin de phase → update plan.md si nécessaire + commit

## Phase 1 : Pipeline d'Extraction Intelligent Modulaire

### 1.1 Architecture Pipeline Modulaire

Créer une architecture pluggable avec extraction commune et parsers spécialisés :

**Structure :**
```
iade-app/scripts/pipelines/
├── baseExtractor.ts         # OCR + text cleaning commun (réutilise pdf-processor + ocr-engine)
├── courseParser.ts          # Extraction chapitres → sections → concepts
├── annalesParser.ts         # Extraction questions → réponses → métadonnées
├── correctionParser.ts      # Extraction explications + références croisées
└── pipelineManager.ts       # Orchestration automatique avec dispatch
```

**baseExtractor.ts** :
- Utilise le pipeline OCR existant (`PDFProcessor` + `OCREngine`)
- Nettoie le texte brut (remove artifacts, fix spacing)
- Retourne des blocs de texte structurés par page
- Interface commune : `ExtractedContent { pages: TextBlock[], metadata: {} }`

**courseParser.ts** :
- Patterns de détection : titres (# ##), listes, tableaux
- Extraction de concepts clés (termes techniques en gras/capitalisés)
- Détection de protocoles (listes numérotées avec étapes)
- Détection de calculs (formules avec unités)
- Détection de pathologies (symptômes → diagnostics → traitements)

**annalesParser.ts** :
- Détection automatique QCM vs QROC vs Cas clinique
- Extraction options de réponse (A/B/C/D ou numérotation)
- Association thématique par mots-clés du titre/énoncé

**correctionParser.ts** :
- Matching correction ↔ question (numérotation, proximité)
- Extraction des explications détaillées
- Détection des points clés (•, -, 1., etc.)
- Extraction des références (pages, chapitres mentionnés)

**pipelineManager.ts** :
- Auto-détection du type de PDF (analyse première page + structure)
- Dispatch vers le parser approprié
- Gestion des erreurs et logs détaillés
- Commande : `npm run process:concours -- --file="<pdf>" --output="<json>"`

**Sorties structurées :**

`iade-app/src/data/concours/cours-complet.json` (exemple) :
```json
{
  "source": "Prepaconcoursiade-Complet.pdf",
  "type": "cours",
  "extractedAt": "2025-10-27",
  "chapters": [
    {
      "id": "chap_01",
      "title": "Pharmacologie - Antalgiques",
      "themes": ["pharmacologie", "douleur", "opioïdes"],
      "sections": [
        {
          "id": "sec_01_01",
          "title": "Classification OMS",
          "concepts": [
            {
              "id": "concept_morphine_palier3",
              "term": "Morphine (Palier 3)",
              "definition": "Opioïde fort utilisé pour douleurs intenses...",
              "examples": ["Skenan", "Actiskenan"],
              "relatedConcepts": ["oxycodone", "fentanyl"],
              "difficultyLevel": "intermediate",
              "embedding": null
            }
          ],
          "protocols": [...],
          "calculations": [...]
        }
      ]
    }
  ]
}
```

### 1.2 Enrichissement Sémantique (Optionnel - Phase 1B)

Pour améliorer le matching automatique :

**Fichier : `iade-app/scripts/pipelines/embeddingGenerator.ts`**
- Utilise un modèle local (ex: `@xenova/transformers` pour Node.js)
- Génère des embeddings pour chaque concept et question
- Stocke dans `iade-app/src/data/embeddings/concepts.json` et `questions.json`
- Permet le matching sémantique au-delà des mots-clés

Note : peut être ajouté après la v1 si besoin de meilleure précision.

## Phase 2 : Knowledge Graph Standard & Indexation

### 2.1 Format GraphML / JSON-LD

Adopter un format de graphe interopérable pour analyses avancées et visualisations.

**Fichier : `iade-app/src/data/concours/knowledge-graph.json`** (JSON-LD)

Structure avec nœuds (concepts, questions) et edges (relations) avec poids.

### 2.2 Poids Relationnels & Métriques

**Script : `iade-app/scripts/buildKnowledgeGraph.ts`**

Algorithme :
1. Parse les 3 JSONs (cours, annales V1, V2)
2. Extrait tous concepts et questions
3. Pour chaque question :
   - Match concepts par mots-clés + embeddings (si phase 1.2)
   - Calcule weight = similarité sémantique (0-1)
   - Calcule frequency = nombre d'occurrences du concept
4. Pour chaque concept :
   - Liste les sources (cours + questions)
   - Calcule averageDifficulty des questions associées
   - Détermine masteryLevel (required si >5 questions, recommended si 2-5, optional si <2)
5. Génère le graphe JSON-LD avec poids relationnels

Commande : `npm run build:knowledge-graph`

## Phase 3 : Générateur de Questions Intelligent v2 (Architecture Pluggable)

### 3.1 Architecture Modulaire par Type de Question

**Structure :**
```
iade-app/src/services/generators/
├── baseGenerator.ts          # Interface commune + utils
├── definitionGenerator.ts    # Questions "Quelle est la définition de..."
├── qcmGenerator.ts           # QCM avec distracteurs intelligents
├── qrocGenerator.ts          # Questions réponse ouverte courte
├── caseStudyGenerator.ts     # Cas cliniques complexes
├── calculationGenerator.ts   # Calculs de doses
└── synthesisGenerator.ts     # Questions multi-concepts
```

**Interface commune (`baseGenerator.ts`) :**
- `QuestionInput` : concept, relatedConcepts, difficulty, context, sourceType
- `GeneratedQuestion` : id, type, text, options, correctAnswer, explanation, references, coherenceScore, metadata
- `BaseQuestionGenerator` : abstract class avec méthode generate() et calculateCoherence()

### 3.2 Validation Automatique & Filtrage

**Script : `iade-app/scripts/generateIntelligentQuestions-v2.ts`**

Processus :
1. Charge le knowledge graph
2. Pour chaque concept du graphe :
   - Détermine le type de question approprié
   - Invoque le générateur correspondant
   - Calcule coherenceScore :
     - Si > 0.9 → rejeter (doublon probable)
     - Si < 0.5 → marquer "toValidate"
     - Sinon → accepter
3. Filtre et sauvegarde dans `iade-app/src/data/generatedQuestions-v2.json`

Commande : `npm run generate:questions-v2`

## Phase 4 : UI/UX Multi-Mode (Design Médical)

### 4.1 Layout Unifié & Navigation Persistante

**Composant principal : `iade-app/src/components/Layout/MainLayout.tsx`**

Structure à 3 zones : Header | Left Nav + Main Content + Right Panel

**Palette médicale :**
```typescript
const medicalTheme = {
  primary: {
    blue: "#2563eb",    // Actions principales
    green: "#10b981",   // Succès / Validé
    rose: "#f43f5e",    // Erreur / Critique
  },
  neutral: {
    gray: "#f3f4f6",
    darkGray: "#6b7280",
  }
};
```

Technologies : `shadcn/ui` + `framer-motion`

### 4.2 Mode "Cours" - Révision Thématique

**Composant : `iade-app/src/components/modes/CourseReviewMode.tsx`**

Fonctionnalités :
- Navigation par chapitres/thèmes
- Affichage structuré (concepts, protocoles, calculs, pathologies)
- Mini-carte mentale (visualisation liens graphe)
- Moteur de recherche par concept
- Liens vers questions d'entraînement

### 4.3 Mode "Entraînement" - Questions Progressives

**Composant : `iade-app/src/components/modes/TrainingMode.tsx`** (amélioration existant)

Améliorations :
- Sélection par thème ET difficulté
- Parcours progressif automatique
- Corrections détaillées avec références au cours
- Stats de progression par thème
- Historique des sessions

### 4.4 Mode "Concours Blanc" - Simulation d'Examen

**Composant : `iade-app/src/components/modes/ExamSimulationMode.tsx`**

Fonctionnalités :
- Sélection de difficulté (Volume 1 / Volume 2)
- Session chronométrée
- Mix automatique (60% QCM, 25% QROC, 15% Cas cliniques)
- Mode "examen réel" : pas de retour arrière
- Post-examen : score détaillé, correction, analyse, export PDF

### 4.5 Navigation Inter-Modes

Liens intelligents entre les 3 modes pour fluidité d'apprentissage.

## Phase 5 : Suivi de Progression & Moteur Adaptatif

### 5.1 Service de Progression avec Spaced Repetition

**Fichier : `iade-app/src/services/progressionTracker.ts`**

Structure de données (localStorage) :
- `concepts` : masteryScore, lastSeenAt, timesReviewed, errorRate, timeSpent, nextReviewAt
- `themes` : masteryScore, questionsAnswered, correctRate
- `sessions` : historique complet

**Algorithme de répétition espacée (Ebbinghaus modifié) :**
```typescript
function calculateNextReview(concept, difficulty): Date {
  const baseDelay = { base: 1, intermediate: 2, advanced: 3 }[difficulty];
  const errorFactor = 1 + concept.errorRate;
  const masteryFactor = concept.masteryScore / 100;
  const delayDays = baseDelay * errorFactor * (2 - masteryFactor);
  return addDays(new Date(), Math.max(1, Math.round(delayDays)));
}
```

**Méthodes :**
- `recordAnswer(conceptId, isCorrect, timeSpent)`
- `getConceptsToReview()`
- `getRecommendations()`
- `getWeakConcepts()`

### 5.2 Dashboard de Progression

**Composant : `iade-app/src/components/dashboard/ProgressDashboard.tsx`**

4 sections :
1. **Vue Globale** : cercle de maîtrise, taux complétion, streak
2. **Analyse Thématique** : radar chart, concepts à revoir, top 5 maîtrisés
3. **Historique** : graphique évolution, sessions récentes, temps total
4. **Recommandations Actives** : concepts à revoir aujourd'hui, session suggérée, concepts critiques

Charts : `recharts`

### 5.3 Service de Recommandation

**Fichier : `iade-app/src/services/recommendationEngine.ts`**

Logique :
- Analyse le `UserProgress`
- Identifie les gaps
- Priorise selon : nextReviewAt dépassé, masteryScore faible, questions ratées, thèmes non pratiqués
- Retourne liste ordonnée avec priorités

## Phase Bonus : Intent Engine (Préparation V3)

**Fichier : `iade-app/src/services/intentEngine.ts`** (optionnel)

Tracking comportemental :
- Temps passé par type de contenu
- Préférence de difficulté
- Patterns de révision
- Style d'apprentissage

Adaptations automatiques selon profil utilisateur.

Implémentation future : après Phase 5 stabilisée.

## Architecture Finale

```
iade-app/
├── raw-materials/Concours IADE/
│   ├── Prepaconcoursiade-Complet.pdf
│   ├── annalescorrigées-Volume-1.pdf
│   └── annalescorrigées-Volume-2.pdf
├── scripts/
│   ├── pipelines/ [NOUVEAU]
│   │   ├── baseExtractor.ts
│   │   ├── courseParser.ts
│   │   ├── annalesParser.ts
│   │   ├── correctionParser.ts
│   │   ├── pipelineManager.ts
│   │   └── embeddingGenerator.ts [OPTIONNEL]
│   ├── buildKnowledgeGraph.ts [NOUVEAU]
│   └── generateIntelligentQuestions-v2.ts [NOUVEAU]
├── src/
│   ├── data/
│   │   ├── concours/ [NOUVEAU]
│   │   │   ├── cours-complet.json
│   │   │   ├── annales-volume-1.json
│   │   │   ├── annales-volume-2.json
│   │   │   └── knowledge-graph.json [JSON-LD]
│   │   ├── embeddings/ [OPTIONNEL]
│   │   └── generatedQuestions-v2.json [NOUVEAU]
│   ├── components/
│   │   ├── Layout/MainLayout.tsx [NOUVEAU]
│   │   ├── modes/ [NOUVEAU]
│   │   │   ├── CourseReviewMode.tsx
│   │   │   ├── TrainingMode.tsx [AMÉLIORATION]
│   │   │   └── ExamSimulationMode.tsx
│   │   └── dashboard/ProgressDashboard.tsx [NOUVEAU]
│   ├── services/
│   │   ├── generators/ [NOUVEAU]
│   │   │   ├── baseGenerator.ts
│   │   │   ├── definitionGenerator.ts
│   │   │   ├── qcmGenerator.ts
│   │   │   ├── qrocGenerator.ts
│   │   │   ├── caseStudyGenerator.ts
│   │   │   ├── calculationGenerator.ts
│   │   │   └── synthesisGenerator.ts
│   │   ├── progressionTracker.ts [NOUVEAU]
│   │   ├── recommendationEngine.ts [NOUVEAU]
│   │   ├── knowledgeGraphService.ts [NOUVEAU]
│   │   └── intentEngine.ts [BONUS - V3]
│   └── styles/medicalTheme.ts [NOUVEAU]
└── package.json
    scripts:
      "process:concours": "tsx scripts/pipelines/pipelineManager.ts"
      "build:knowledge-graph": "tsx scripts/buildKnowledgeGraph.ts"
      "generate:questions-v2": "tsx scripts/generateIntelligentQuestions-v2.ts"
```

## Ordre d'Implémentation

0. **Phase 0** - Setup Git + Documentation (15min) ⚠️ PRIORITÉ ABSOLUE ✅
1. **Phase 1** - Pipeline extraction modulaire (2-3h)
2. **Phase 2** - Knowledge Graph JSON-LD (1-2h)
3. **Phase 3** - Générateurs pluggables (2h)
4. **Phase 4.1** - Layout + Mode Cours (2h)
5. **Phase 5** - Progression tracker + Dashboard (2h)
6. **Phase 4.2** - Mode Entraînement amélioré (1h)
7. **Phase 4.3** - Mode Concours Blanc (2h)
8. **Phase 1B** - Embeddings (optionnel, 1h)
9. **Phase Bonus** - Intent Engine (optionnel, V3)

**Total estimé : 12-15h** (sans optionnels) + 15min setup

## Tests & Validation

- Tests unitaires pour chaque parser
- Validation du graphe (nœuds, edges cohérents)
- Tests UI des 3 modes
- Tests de régression sur questions existantes
- Validation médicale des corrections générées (manuel)
- Chaque phase testée avant commit

