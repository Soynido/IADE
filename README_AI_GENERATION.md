# 🤖 Système de Génération IA de Questions Médicales IADE

## 🎯 Objectif

Ce système permet de générer automatiquement des QCM et cas cliniques médicaux de niveau IADE à partir des cours extraits, **100% en local, sans API externe**.

## 📦 Prérequis

### Système

- **Python** : 3.9+
- **Node.js** : 20+
- **Ollama** : dernière version
- **Tesseract** : 5.0+ (pour OCR)
- **Espace disque** : ~10GB (modèles Ollama)
- **RAM** : 8GB minimum (16GB recommandé)
- **GPU** : optionnel (accélère x5-10 la génération)

### Installation des outils

#### 1. Installer Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Ou télécharger depuis https://ollama.com
```

#### 2. Télécharger un modèle médical

```bash
# Option 1 : Meditron-7B (EPFL, spécialisé médical) - RECOMMANDÉ
ollama pull meditron

# Option 2 : BioMistral-7B (alternative française pharma)
ollama pull biomistral

# Option 3 : Mistral 7B Instruct (fallback généraliste FR)
ollama pull mistral
```

#### 3. Installer Tesseract OCR (macOS)

```bash
brew install tesseract tesseract-lang
```

#### 4. Créer environnement Python

```bash
cd "/Users/valentingaludec/IADE /iade-app"
python3 -m venv venv
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
pip install -r scripts/extraction/requirements.txt
```

## 🚀 Utilisation

### Pipeline complet automatique

```bash
npm run ai:full-pipeline
```

Cette commande exécute :
1. Construction du Ground Truth depuis les données existantes
2. Génération de 50 questions via Ollama/Meditron
3. Validation automatique (embeddings sémantiques)
4. Fusion dans `compiledQuestions.json`
5. Recompilation de l'app

### Étapes individuelles

#### 1. Extraire les PDFs (optionnel)

Si vous voulez réextraire les PDFs depuis zéro :

```bash
npm run extract:full
```

#### 2. Construire le Ground Truth

```bash
npm run build:groundtruth
```

Crée `src/data/groundTruth.json` avec les concepts extraits.

#### 3. Générer des questions via IA

```bash
npm run ai:generate
# Ou avec un nombre spécifique :
python scripts/ai_generation/generate_batch.py 100
```

Génère des questions dans `src/data/questions-generated.json`.

#### 4. Valider les questions

```bash
npm run ai:validate
```

Valide les questions et crée `src/data/questions-validated.json`.

#### 5. Fusionner dans l'app

```bash
npm run ai:merge
```

Fusionne les questions validées dans `compiledQuestions.json`.

#### 6. Lancer l'app

```bash
npm run dev
```

## 📊 Métriques de Qualité

### Validation automatique

Chaque question est validée selon 4 critères :

1. **Similarité sémantique** (40%) : > 0.70 avec le contexte source
2. **Couverture keywords** (25%) : Présence des mots-clés du concept
3. **Qualité des choix** (20%) : 4 choix, 1 seule bonne réponse, pas de doublons
4. **Format** (15%) : Question se termine par ?, explications complètes

**Seuil d'acceptation** : Score global ≥ 0.75

### Résultats attendus

- ✅ Taux d'acceptation automatique : > 60%
- ✅ Similarité sémantique moyenne : > 0.75
- ✅ Taux de bullshit : < 10%
- ✅ Mix : 70% QCM, 30% Cas Cliniques

## 🧪 Exemple de sortie

### Question générée

```json
{
  "id": "ai_gen_1",
  "question": "Quels sont les signes typiques d'un surdosage morphinique ?",
  "choices": [
    "Mydriase et tachycardie",
    "Bradypnée et myosis",
    "Hyperthermie et agitation",
    "Tachypnée et confusion"
  ],
  "correct": "Bradypnée et myosis",
  "explanation": "Le surdosage morphinique se caractérise par une dépression respiratoire (bradypnée), un myosis (pupilles en tête d'épingle) et une altération de la conscience. Le traitement repose sur l'administration de naloxone.",
  "source": "ai-generated",
  "generator": "ollama-meditron",
  "domain": "Pharmacologie",
  "validation": {
    "overall_score": 0.87,
    "scores": {
      "semantic_similarity": 0.92,
      "keywords_coverage": 0.80,
      "choices_quality": 1.0,
      "format_quality": 1.0
    }
  }
}
```

## 🔧 Configuration avancée

### Changer le modèle

Modifiez `scripts/ai_generation/ollama_client.py` :

```python
client = OllamaClient(model="biomistral")  # ou "mistral"
```

### Ajuster le seuil de validation

Modifiez `scripts/ai_generation/question_validator.py` :

```python
return {
    "valid": overall_score >= 0.80,  # Augmenter à 0.80 pour plus de rigueur
    ...
}
```

### Générer uniquement des QCM (pas de cas cliniques)

Modifiez `scripts/ai_generation/generate_batch.py` :

```python
# Ligne 627
question_type = "qcm"  # Toujours QCM
```

## 📁 Structure des fichiers

```
iade-app/
├── scripts/
│   ├── extraction/
│   │   ├── requirements.txt
│   │   ├── extractWithUnstructured.py
│   │   ├── extractWithPyMuPDF.py
│   │   ├── mergeExtractions.py
│   │   └── runFullExtraction.sh
│   ├── ai_generation/
│   │   ├── ollama_client.py
│   │   ├── prompt_builder.py
│   │   ├── generate_batch.py
│   │   ├── embedding_service.py
│   │   ├── question_validator.py
│   │   └── validate_batch.py
│   ├── buildGroundTruth.ts
│   └── mergeValidatedQuestions.ts
├── src/
│   └── data/
│       ├── groundTruth.json (généré)
│       ├── questions-generated.json (généré)
│       ├── questions-validated.json (généré)
│       └── compiledQuestions.json (mis à jour)
```

## 🐛 Dépannage

### Ollama ne répond pas

```bash
# Vérifier qu'Ollama tourne
ollama list

# Redémarrer Ollama
ollama serve
```

### Erreur Python "module not found"

```bash
# Réactiver le venv
source venv/bin/activate
pip install -r scripts/extraction/requirements.txt
```

### Questions générées incohérentes

1. Augmenter le seuil de validation à 0.80
2. Utiliser Meditron au lieu de Mistral
3. Enrichir le Ground Truth avec plus de contexte

### Génération trop lente

- Installer avec GPU si disponible
- Réduire le nombre de questions : `npm run ai:generate 20`
- Utiliser un modèle plus petit : `ollama pull mistral:7b-instruct`

## 📊 Logs et monitoring

Les logs détaillés sont affichés dans la console lors de :
- `npm run ai:generate` : Stats de génération
- `npm run ai:validate` : Scores de validation
- `npm run ai:merge` : Nombre de questions ajoutées

## 🎯 Prochaines étapes

1. ✅ Pipeline complet opérationnel
2. 🚧 Amélioration du Ground Truth (extraction PDF avancée)
3. 🚧 Interface de révision manuelle des questions
4. 🚧 A/B testing qualité (IA vs humaines)
5. 🚧 Dashboard métriques IA dans l'app

## 📄 Licence

MIT License - Open Source

---

**🤖 Système de génération IA 100% local et gratuit pour l'excellence médicale IADE**

