# Architecture - Projet IADE

Documentation technique de l'architecture du système IADE.

## 🏗️ Vue d'Ensemble

```
IADE/
├── iade-app/                    # Application React + TypeScript
│   ├── src/
│   │   ├── components/          # Composants UI
│   │   │   ├── CourseReviewMode.tsx
│   │   │   ├── ExamSimulationMode.tsx
│   │   │   ├── ProgressDashboard.tsx
│   │   │   └── TrainingMode.tsx
│   │   ├── services/            # Logique métier
│   │   │   ├── spacedRepetitionEngine.ts
│   │   │   ├── interleavingEngine.ts
│   │   │   ├── successPredictionEngine.ts
│   │   │   └── achievementsEngine.ts
│   │   └── data/                # Données
│   │       ├── mock/questions.json
│   │       └── concours/knowledge-graph.json
│   └── scripts/                 # Scripts génération
│       ├── pipelines/           # Extraction PDF
│       └── generators/          # Générateurs questions
└── .reasoning/                  # Reasoning Layer V3
    ├── traces/                  # Events append-only
    ├── adrs/                    # Décisions architecturales
    ├── patterns.json            # Patterns détectés
    └── forecasts.json           # Prédictions
```

## 🎯 Composants Principaux

### 1. Frontend (React + TypeScript)

#### Modes UI
- **CourseReviewMode**: Révision par modules (13 modules, 3 parcours)
- **TrainingMode**: Entraînement adaptatif avec spaced repetition
- **ExamSimulationMode**: Concours blanc avec timer 90 min

#### Services Cognitifs
- **SpacedRepetitionEngine**: Ebbinghaus + SM-2 algorithm
- **InterleavingEngine**: Mélange optimal des questions
- **SuccessPredictionEngine**: Prédiction probabilité réussite

### 2. Backend Services

#### Extraction Données
```typescript
// Pipeline extraction PDF
PDFExtractor → OCREngine → Parser → Validator → JSON
```

#### Générateurs Questions (Pluggable)
```typescript
BaseQuestionGenerator (abstract)
├── DefinitionGenerator
├── QCMGenerator
├── QROCGenerator (à venir)
└── CaseStudyGenerator (à venir)
```

### 3. Knowledge Graph

```json
{
  "nodes": [
    {"type": "Theme", "label": "Neurologie"},
    {"type": "Concept", "label": "Score de Glasgow"},
    {"type": "Question", "id": "q1"}
  ],
  "edges": [
    {"source": "q1", "target": "theme_neurologie", "relation": "BELONGS_TO"}
  ]
}
```

### 4. Reasoning Layer V3

#### Composants
- **Traces**: Events append-only (342 events)
- **ADRs**: Décisions architecturales (4 ADRs)
- **Patterns**: Détection automatique (3 patterns)
- **Forecasts**: Prédictions (3 forecasts)

#### Sécurité
- RSA-2048 signing
- Integrity chain verification
- Commit policy (reasoning/auto branch)

## 🔄 Flux de Données

### 1. Extraction Questions
```
PDF → OCR → Parser → Validation → questions.json → Knowledge Graph
```

### 2. Session Entraînement
```
User → QuestionSelector → SpacedRepetition → InterleavingEngine → UI
                                ↓
                        UpdateSchedule → LocalStorage
```

### 3. Prédiction Réussite
```
UserProfile → SuccessPredictionEngine → Factors Analysis → Probability
                                              ↓
                                    Recommendations → Dashboard
```

## 🧠 Algorithmes Cognitifs

### Spaced Repetition (SM-2)
```typescript
EF_new = EF_old + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
Interval_new = Interval_old * EF_new
```

Intervalles Ebbinghaus: 1h, 1j, 3j, 7j, 14j, 30j, 60j, 90j

### Success Prediction
```typescript
baseScore = 50
+ avgScore factor (max +30)
+ streak bonus (max +10)
+ consistency (max +5)
+ progression trend (max +10)
= probability (0-100%)
```

## 📊 Performance

### Build
- **Size**: 388KB (optimisé)
- **Time**: 1.63s
- **Chunks**: 2 (index.js + index.css)

### Runtime
- **Initial load**: < 2s
- **Question render**: < 50ms
- **Knowledge Graph query**: < 100ms

## 🔐 Sécurité

### Reasoning Layer
- Private key: `.reasoning/keys/private.pem` (excluded .gitignore)
- Integrity snapshots: SHA-256 checksums
- Tamper detection: Enabled

### Données Utilisateur
- LocalStorage: Encrypted profiles
- No server-side storage (privacy-first)

## 🚀 Déploiement

### Build Production
```bash
cd iade-app
npm run build
# → dist/ (388KB)
```

### Vercel
```bash
vercel --prod
# → https://iade-*.vercel.app
```

## 📈 Scalabilité

### Générateurs Pluggables
```typescript
// Ajouter nouveau générateur
class NewGenerator extends BaseQuestionGenerator {
  async generate(context) {
    // Implementation
  }
}

orchestrator.registerGenerator(new NewGenerator());
```

### Knowledge Graph
- Extensible: Ajout nouveaux types de noeuds
- Performant: Indexation par type + thème
- Scalable: 100+ noeuds, 500+ edges

## 🧪 Tests (à venir)

### Coverage Target
- Générateurs: > 70%
- Services cognitifs: > 80%
- Knowledge Graph: > 70%

### Stack
- Vitest (unit tests)
- Playwright (E2E)
- Lighthouse (performance)

---

Pour plus de détails:
- `CHANGELOG.md` - Historique des changements
- `README.md` - Guide utilisateur
- `.reasoning/adrs/` - Décisions architecturales détaillées

