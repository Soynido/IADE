# 🎯 Roadmap : 202 → 500 Questions IADE

**État actuel** : 202 questions (score 0.837)  
**Objectif** : 500 questions (score ≥ 0.88)  
**Stratégie** : Diversification + Enrichissement + Fine-tuning

---

## 📊 Analyse de l'État Actuel

### Forces

✅ **Système stable** : 96.9% performance globale  
✅ **Pipeline automatisé** : De concept → question validée  
✅ **Qualité pharmacologie** : 196 questions excellentes  
✅ **Infrastructure 0€** : 100% local, open source  

### Faiblesses à Corriger

⚠️ **Déséquilibre domaines** : 97% Pharmacologie  
⚠️ **Score moyen** : 0.837 (cible 0.88)  
⚠️ **Diversité** : Concepts trop similaires  

---

## 🚀 Phase 1 : Diversification (202 → 350 questions)

**Objectif** : Équilibrer les domaines médicaux

### Étape 1.1 : Créer 100 Nouveaux Concepts

**Répartition cible** :

| Domaine | Concepts | Questions attendues |
|---------|----------|---------------------|
| Réanimation | 30 | ~25 |
| Physiologie | 20 | ~17 |
| Anesthésie | 20 | ~17 |
| Urgences | 15 | ~13 |
| Biologie | 15 | ~13 |
| **Total** | **100** | **~85** |

**Actions** :

1. Enrichir le fichier `scripts/createMassiveGroundTruth.py`
2. Ajouter 30 concepts Réanimation (scores, chocs, ventilation)
3. Ajouter 20 concepts Physiologie (cardio, respi, rénal)
4. Ajouter 20 concepts Anesthésie (ALR, monitoring, complications)
5. Ajouter 15 concepts Urgences (trauma, toxico, ACR)
6. Ajouter 15 concepts Biologie (normes, interprétation, gazométrie)

**Commandes** :

```bash
# 1. Éditer le script
nano scripts/createMassiveGroundTruth.py

# 2. Regénérer Ground Truth
python scripts/createMassiveGroundTruth.py

# 3. Générer questions
source venv/bin/activate
python scripts/ai_generation/generate_batch.py 100
python scripts/ai_generation/validate_batch.py
npm run ai:merge
```

**Résultat attendu** : 287 questions (+85)

---

## 🔬 Phase 2 : Enrichissement Contextes (350 → 420 questions)

**Objectif** : Augmenter score moyen 0.837 → 0.88

### Étape 2.1 : Enrichir les Contextes

**Amélioration** : Passer de 200 → 500 caractères par concept

**Avant** :
```json
{
  "context": "Curare dépolarisant ultra-rapide 45-60s."
}
```

**Après** :
```json
{
  "context": "Curare dépolarisant ultra-rapide. Mécanisme : dépolarisation prolongée plaque motrice. Délai d'action : 45-60 secondes. Durée d'action : 5-10 minutes. Dose : 1-1,5 mg/kg IV. Indications : intubation séquence rapide, laryngospasme. Effets secondaires : fasciculations musculaires, myalgies postopératoires, hyperkaliémie +0,5-1 mEq/L. Contre-indications ABSOLUES : hyperkaliémie préexistante, antécédent hyperthermie maligne, brûlures étendues > 24h, dénervation (paraplégie, AVC), myopathies (Duchenne). Complications graves : hyperkaliémie mortelle (TV, FV), hyperthermie maligne (dantrolène), bradycardie."
}
```

**Impact attendu** : Score +0.05 → 0.88

### Étape 2.2 : Régénération Ciblée

**Identifier les questions < 0.80** :

```bash
python << 'EOF'
import json
with open("src/data/questions-validated.json") as f:
    questions = json.load(f)
    
low_score = [q for q in questions if q.get('validation', {}).get('overall_score', 1) < 0.80]
print(f"Questions à régénérer : {len(low_score)}")

# Sauvegarder les concepts à améliorer
concepts_to_improve = [q['concept_id'] for q in low_score]
with open("concepts_to_improve.json", "w") as f:
    json.dump(concepts_to_improve, f)
EOF
```

**Regénérer** :
```bash
# Script de régénération ciblée (à créer)
python scripts/ai_generation/regenerate_low_scores.py
```

**Résultat attendu** : 350 → 420 questions (score moyen 0.88)

---

## 🎨 Phase 3 : Cas Cliniques (420 → 480 questions)

**Objectif** : Ajouter 60 cas cliniques narratifs

### Modifier le Ratio

Actuellement : **100% QCM**  
Cible : **80% QCM + 20% Cas Cliniques**

**Modifier** `scripts/ai_generation/generate_batch.py` :

```python
# Ligne 27 (actuellement)
question_type = "qcm" if i % 10 < 7 else "clinical_case"

# Devrait être (pour 20% cas cliniques)
question_type = "clinical_case" if i % 5 == 0 else "qcm"
```

**Générer 60 cas cliniques** :

```bash
# Modifier le ratio puis
python scripts/ai_generation/generate_batch.py 75
# (sur 75, ~15 seront des cas cliniques, 12-13 validés)
```

**Résultat attendu** : 480 questions (384 QCM + 96 Cas cliniques)

---

## 🏁 Phase 4 : Finalisation (480 → 500+ questions)

**Objectif** : Atteindre exactement 500 questions de haute qualité

### Génération Finale

```bash
# Générer les 20-25 dernières questions
python scripts/ai_generation/generate_batch.py 30
python scripts/ai_generation/validate_batch.py
npm run ai:merge
```

### Contrôle Qualité Final

**Audit manuel échantillon** :
1. Prélever 20 questions au hasard
2. Vérifier cohérence médicale
3. Corriger si besoin
4. Marquer comme "human-reviewed"

### Sauvegarde Production

```bash
# Créer backup final
mkdir -p backups
cp src/data/compiledQuestions.json backups/QA_IADE_v1_FINAL_500Q_$(date +%Y%m%d).json

# Dataset de training
cp backups/QA_IADE_v1_FINAL_500Q_*.json data/training/

echo "✅ 500 questions validées et sauvegardées"
```

---

## 📈 Timeline Estimée

| Phase | Tâches | Temps | Questions |
|-------|--------|-------|-----------|
| **Actuel** | - | - | 202 |
| **Phase 1** | 100 concepts nouveaux | 30 min | +85 → 287 |
| **Phase 2** | Enrichissement + régénération | 45 min | +133 → 420 |
| **Phase 3** | Cas cliniques | 20 min | +60 → 480 |
| **Phase 4** | Finalisation | 15 min | +20 → 500 |
| **TOTAL** | - | **~2h** | **500** |

---

## 🔧 Scripts à Créer (Optionnel)

### 1. Script de Régénération Ciblée

**`scripts/ai_generation/regenerate_low_scores.py`** :

```python
import json

# Charger questions < 0.80
with open("src/data/questions-validated.json") as f:
    questions = json.load(f)

low_score_concepts = [
    q['concept_id'] for q in questions 
    if q.get('validation', {}).get('overall_score', 1) < 0.80
]

# Regénérer uniquement ces concepts
# (à implémenter)
```

### 2. Script d'Analyse Qualité

**`scripts/analyzeQuality.py`** :

```python
import json
import statistics

with open("src/data/compiledQuestions.json") as f:
    questions = json.load(f)

scores = [
    q.get('validation', {}).get('overall_score', 0) 
    for q in questions 
    if 'validation' in q
]

print(f"Moyenne : {statistics.mean(scores):.3f}")
print(f"Médiane : {statistics.median(scores):.3f}")
print(f"Écart-type : {statistics.stdev(scores):.3f}")
```

### 3. Script d'Export pour Fine-Tuning

**`scripts/exportForFineTuning.py`** :

```python
import json

# Format pour fine-tuning Mistral/LLaMA
with open("src/data/compiledQuestions.json") as f:
    questions = json.load(f)

training_data = []
for q in questions:
    training_data.append({
        "instruction": "Génère une question QCM médicale IADE",
        "input": f"Concept: {q.get('theme', '')}",
        "output": json.dumps({
            "question": q['question'],
            "choices": q.get('options', []),
            "correct": q['correct'],
            "explanation": q['explanation']
        }, ensure_ascii=False)
    })

with open("data/training/fine_tuning_dataset.jsonl", "w") as f:
    for item in training_data:
        f.write(json.dumps(item, ensure_ascii=False) + "\n")
```

---

## 🎯 Métriques de Succès pour 500 Questions

| KPI | Cible 500Q | Comment Mesurer |
|-----|------------|-----------------|
| **Total questions** | 500 | `grep -c '"id"' compiledQuestions.json` |
| **Score moyen** | ≥ 0.88 | Moyenne scores validation |
| **Mix domaines** | Pharmaco 60%, Réa 20%, Autres 20% | Compter par domain |
| **Mix types** | QCM 80%, Cas 20% | Compter par type |
| **Mix difficulté** | Facile 25%, Moyen 50%, Difficile 25% | Compter par difficulty |

---

## 💡 Astuces pour Améliorer la Qualité

### 1. Enrichir les Contextes

**Ajouter pour chaque concept** :
- Valeurs numériques précises (doses, délais, durées)
- Mécanismes d'action détaillés
- Contre-indications absolues et relatives
- Effets secondaires fréquents
- Protocoles standards

### 2. Varier les Formats de Questions

**Types à ajouter** :
- Questions de calcul (dosages, débits)
- Questions à choix multiples (plusieurs bonnes réponses)
- Questions d'interprétation (ECG, gaz du sang)
- Questions de séquence (ordre des actions)

### 3. Validation Humaine Échantillon

**Processus recommandé** :
1. Prélever 10% questions (50 sur 500)
2. Révision médicale par IADE
3. Correction si nécessaire
4. Marquer comme "expert-validated"
5. Utiliser pour améliorer le prompt

---

## 🔮 Au-delà de 500 : Fine-Tuning

### Créer Mistral-IADE-v1

**Prérequis** :
- Dataset : 500 questions validées
- GPU : 24GB VRAM ou cloud (RunPod ~0.50$/h)
- Framework : Axolotl ou Unsloth

**Processus** :
```bash
# 1. Préparer dataset
python scripts/exportForFineTuning.py

# 2. Fine-tuning LoRA
# Sur cloud ou local avec GPU
# 3-5 epochs, learning rate 2e-4

# 3. Tester le modèle fine-tuné
ollama create mistral-iade -f Modelfile
ollama run mistral-iade "Génère QCM sur morphine"
```

**Gain attendu** :
- Taux validation : 80% → 95%+
- Score moyen : 0.83 → 0.92+
- Pertinence médicale : ++

---

## 📅 Planning Suggéré

### Semaine 1 : Diversification
- Jour 1-2 : Créer 100 concepts non-Pharmaco
- Jour 3-4 : Générer 100 questions
- Jour 5 : Validation et intégration
- **Résultat** : 287 questions

### Semaine 2 : Enrichissement
- Jour 1-3 : Enrichir tous les contextes
- Jour 4-5 : Régénération ciblée
- **Résultat** : 420 questions, score 0.88

### Semaine 3 : Cas Cliniques
- Jour 1-3 : Générer 60-80 cas cliniques
- Jour 4-5 : Validation + intégration
- **Résultat** : 500 questions

### Semaine 4 : Fine-Tuning (Optionnel)
- Jour 1-2 : Préparation dataset
- Jour 3-5 : Fine-tuning cloud
- **Résultat** : Mistral-IADE-v1

---

## 🎯 Commandes Rapides

### Continuer la génération (100 questions)

```bash
cd "/Users/valentingaludec/IADE /iade-app"
source venv/bin/activate

# Générer
python scripts/ai_generation/generate_batch.py 100

# Valider
python scripts/ai_generation/validate_batch.py

# Fusionner
npm run ai:merge

# Vérifier total
grep -c '"id"' src/data/compiledQuestions.json
```

### Analyser la qualité

```bash
python << 'EOF'
import json
import statistics

with open("src/data/compiledQuestions.json") as f:
    questions = json.load(f)

ai_questions = [q for q in questions if q.get('source') == 'ai-generated']
scores = [q.get('validation', {}).get('overall_score', 0) for q in ai_questions if 'validation' in q]

print(f"Total IA : {len(ai_questions)}")
print(f"Score moyen : {statistics.mean(scores):.3f}")
print(f"Score médian : {statistics.median(scores):.3f}")
print(f"Score min : {min(scores):.3f}")
print(f"Score max : {max(scores):.3f}")

# Par domaine
by_domain = {}
for q in ai_questions:
    domain = q.get('theme', 'Inconnu')
    by_domain[domain] = by_domain.get(domain, 0) + 1

print("\nPar domaine :")
for domain, count in sorted(by_domain.items(), key=lambda x: x[1], reverse=True):
    print(f"  {domain}: {count} ({count*100/len(ai_questions):.1f}%)")
EOF
```

---

## 🏆 Critères de Succès pour 500 Questions

### Métriques Quantitatives

- ✅ Total : **500 questions** exactement
- ✅ Score moyen : **≥ 0.88**
- ✅ Taux validation : **≥ 85%**

### Métriques Qualitatives

- ✅ Mix domaines : **60% Pharmaco, 40% Autres**
- ✅ Mix types : **80% QCM, 20% Cas cliniques**
- ✅ Mix difficulté : **25% Facile, 50% Moyen, 25% Difficile**
- ✅ Validation humaine : **10% échantillon vérifié**

### Métriques Techniques

- ✅ Stabilité : **0 crash**
- ✅ JSON valide : **≥ 99%**
- ✅ Doublons : **≤ 5%**
- ✅ Temps total : **≤ 3h**

---

## 📝 Checklist Avant Lancement 500Q

### Préparation

- [ ] Ground Truth enrichi à 250 concepts minimum
- [ ] Contextes enrichis (500+ caractères)
- [ ] Mix domaines équilibré (vérifier répartition)
- [ ] Ratio QCM/Cas configuré
- [ ] Ollama server actif
- [ ] BioBERT téléchargé
- [ ] Python venv activé

### Exécution

- [ ] Lancer génération par batches de 20
- [ ] Surveiller RAM (< 8GB)
- [ ] Vérifier logs régulièrement
- [ ] Backup intermédiaires tous les 100Q

### Post-Production

- [ ] Audit manuel 10% échantillon
- [ ] Corrections nécessaires
- [ ] Dataset final sauvegardé
- [ ] Documentation mise à jour
- [ ] Git commit + tag v1.0

---

## 🚀 Commande Unique pour 500 Questions

**Si Ground Truth prêt (250+ concepts)** :

```bash
#!/bin/bash
# generate_500.sh

TARGET=500
CURRENT=$(grep -c '"id"' src/data/compiledQuestions.json)
NEEDED=$((TARGET - CURRENT))

echo "🎯 Génération vers $TARGET questions"
echo "📊 Actuel: $CURRENT | Besoin: $NEEDED"

source venv/bin/activate

while [ $(grep -c '"id"' src/data/compiledQuestions.json) -lt $TARGET ]; do
    python scripts/ai_generation/generate_batch.py 20
    python scripts/ai_generation/validate_batch.py
    npm run ai:merge
    
    current=$(grep -c '"id"' src/data/compiledQuestions.json)
    echo "📈 Progression: $current/$TARGET"
    
    sleep 2
done

echo "🎉 500 questions atteintes !"
```

---

**🎯 Vous êtes maintenant à 26% de l'objectif 500 questions avec un système stable et performant !**

**🚀 Prochaine action recommandée** : Diversifier les domaines (Phase 1)

