# 🧩 Pipeline Q/A Complet - Guide d'utilisation

## 📋 Vue d'ensemble

Ce document décrit le **pipeline complet de gestion des questions/réponses** implémenté pour le projet EQOW IADE. Le pipeline permet d'extraire, aligner, valider et fusionner les paires Question/Réponse depuis les annales PDF vers le système de génération IA.

---

## 🎯 Objectifs

Le pipeline gère désormais les réponses à **tous les niveaux** :

| Étape | Gestion des Réponses | Détails |
|-------|---------------------|---------|
| **Extraction OCR** | ✅ Oui | Détection intelligente des blocs QUESTIONS/RÉPONSES |
| **Alignement Q↔R** | ✅ Oui | Association automatique question → réponse |
| **Fusion GroundTruth** | ✅ Oui | Enrichissement des concepts avec paires Q/A réelles |
| **Génération IA** | ✅ Oui | Modèle produit question + réponse + explication |
| **Validation IA** | ✅ Oui | Validation sémantique bilatérale Q+R+cohérence |

---

## 🛠️ Scripts créés

### 1. `alignQuestionsAnswers.ts`

**Rôle** : Détection et alignement intelligent des blocs QUESTIONS/RÉPONSES dans les PDFs OCR.

**Fonctionnalités** :
- Détection robuste des blocs "QUESTIONS DE X À Y" et "RÉPONSES DE X À Y"
- Normalisation OCR avancée (gestion de "I" vs "1", "2O" vs "20", etc.)
- Parsing intelligent par numéros de questions
- Validation de cohérence et statistiques de couverture

**Utilisation** :
```bash
cd iade-app
npx tsx scripts/pipelines/alignQuestionsAnswers.ts
```

**Sortie** : `src/data/concours/annales-aligned.json`

---

### 2. `improveAlignmentFromRaw.ts`

**Rôle** : Amélioration de l'alignement Q/A depuis les fichiers `*-raw.json` existants.

**Fonctionnalités** :
- Lecture des fichiers `annalescorrigées-Volume-X-raw.json`
- Extraction des réponses depuis les fichiers OCR bruts
- Découpage intelligent sur les marqueurs de réponses (@, ©, ®, I), etc.)
- Calcul de confiance (high/medium/low) par réponse

**Utilisation** :
```bash
cd iade-app
npx tsx scripts/pipelines/improveAlignmentFromRaw.ts
```

**Sortie** : `src/data/concours/annales-aligned.json`

**Statistiques obtenues** :
- 10 questions extraites
- 7 réponses alignées (70% de couverture)
- 6 avec confiance haute, 1 moyenne

---

### 3. `mergeToGroundTruth.ts`

**Rôle** : Fusion intelligente des paires Q/A dans `groundTruth.json`.

**Fonctionnalités** :
- Matching automatique Q/A → Concepts existants (par mots-clés et contexte)
- Création de nouveaux concepts pour les Q/A orphelines
- Enrichissement avec champ `qa_pairs` contenant les paires réelles
- Sauvegarde automatique (`groundTruth.backup.json`)

**Utilisation** :
```bash
cd iade-app
npx tsx scripts/pipelines/mergeToGroundTruth.ts
```

**Résultats** :
- 2 concepts existants enrichis
- 8 nouveaux concepts créés
- Total : 58 concepts dans `groundTruth.json`

---

### 4. `question_validator.py` (modifié)

**Rôle** : Validation sémantique bilatérale Question + Réponse.

**Nouvelles fonctionnalités** :
- **Paramètre `with_answers`** : Active la validation Q+R
- **3 scores sémantiques** :
  - `semantic_similarity_q` : Question vs Concept
  - `semantic_similarity_a` : Réponse/Explication vs Concept
  - `q_to_a_coherence` : Cohérence Question ↔ Réponse
- **Pondération adaptative** : Poids ajustés selon le mode avec/sans réponses

**Scores de validation** :

#### Mode standard (sans `--with-answers`) :
```python
overall_score = (
    semantic_similarity_q * 0.40 +
    keywords_coverage * 0.25 +
    choices_quality * 0.20 +
    format_quality * 0.15
)
```

#### Mode avec `--with-answers` :
```python
overall_score = (
    semantic_similarity_q * 0.25 +
    semantic_similarity_a * 0.25 +
    q_to_a_coherence * 0.15 +
    keywords_coverage * 0.15 +
    choices_quality * 0.10 +
    format_quality * 0.10
)
```

---

### 5. `validate_batch.py` (modifié)

**Rôle** : Validation de batch avec support du flag `--with-answers`.

**Nouvelles options CLI** :
```bash
cd iade-app
python scripts/ai_generation/validate_batch.py --help
```

**Arguments** :
- `--generated` : Chemin questions générées (défaut: `src/data/questions-generated.json`)
- `--ground-truth` : Chemin groundTruth (défaut: `src/data/groundTruth.json`)
- `--output` : Chemin sortie validées (défaut: `src/data/questions-validated.json`)
- `--with-answers` : Active validation Q+R (défaut: désactivé)

**Exemples d'utilisation** :

```bash
# Validation standard (questions uniquement)
python scripts/ai_generation/validate_batch.py

# Validation complète avec réponses
python scripts/ai_generation/validate_batch.py --with-answers

# Validation personnalisée
python scripts/ai_generation/validate_batch.py \
  --generated src/data/my-questions.json \
  --ground-truth src/data/groundTruth.json \
  --output src/data/my-validated.json \
  --with-answers
```

**Sortie avec `--with-answers`** :
```
[1] ✅ Score: 0.82 | Q:0.75 A:0.68 Q↔A:0.55
[2] ❌ Score: 0.62 | Q:0.72 A:0.48 Q↔A:0.43
      ⚠️ Similarité réponse trop faible: 0.48 < 0.55
      ⚠️ Cohérence Q↔A faible: 0.43 < 0.50

📊 RÉSULTATS VALIDATION (avec validation Q+R)
  Total: 30
  Acceptées: 22 (73.3%)
  Rejetées: 8 (26.7%)
  Score moyen: 0.78

  📈 SCORES DÉTAILLÉS (avec --with-answers)
  Similarité Q moyenne: 0.72
  Similarité A moyenne: 0.65
  Cohérence Q↔A moyenne: 0.58

  💾 Fichier: src/data/questions-validated.json
```

---

## 📊 Fichiers générés

### `annales-aligned.json`

Structure :
```json
{
  "metadata": {
    "generatedAt": "2025-11-04T10:42:20.014Z",
    "totalQuestions": 10,
    "withAnswer": 7,
    "coverageRate": "70.0%"
  },
  "questions": [
    {
      "id": "Volume-1-1",
      "questionNumber": 1,
      "question": "Définissez le score de Glasgow...",
      "answer": "Le score de Glasgow est un score universel...",
      "confidence": "high",
      "source": "Volume-1"
    }
  ],
  "questionsWithoutAnswers": [...]
}
```

### `groundTruth.json` (enrichi)

Nouveaux champs dans chaque concept :
```json
{
  "id": "c1",
  "concept": "Morphine palier III",
  "domain": "Pharmacologie",
  "keywords": ["morphine", "analgésie"],
  "context": "...",
  "qa_pairs": [
    {
      "questionNumber": 5,
      "question": "Quels sont les signes de surdosage morphinique?",
      "answer": "Bradypnée, myosis, troubles de conscience. Naloxone IV.",
      "confidence": "high",
      "source": "Volume-1"
    }
  ]
}
```

---

## 🔍 Validation Sémantique - Détails Techniques

### Modèle d'embeddings

Le système utilise `SentenceTransformers` avec des modèles médicaux :
1. **BioBERT** (`dmis-lab/biobert-base-cased-v1.2`) - Priorité 1
2. **PubMedBERT** (`microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`)
3. **SciBERT** (`allenai/scibert_scivocab_uncased`)
4. **Fallback** : `all-MiniLM-L6-v2`

### Seuils de validation

| Métrique | Seuil | Description |
|----------|-------|-------------|
| `semantic_similarity_q` | 0.60 | Question vs Concept |
| `semantic_similarity_a` | 0.55 | Réponse vs Concept (plus tolérant) |
| `q_to_a_coherence` | 0.50 | Cohérence interne Q↔R |
| `overall_score` | 0.75 | Score global pour validation |

### Calcul de similarité

```python
def cosine_similarity(emb1, emb2):
    return float(np.dot(emb1, emb2))  # Embeddings normalisés
```

---

## 🚀 Workflow complet

### Étape 1 : Extraction et alignement

```bash
cd iade-app

# Extraire et aligner les Q/A depuis les PDFs
npx tsx scripts/pipelines/improveAlignmentFromRaw.ts
```

**Output** : `annales-aligned.json` (10 Q/A, 70% avec réponse)

### Étape 2 : Fusion dans groundTruth

```bash
# Enrichir groundTruth.json avec les paires Q/A
npx tsx scripts/pipelines/mergeToGroundTruth.ts
```

**Output** : `groundTruth.json` enrichi (58 concepts, dont 8 nouveaux)

### Étape 3 : Génération IA (existant)

```bash
# Générer des questions avec Mistral/Ollama
python scripts/ai_generation/generate_batch.py
```

**Output** : `questions-generated.json`

### Étape 4 : Validation avec réponses

```bash
# Valider avec scores Q+R+cohérence
python scripts/ai_generation/validate_batch.py --with-answers
```

**Output** : `questions-validated.json` + statistiques détaillées

---

## 📈 Améliorations Futures

### Court terme

- [ ] Améliorer le parsing OCR (actuellement 70% de couverture)
- [ ] Ajouter support pour Volume-2 des annales
- [ ] Créer un script de visualisation des scores sémantiques

### Moyen terme

- [ ] Fine-tuning du modèle d'embeddings sur corpus médical IADE
- [ ] Détection automatique des concepts manquants dans groundTruth
- [ ] Export des Q/A validées vers format Anki/Quizlet

### Long terme

- [ ] RLHF (Reinforcement Learning from Human Feedback) sur les Q/A
- [ ] Génération de variantes de questions par paraphrasage contrôlé
- [ ] Intégration avec système de spaced repetition adaptatif

---

## 🐛 Troubleshooting

### Problème : Aucune réponse extraite

**Cause** : OCR de mauvaise qualité ou format PDF inhabituel

**Solution** :
1. Vérifier le contenu du fichier `tmp/ocr-cache/*.txt`
2. Ajuster les regex dans `improveAlignmentFromRaw.ts`
3. Tester avec un sous-ensemble manuel

### Problème : Scores sémantiques trop bas

**Cause** : Modèle d'embeddings non médical ou concepts trop génériques

**Solution** :
1. Vérifier que BioBERT ou PubMedBERT est chargé
2. Enrichir le champ `context` dans groundTruth.json
3. Ajouter plus de keywords médicaux spécifiques

### Problème : Validation échoue avec `--with-answers`

**Cause** : Questions générées sans champ `explanation` ou vide

**Solution** :
1. Vérifier que le prompt de génération inclut l'explication
2. Ajuster les seuils dans `question_validator.py` (lignes 40, 51)
3. Utiliser le mode standard sans `--with-answers` temporairement

---

## 📚 Références

- **Repo GitHub** : (à compléter)
- **Documentation SentenceTransformers** : https://www.sbert.net/
- **BioBERT Paper** : Lee et al., 2020
- **Spec projet EQOW** : `spec.md`, `plan.md`, `tasks.md`

---

## ✅ Checklist de validation

Avant de pousser en production, vérifier que :

- [ ] `annales-aligned.json` contient au moins 50 Q/A avec `confidence: "high"`
- [ ] `groundTruth.json` a une sauvegarde récente (`groundTruth.backup.json`)
- [ ] `validate_batch.py --with-answers` fonctionne sans erreur
- [ ] Les scores moyens Q, A et Q↔A sont > 0.60
- [ ] Aucun linter error dans TypeScript et Python
- [ ] `tasks.md` est à jour avec les nouvelles tâches 1.8.x

---

**Date de création** : 4 novembre 2025  
**Auteur** : Pipeline automatisé EQOW  
**Version** : 1.0.0

---

🎉 **Pipeline Q/A complet opérationnel !**

