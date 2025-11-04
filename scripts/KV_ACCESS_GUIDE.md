# 🔧 Guide d'Accès Vercel KV depuis l'IDE

## 🎯 Objectif

Interroger, analyser et manipuler les feedbacks stockés dans Vercel KV **directement depuis votre IDE**, sans passer par le dashboard.

---

## 📦 Prérequis

### Vérifier les variables KV

```bash
# Dans votre terminal
vercel env ls

# Devrait afficher:
# KV_REST_API_URL
# KV_REST_API_TOKEN
```

Si absent, configurer Vercel KV (voir `CONFIGURATION_KV_ETAPES.md`)

### Pull les variables en local

```bash
vercel env pull .env.local
```

Cela crée un fichier `.env.local` avec vos variables KV.

---

## 🚀 Utilisation des scripts

### 1. Export des feedbacks (TypeScript)

```bash
npx tsx scripts/kv_dump_feedbacks.ts
```

**Résultat:**
- Fichier: `data/feedbacks_dump.json`
- Contenu: Tous les feedbacks au format JSON
- Stats rapides affichées dans le terminal

**Exemple de sortie:**
```
📊 245 feedbacks trouvés dans KV
✅ 245 feedbacks valides parsés

💾 Feedbacks exportés vers: data/feedbacks_dump.json

📈 STATISTIQUES RAPIDES:
   Total feedbacks: 245
   Moyenne rating: 2.34/3
   Distribution: 👎 12 | 👍 98 | 🌟 135
   Questions uniques: 58
   Utilisateurs uniques: 23
```

---

### 2. Analyse approfondie

```bash
npx tsx scripts/analyzeFeedbacks.ts
```

**Affiche:**
1. Distribution globale (rating, taux complétion)
2. Top 5 meilleures questions
3. Top 5 questions à améliorer
4. Évolution temporelle (feedbacks/jour)
5. Utilisateurs actifs

**Génère aussi:**
- `data/feedbacks_analysis.json` (rapport complet)

**Exemple de sortie:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. TOP QUESTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌟 TOP 5 MEILLEURES QUESTIONS:
   1. ai_gen_42
      Rating: 2.89/3 (18 feedbacks)
      Taux réussite: 94%

👎 TOP 5 QUESTIONS À AMÉLIORER:
   1. q_123
      Rating: 1.23/3 (13 feedbacks)
      Taux réussite: 38%
```

---

### 3. Mise à jour des poids adaptatifs

```bash
npx tsx scripts/updateAdaptiveWeights.ts
```

**Fonctionnalités:**
- Recalcule `dynamicDifficulty` pour chaque question
- Calcule `selectionWeight` (pondération)
- Génère `questions-weighted.json` (dataset enrichi)

**Utilisation ensuite:**
```typescript
// Dans votre app
import questionsWeighted from '../data/questions-weighted.json';

// Questions déjà pondérées et ajustées selon feedbacks
const questions = questionsWeighted.questions;
```

---

### 4. Version Python (alternative)

```bash
# Installer dépendances
pip install requests python-dotenv

# Récupérer feedbacks
python scripts/kv_fetch_feedbacks.py
```

Même résultat que la version TypeScript.

---

## 🔍 Accès direct CLI (debug rapide)

### Lister tous les feedbacks

```bash
# Via script Node
node -e "const { kv } = require('@vercel/kv'); kv.lrange('feedbacks:all', 0, -1).then(r => console.log(JSON.stringify(r, null, 2)))"
```

### Voir stats d'une question

```bash
# Via script Node
node -e "const { kv } = require('@vercel/kv'); kv.hgetall('question:ai_gen_42').then(r => console.log(r))"
```

### Compter les feedbacks

```bash
# Nombre total
node -e "const { kv } = require('@vercel/kv'); kv.llen('feedbacks:all').then(r => console.log('Total:', r))"
```

---

## 📊 Workflow complet

### Scénario: Analyse hebdomadaire

```bash
# 1. Exporter les feedbacks de la semaine
npx tsx scripts/kv_dump_feedbacks.ts

# 2. Analyser les tendances
npx tsx scripts/analyzeFeedbacks.ts

# 3. Identifier questions problématiques
grep "rating.*1\." data/feedbacks_analysis.json

# 4. Mettre à jour les poids
npx tsx scripts/updateAdaptiveWeights.ts

# 5. Déployer le nouveau dataset
git add src/data/questions-weighted.json
git commit -m "chore: update adaptive weights from feedbacks"
git push
```

---

## 🔬 Analyses avancées

### Créer un rapport CSV

```typescript
// scripts/exportFeedbacksCSV.ts
import fs from 'fs';

const feedbacks = JSON.parse(fs.readFileSync('data/feedbacks_dump.json', 'utf-8'));

const csv = ['questionId,rating,wasCorrect,timestamp,userId'];
feedbacks.forEach(f => {
  csv.push(`${f.questionId},${f.rating},${f.wasCorrect},${f.timestamp},${f.userId}`);
});

fs.writeFileSync('data/feedbacks.csv', csv.join('\n'));
console.log('✅ CSV exporté');
```

### Analyser avec Pandas (Python)

```python
import pandas as pd

df = pd.read_json('data/feedbacks_dump.json')

# Moyenne rating par question
avg_by_question = df.groupby('questionId')['rating'].mean().sort_values()

# Questions les plus notées
most_feedback = df.groupby('questionId').size().sort_values(ascending=False)

# Corrélation rating vs réussite
correlation = df[['rating', 'wasCorrect']].corr()

print(correlation)
```

---

## 🎓 Cas d'usage pratiques

### 1. Identifier questions à retirer

```typescript
// Questions mal notées avec beaucoup de feedbacks
const toRemove = questionStats
  .filter(q => q.averageRating < 1.3 && q.totalFeedbacks > 10)
  .map(q => q.questionId);

console.log('Questions à retirer:', toRemove);
```

### 2. Détecter les questions trop faciles

```typescript
// Questions notées 3/3 mais 100% de réussite
const tooEasy = questionStats
  .filter(q => q.averageRating > 2.8 && q.correctRate > 0.95)
  .map(q => q.questionId);

console.log('Questions trop faciles:', tooEasy);
```

### 3. Prioriser génération IA

```typescript
// Domaines avec feedbacks faibles
const weakDomains = Object.entries(feedbacksByDomain)
  .filter(([_, stats]) => stats.averageRating < 2.0)
  .map(([domain, _]) => domain);

console.log('Générer plus de questions pour:', weakDomains);
```

---

## 📚 Scripts disponibles

| Script | Commande | Sortie | Utilité |
|--------|----------|--------|---------|
| **Export feedbacks** | `npx tsx scripts/kv_dump_feedbacks.ts` | `feedbacks_dump.json` | Récupération locale |
| **Analyse** | `npx tsx scripts/analyzeFeedbacks.ts` | `feedbacks_analysis.json` + stats | Insights |
| **Update weights** | `npx tsx scripts/updateAdaptiveWeights.ts` | `questions-weighted.json` | Amélioration moteur |
| **Export CSV** | `npx tsx scripts/exportFeedbacksCSV.ts` | `feedbacks.csv` | Excel/Pandas |
| **Python fetch** | `python scripts/kv_fetch_feedbacks.py` | `feedbacks_dump.json` | Alternative Python |

---

## 🔐 Sécurité

### Variables sensibles

Les tokens KV sont sensibles. **Ne jamais commit .env.local !**

Vérifier `.gitignore`:
```bash
grep ".env.local" .gitignore
# Devrait retourner: .env.local
```

### Accès en lecture seule

Pour limiter les risques, vous pouvez créer un token KV read-only:
- Dashboard Vercel → Storage → iade-feedbacks → Settings
- Create Read-Only Token
- Utiliser ce token dans `.env.local` pour les scripts d'analyse

---

## 🎯 Recommandations

### Fréquence d'analyse

- **Quotidien:** Si > 100 feedbacks/jour
- **Hebdomadaire:** Si 20-100 feedbacks/jour
- **Mensuel:** Si < 20 feedbacks/jour

### Automatisation

Créer un cron job Vercel:

```typescript
// api/cron/analyze-feedbacks.ts
export default async function handler(req: Request) {
  // Exécuter analyse automatique
  await dumpFeedbacks();
  await updateAdaptiveWeights();
  
  // Envoyer rapport par email (SendGrid)
  // ...
  
  return Response.json({ success: true });
}
```

---

## ✅ Checklist

Avant d'utiliser les scripts:

- [ ] Vercel KV configuré
- [ ] Variables KV pullées localement (`vercel env pull`)
- [ ] @vercel/kv installé (`npm install @vercel/kv`)
- [ ] .env.local dans .gitignore
- [ ] Au moins quelques feedbacks dans KV (tester l'app)

---

**Prêt à analyser vos feedbacks !** 🔬

**Première commande:**
```bash
npx tsx scripts/kv_dump_feedbacks.ts
```

