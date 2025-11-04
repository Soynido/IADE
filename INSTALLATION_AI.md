# 🚀 Installation Rapide - Système IA IADE

## Étape 1 : Installer Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Ou télécharger depuis https://ollama.com
```

## Étape 2 : Télécharger le modèle médical

```bash
# Meditron-7B (recommandé pour IADE)
ollama pull meditron
```

**⏱️ Temps de téléchargement** : ~5 minutes (modèle ~4GB)

## Étape 3 : Tester Ollama

```bash
ollama run meditron "Quels sont les signes d'un surdosage morphinique ?"
```

Si une réponse médicale s'affiche, ✅ Ollama fonctionne !

## Étape 4 : Installer les dépendances Python

```bash
cd "/Users/valentingaludec/IADE /iade-app"

# Créer environnement virtuel
python3 -m venv venv
source venv/bin/activate

# Installer les packages
pip install -r scripts/extraction/requirements.txt
```

**⏱️ Temps d'installation** : ~3-5 minutes

## Étape 5 : Installer Tesseract (optionnel, pour OCR)

```bash
# macOS
brew install tesseract tesseract-lang
```

## Étape 6 : Générer des questions IA

### Option A : Pipeline complet automatique (recommandé)

```bash
npm run ai:full-pipeline
```

Cette commande :
1. ✅ Crée le Ground Truth depuis vos données existantes
2. ✅ Génère 50 questions via Meditron
3. ✅ Valide automatiquement (score ≥ 0.75)
4. ✅ Fusionne dans compiledQuestions.json
5. ✅ Recompile l'app

**⏱️ Temps total** : ~30-60 minutes (dépend du CPU/GPU)

### Option B : Étapes manuelles

```bash
# 1. Créer le Ground Truth
npm run build:groundtruth

# 2. Générer questions (50 par défaut)
npm run ai:generate

# 3. Valider
npm run ai:validate

# 4. Fusionner dans l'app
npm run ai:merge

# 5. Recompiler
npm run compile
```

## Étape 7 : Lancer l'app

```bash
npm run dev
```

Ouvrez http://localhost:5173

Les questions IA sont marquées avec un badge **🤖 IA** violet.

---

## 🎯 Résultats attendus

Après génération complète :
- ✅ ~30-40 questions IA validées ajoutées
- ✅ Score de qualité moyen : > 0.80
- ✅ Mix : 70% QCM, 30% Cas Cliniques
- ✅ Badge 🤖 IA visible sur les questions générées

---

## ⚡ Accélérer la génération

### Avec GPU (si disponible)

La génération sera ~5-10x plus rapide automatiquement.

### Générer moins de questions

```bash
# Seulement 20 questions
python scripts/ai_generation/generate_batch.py 20
```

### Utiliser un modèle plus petit

```bash
ollama pull mistral:7b-instruct
```

Puis modifiez `scripts/ai_generation/ollama_client.py` :
```python
self.model = "mistral:7b-instruct"
```

---

## 🐛 Problèmes courants

### "ollama: command not found"

```bash
# Vérifier l'installation
which ollama

# Réinstaller si nécessaire
curl -fsSL https://ollama.com/install.sh | sh
```

### "No module named 'sentence_transformers'"

```bash
source venv/bin/activate
pip install sentence-transformers
```

### Questions générées incohérentes

1. Augmenter le seuil de validation dans `question_validator.py` :
```python
return {"valid": overall_score >= 0.85, ...}
```

2. Utiliser Meditron au lieu de Mistral générique

---

## 📊 Vérifier les résultats

### Nombre de questions IA ajoutées

```bash
grep -c "ai-generated" src/data/compiledQuestions.json
```

### Score moyen de validation

Affiché dans les logs lors de `npm run ai:validate`

---

## 🎓 Documentation complète

Voir `README_AI_GENERATION.md` pour :
- Configuration avancée
- Dépannage détaillé
- Personnalisation des prompts
- Métriques de qualité

---

**✨ Félicitations ! Votre système de génération IA est opérationnel.**

🔗 **Prochaine étape** : Lancer `npm run ai:full-pipeline` et attendre les résultats !

