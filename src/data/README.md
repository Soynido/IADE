# 📚 IADE Data Directory - Documentation

**Dernière mise à jour** : 5 Novembre 2025  
**Statut** : ✅ Production Ready

---

## 📊 Vue d'Ensemble

Ce dossier contient **toutes les données** utilisées par l'application IADE :
- **300 questions IA GOLD** (Mistral + BioBERT)
- **Classification pédagogique** (révision/entraînement/concours)
- **150 concepts de référence** (groundTruth)
- **56 modules de cours** (Markdown)

---

## 📁 Structure

```
src/data/
│
├── compiledQuestions.json          📦 FICHIER PRINCIPAL (300 Q)
│                                       ← Utilisé par React (import direct)
│                                       ← Source: _snapshots/2025-11-05/
│
├── _snapshots/                     📘 SOURCES GOLD (NE JAMAIS MODIFIER)
│   └── 2025-11-05/
│       ├── 300_AI_GOLD_STANDARD.json          (fusion des 5 exams)
│       ├── exam_sim_1_fixed_explained.json    (60 Q + explications)
│       ├── exam_sim_2_fixed_explained.json    (60 Q + explications)
│       ├── exam_sim_3_fixed_explained.json    (60 Q + explications)
│       ├── exam_sim_4_fixed_explained.json    (60 Q + explications)
│       └── exam_sim_5_fixed_explained.json    (60 Q + explications)
│
├── exams_multimode_real/           🎯 CLASSIFICATION PÉDAGOGIQUE
│   ├── revision/
│   │   └── revision_ai_validated_20251105.json       (189 Q)
│   ├── entrainement/
│   │   └── entrainement_ai_validated_20251105.json    (81 Q)
│   ├── concours_blanc/
│   │   └── concours_blanc_ai_validated_20251105.json  (30 Q)
│   └── exams_master.json                             (métadonnées)
│
├── groundTruth.json                📚 RÉFÉRENCE (150 concepts IADE)
├── modulesIndex.json               🔧 INDEX DES MODULES
├── modulesDependencies.json        🔧 DÉPENDANCES ENTRE MODULES
│
├── modules/                        📄 COURS EN MARKDOWN (56 fichiers)
│   ├── module_01_revision_neuro...md
│   ├── module_02_anatomie_physio...md
│   └── ...
│
└── 07_archives/                    🗄️ ARCHIVES HISTORIQUES
    └── legacy/
        ├── concours_old/                     (25 fichiers consolidations)
        ├── generatedQuestions_838.json       (backup 838 Q)
        ├── groundTruth-50concepts.json       (ancienne version)
        └── groundTruth.backup.json           (backup)
```

---

## 🎯 Fichier Principal : compiledQuestions.json

### Utilisation dans React

```typescript
import compiledQuestions from '../data/compiledQuestions.json';

// compiledQuestions est un Array de 300 questions
const questions = compiledQuestions; // Array<Question>
```

### Structure d'une Question

```json
{
  "id": "sim1_q1",
  "text": "Question text...",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "type": "qcm",
  "difficulty": "easy",
  "domain": "Général",
  "explanation": "Explication détaillée...",
  "text_hash": "84017c996f877608305fb57f718e7806",
  "mode": "revision",
  "source": "MISTRAL_BIOBERT_V1",
  "validated_biobert": true,
  "ai_generated": true,
  "quality_tier": "gold",
  "generated_at": "2025-11-05T08:49:58.610205"
}
```

### Métadonnées Garanties

Chaque question contient :
- ✅ `mode` : "revision" | "entrainement" | "concours_blanc"
- ✅ `source` : "MISTRAL_BIOBERT_V1" (traçabilité IA)
- ✅ `quality_tier` : "gold" (niveau de qualité)
- ✅ `validated_biobert` : true (validation sémantique)
- ✅ `ai_generated` : true (générée par IA)
- ✅ `text_hash` : hash BioBERT pour déduplication

---

## 📘 Sources Gold (_snapshots/)

### 🔒 Règle Absolue

**NE JAMAIS MODIFIER** les fichiers dans `_snapshots/`

Ce sont les **sources de vérité** validées par IA.

### Fichiers

| Fichier | Questions | Explications | Hash | Génération |
|---------|-----------|--------------|------|------------|
| `exam_sim_1_fixed_explained.json` | 60 | ✅ 60 | ✅ | Mistral + BioBERT |
| `exam_sim_2_fixed_explained.json` | 60 | ✅ 60 | ✅ | Mistral + BioBERT |
| `exam_sim_3_fixed_explained.json` | 60 | ✅ 60 | ✅ | Mistral + BioBERT |
| `exam_sim_4_fixed_explained.json` | 60 | ✅ 60 | ✅ | Mistral + BioBERT |
| `exam_sim_5_fixed_explained.json` | 60 | ✅ 60 | ✅ | Mistral + BioBERT |
| `300_AI_GOLD_STANDARD.json` | 300 | ✅ | ✅ | Fusion des 5 exams |

### Restauration (si nécessaire)

Si `compiledQuestions.json` est corrompu :

```bash
cp src/data/_snapshots/2025-11-05/300_AI_GOLD_STANDARD.json \
   src/data/compiledQuestions.json
```

---

## 🎯 Classification Pédagogique (exams_multimode_real/)

### Distribution

| Mode | Questions | % | Difficulté | Objectif Pédagogique |
|------|-----------|---|------------|---------------------|
| **Révision** | 189 | 63% | easy/base | Mémorisation concepts |
| **Entraînement** | 81 | 27% | intermediate | Application clinique |
| **Concours Blanc** | 30 | 10% | hard/cas | Simulation réelle |
| **TOTAL** | **300** | **100%** | - | - |

### Utilisation

Pour charger uniquement les questions d'un mode :

```typescript
import revisionQuestions from '../data/exams_multimode_real/revision/revision_ai_validated_20251105.json';
// 189 questions de révision
```

### Fichier Master

`exams_master.json` contient les métadonnées de la classification :
- Distribution par mode
- Statistiques par difficulté
- Timestamps de génération

---

## 📚 Référence (groundTruth.json)

### Contenu

150 concepts IADE avec :
- Nom du concept
- Définition
- Domaine associé
- Questions liées (à implémenter)

### Utilisation

```typescript
import groundTruth from '../data/groundTruth.json';
// Array de concepts pour indexation et recherche
```

---

## 📄 Modules de Cours (modules/)

### Contenu

56 fichiers Markdown issus de :
- PDFs de cours
- Annales corrigées
- Sujets de concours

### Format

Nommage : `module_XX_titre_source.md`

Exemples :
- `module_01_revision_neuro_support_prepa_iade_2025.md`
- `module_05_1_les_antalgiques_c_doudet_2025_ifcs.md`

### Utilisation Future

Lier les questions aux modules :

```json
{
  "questionId": "sim1_q1",
  "related_module": "module_05_1_les_antalgiques",
  "section": "Classification des antibiotiques"
}
```

---

## 🗄️ Archives (07_archives/legacy/)

### Contenu

Fichiers historiques archivés mais conservés :
- **concours_old/** : 25 fichiers de consolidations intermédiaires
- **generatedQuestions_838.json** : Backup de 838 questions
- **groundTruth*.json** : Anciennes versions

### Utilisation

Ces fichiers peuvent servir pour :
- Analyse historique
- Récupération d'anciennes versions
- Audit de l'évolution du dataset

**Ne sont PAS utilisés par le front.**

---

## 🔄 Workflow de Génération

### Pipeline Actuel

```
1. Sources (PDFs)
   ↓
2. Génération IA (Mistral)
   scripts/ai_exam/smart_exam_engine.py
   ↓
3. Validation (BioBERT)
   scripts/ai_generation/embedding_service.py
   ↓
4. Fixation & Explications
   scripts/ai_exam/generate_explanations_from_annales.py
   ↓
5. Snapshot
   _snapshots/YYYY-MM-DD/exam_sim_*_fixed_explained.json
   ↓
6. Classification
   scripts/ai_exam/classify_ai_questions_by_mode.py
   ↓
7. Compilation
   exams_multimode_real/ → compiledQuestions.json
   ↓
8. Front React
   import compiledQuestions.json
```

### Commandes Clés

```bash
# Générer 5 nouveaux examens (300 Q)
python3 scripts/ai_exam/smart_exam_engine.py --count 5

# Classifier les questions par mode
python3 scripts/ai_exam/classify_ai_questions_by_mode.py

# Créer compiledQuestions.json
jq -s '[.[].questions] | add' \
  _snapshots/2025-11-05/exam_sim_*_fixed_explained.json \
  > compiledQuestions.json
```

---

## ⚠️ Règles Importantes

### ✅ À FAIRE

1. **Toujours versionner** `compiledQuestions.json` avant modification
2. **Tester le build** après modification des données
3. **Backup dans _snapshots/** avant nouvelle génération
4. **Vérifier les métadonnées** (`quality_tier`, `source`, etc.)

### ❌ NE JAMAIS FAIRE

1. ❌ Modifier `_snapshots/` (source de vérité)
2. ❌ Supprimer `compiledQuestions.json` sans backup
3. ❌ Mélanger mock + IA dans un même fichier
4. ❌ Déployer sans `quality_tier: "gold"`

---

## 🧪 Vérification de l'Intégrité

### Commandes de Vérification

```bash
# Vérifier que compiledQuestions.json est valide
jq 'length' src/data/compiledQuestions.json
# → Doit afficher: 300

# Vérifier la présence de métadonnées
jq '.[0] | {mode, source, quality_tier, validated_biobert}' \
  src/data/compiledQuestions.json
# → Doit avoir toutes les clés

# Vérifier l'intégrité de _snapshots
ls -lh src/data/_snapshots/2025-11-05/*.json
# → Doit montrer 6 fichiers
```

---

## 🚀 Prochaines Évolutions

### Court Terme

1. **Lier questions → modules**
   - Ajouter `related_module_id` à chaque question
   - Permettre "Voir le cours" depuis une question

2. **Indexation par domaine**
   - Créer `domainIndex.json`
   - Faciliter le filtrage par thème

### Moyen Terme

3. **Générer + de questions**
   - Relancer `smart_exam_engine.py`
   - Objectif : 500-1000 questions

4. **SQLite pour performance**
   - Migrer vers une base SQLite
   - Requêtes plus rapides

### Long Terme

5. **Révision espacée (Spaced Repetition)**
   - Algorithme SM-2 ou Anki
   - Basé sur la performance utilisateur

6. **Génération contextuelle**
   - Questions adaptées au profil utilisateur
   - Génération à la volée

---

## 📊 Statistiques

### Questions par Mode

| Mode | Questions | % | Fichier |
|------|-----------|---|---------|
| Révision | 189 | 63% | `exams_multimode_real/revision/` |
| Entraînement | 81 | 27% | `exams_multimode_real/entrainement/` |
| Concours Blanc | 30 | 10% | `exams_multimode_real/concours_blanc/` |
| **TOTAL** | **300** | **100%** | `compiledQuestions.json` |

### Questions par Difficulté

| Difficulté | Questions | % |
|------------|-----------|---|
| Easy | 179 | 60% |
| Medium | 73 | 24% |
| Hard | 25 | 8% |
| Base | 10 | 3% |
| Intermediate | 8 | 3% |
| Advanced | 5 | 2% |

---

## 🔑 Fichiers Critiques

### Ne PAS Supprimer

1. `compiledQuestions.json` ← Front React
2. `_snapshots/2025-11-05/*` ← Source de vérité
3. `exams_multimode_real/*` ← Classification
4. `groundTruth.json` ← Référence concepts
5. `modules/` ← Cours Markdown
6. `modulesIndex.json` ← Index modules
7. `modulesDependencies.json` ← Dépendances

### Peuvent Être Supprimés (si besoin d'espace)

- `07_archives/legacy/*` (fichiers historiques)

---

## 🛠️ Maintenance

### Mise à Jour de compiledQuestions.json

Quand de nouvelles questions sont générées :

```bash
# 1. Sauvegarder l'ancien
cp compiledQuestions.json compiledQuestions_backup_$(date +%Y%m%d).json

# 2. Fusionner depuis _snapshots
jq -s '[.[].questions] | add' \
  _snapshots/2025-11-05/exam_sim_*_fixed_explained.json \
  > compiledQuestions.json

# 3. Vérifier
jq 'length' compiledQuestions.json
# → Doit afficher: 300 (ou plus si nouvelles questions)

# 4. Build et test
npm run build
```

### Ajout de Nouvelles Questions

```bash
# 1. Générer avec IA
python3 scripts/ai_exam/smart_exam_engine.py --count 5

# 2. Les nouveaux examens seront dans:
#    src/data/exam_simulations/

# 3. Copier vers _snapshots avec la date
mkdir -p _snapshots/$(date +%Y-%m-%d)
cp src/data/exam_simulations/exam_sim_*_fixed_explained.json \
   _snapshots/$(date +%Y-%m-%d)/

# 4. Reclassifier
python3 scripts/ai_exam/classify_ai_questions_by_mode.py

# 5. Mettre à jour compiledQuestions.json
```

---

## 📖 Documentation Complémentaire

- **Audit complet** : `/IADE/DATA_DIRECTORY_AUDIT.md`
- **Migration workspace** : `/IADE/MIGRATION_COMPLETE_REPORT.md`
- **Rapport audit repo** : `/IADE/REPO_AUDIT_COMPLET.md`

---

## ✅ Garanties de Qualité

### Toutes les 300 Questions Ont

- ✅ Été générées par **Mistral 7B**
- ✅ Été validées par **BioBERT**
- ✅ Des **explications détaillées**
- ✅ Un **hash de déduplication**
- ✅ Une **classification pédagogique**
- ✅ Des **métadonnées complètes**

### Processus de Validation

1. Génération via Mistral (prompt médical IADE)
2. Validation sémantique BioBERT (score > 0.55)
3. Fixation et nettoyage (remove duplicates)
4. Ajout d'explications (Mistral)
5. Hash et métadonnées
6. Classification par mode
7. Compilation finale

---

## 🎊 Résultat

**Dataset production-ready** avec :
- ✅ 300 questions validées IA
- ✅ Classification pédagogique
- ✅ Métadonnées complètes
- ✅ Structure propre et maintenable
- ✅ Workflow reproductible

---

*Documentation générée automatiquement - 5 Novembre 2025*

