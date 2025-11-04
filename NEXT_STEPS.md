# 🎯 Prochaines Étapes - Vers 500 Questions IADE

**État actuel** : ✅ 202 questions (score 0.837)  
**Prochain jalon** : 500 questions (score ≥ 0.88)

---

## 🚀 Action Immédiate : Tester l'App (2 minutes)

```bash
npm run dev
```

**Ouvrir** : http://localhost:5173

**Vérifier** :
- ✅ Les questions apparaissent normalement
- ✅ Badge 🤖 IA violet visible sur questions générées
- ✅ Explications médicales complètes
- ✅ Navigation fluide

**Si tout fonctionne** → ✅ Système validé !

---

## 📋 Plan Structuré vers 500 Questions

### 🎯 Jalon 1 : Diversifier (202 → 350 questions)

**Problème actuel** : 97% Pharmacologie (déséquilibré)

**Solution** :
1. Créer 50 concepts Réanimation
2. Créer 30 concepts Physiologie
3. Créer 20 concepts Anesthésie

**Commandes** :

```bash
# 1. Éditer le fichier
nano scripts/createMassiveGroundTruth.py

# Ajouter dans le code (section CONCEPTS_IADE) :

# RÉANIMATION (50 concepts)
{"concept": "Choc septique - Noradrénaline", "domain": "Réanimation", ...},
{"concept": "SDRA - Ventilation protectrice", "domain": "Réanimation", ...},
{"concept": "Remplissage vasculaire", "domain": "Réanimation", ...},
# ... (50 concepts)

# PHYSIOLOGIE (30 concepts)
{"concept": "Courbe dissociation Hb-O2", "domain": "Physiologie", ...},
{"concept": "Autorégulation cérébrale", "domain": "Physiologie", ...},
# ... (30 concepts)

# 2. Regénérer Ground Truth
python scripts/createMassiveGroundTruth.py

# 3. Générer questions
source venv/bin/activate
python scripts/ai_generation/generate_batch.py 100
python scripts/ai_generation/validate_batch.py
npm run ai:merge

# Vérifier progression
grep -c '"id"' src/data/compiledQuestions.json
# Attendu : ~287 questions
```

**Temps estimé** : 45 minutes  
**Résultat** : +85 questions, meilleur équilibre domaines

---

### 🎯 Jalon 2 : Améliorer Score (350 → 420 questions)

**Problème actuel** : Score 0.837 (cible 0.88)

**Solution** : Enrichir les contextes

**Avant** (200 chars) :
```
"context": "Curare dépolarisant ultra-rapide 45-60s."
```

**Après** (500 chars) :
```
"context": "Succinylcholine, curare dépolarisant. Mécanisme: dépolarisation prolongée plaque motrice. Délai 45-60s, durée 5-10 min. Dose 1-1,5 mg/kg IV. Indications: intubation rapide, laryngospasme. Effets: fasciculations, myalgies, hyperkaliémie +0,5 mEq/L. CI ABSOLUES: hyperkaliémie, brûlures > 24h, myopathies, hyperthermie maligne antécédent. Complications: TV/FV par hyperkaliémie, hyperthermie maligne (dantrolène antidote)."
```

**Actions** :
1. Éditer `groundTruth.json`
2. Enrichir top 50 concepts (500+ caractères chacun)
3. Régénérer les questions de ces concepts

**Résultat attendu** : Score 0.84 → 0.88

---

### 🎯 Jalon 3 : Cas Cliniques (420 → 480 questions)

**Ajouter 20% de cas cliniques narratifs**

**Modifier** `scripts/ai_generation/generate_batch.py` :

```python
# Ligne 27 actuelle :
question_type = "qcm" if i % 10 < 7 else "clinical_case"

# Nouvelle ligne (20% cas cliniques) :
question_type = "clinical_case" if i % 5 == 0 else "qcm"
```

**Générer** :

```bash
python scripts/ai_generation/generate_batch.py 75
# Sur 75, ~15 seront cas cliniques, ~12-13 validés
```

**Résultat** : +60 questions dont 12-15 cas cliniques

---

### 🎯 Jalon 4 : Finalisation (480 → 500 questions)

**Dernières 20 questions**

```bash
# Génération finale
python scripts/ai_generation/generate_batch.py 25
python scripts/ai_generation/validate_batch.py
npm run ai:merge

# Vérifier
total=$(grep -c '"id"' src/data/compiledQuestions.json)
echo "Total : $total/500"
```

**Audit qualité final** :
1. Prélever 50 questions au hasard (10%)
2. Validation médicale humaine
3. Corrections si nécessaire
4. Marquer comme "expert-validated"

**Sauvegarde finale** :

```bash
# Backup production
cp src/data/compiledQuestions.json backups/QA_IADE_v1_FINAL_500Q_$(date +%Y%m%d).json

echo "🎉 500 questions production-ready !"
```

---

## ⏱️ Timeline Réaliste

| Jalon | Tâches | Temps | Questions |
|-------|--------|-------|-----------|
| **Actuel** | - | - | 202 |
| **Jalon 1** | Diversifier | 45 min | +85 → 287 |
| **Jalon 2** | Enrichir | 1h | +133 → 420 |
| **Jalon 3** | Cas cliniques | 30 min | +60 → 480 |
| **Jalon 4** | Finaliser | 20 min | +20 → 500 |
| **TOTAL** | - | **~2h30** | **500** |

---

## 💡 Conseils Pratiques

### Pour Diversifier Rapidement

**Utiliser les données existantes** :

```bash
# Extraire concepts depuis les modules
ls src/data/modules/*.md

# Chaque module peut donner 5-10 concepts
# 24 modules × 7 concepts = ~168 concepts
```

### Pour Améliorer le Score

**Ajouter dans chaque contexte** :
- ✅ Valeurs numériques (doses, délais, normes)
- ✅ Mécanismes d'action
- ✅ Contre-indications
- ✅ Effets secondaires principaux
- ✅ Protocoles standards

### Pour Accélérer

**Génération parallèle (si GPU disponible)** :

```bash
# Lancer 2-3 générations en parallèle
python scripts/ai_generation/generate_batch.py 20 &
python scripts/ai_generation/generate_batch.py 20 &
wait

# Puis valider tout
python scripts/ai_generation/validate_batch.py
```

---

## 🔧 Commandes Utiles

### Analyser le Corpus Actuel

```bash
# Statistiques détaillées
python << 'EOF'
import json
with open("src/data/compiledQuestions.json") as f:
    q = json.load(f)
by_domain = {}
for question in q:
    domain = question.get('theme', 'Inconnu')
    by_domain[domain] = by_domain.get(domain, 0) + 1
for d, c in sorted(by_domain.items(), key=lambda x: x[1], reverse=True):
    print(f"{d}: {c}")
EOF
```

### Générer en Continu

```bash
# Script simple pour atteindre N questions
TARGET=500
while [ $(grep -c '"id"' src/data/compiledQuestions.json) -lt $TARGET ]; do
    source venv/bin/activate
    python scripts/ai_generation/generate_batch.py 20
    python scripts/ai_generation/validate_batch.py
    npm run ai:merge
    current=$(grep -c '"id"' src/data/compiledQuestions.json)
    echo "📈 $current/$TARGET"
    sleep 2
done
echo "🎉 $TARGET questions atteintes !"
```

---

## 📊 Métriques à Surveiller

### Pendant la Génération

```bash
# Compter questions temps réel
watch -n 5 "grep -c '\"id\"' src/data/compiledQuestions.json"

# Surveiller RAM
top -l 1 | grep PhysMem
```

### Après Génération

```bash
# Score moyen
python << 'EOF'
import json, statistics
with open("src/data/questions-validated.json") as f:
    q = json.load(f)
scores = [x.get('validation', {}).get('overall_score', 0) for x in q if 'validation' in x]
print(f"Score moyen: {statistics.mean(scores):.3f}")
EOF

# Répartition domaines
grep -o '"theme": "[^"]*"' src/data/compiledQuestions.json | sort | uniq -c | sort -rn
```

---

## ✅ Checklist Avant Génération Massive

- [ ] Ground Truth enrichi (250+ concepts)
- [ ] Contextes détaillés (500+ caractères)
- [ ] Mix domaines équilibré (vérifier répartition)
- [ ] Ratio QCM/Cas configuré (80/20)
- [ ] Ollama server actif (`ollama list`)
- [ ] BioBERT téléchargé (automatique au 1er run)
- [ ] Python venv activé (`source venv/bin/activate`)
- [ ] Espace disque suffisant (>1GB libre)

---

## 🎯 Objectifs de Qualité pour 500Q

| Métrique | Cible | Comment l'atteindre |
|----------|-------|---------------------|
| **Score moyen** | ≥ 0.88 | Enrichir contextes |
| **Mix domaines** | 60/20/20 | Créer 100+ concepts non-Pharmaco |
| **Mix types** | 80/20 QCM/Cas | Modifier ratio génération |
| **Validation humaine** | 10% | Auditer 50 questions |

---

## 🎉 Récapitulatif

**Vous êtes à 40% de l'objectif 500 questions** avec un système :
- ✅ Stable (0 crash)
- ✅ Performant (99% JSON valide)
- ✅ Gratuit (0€)
- ✅ Reproductible (scripts documentés)

**Prochaine action** : `npm run dev` pour tester !

---

*Dernière mise à jour : 4 novembre 2025*

