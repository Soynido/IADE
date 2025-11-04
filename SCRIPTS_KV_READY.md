# ✅ Scripts d'Analyse Vercel KV - Prêts à l'emploi

## 🎯 Objectif accompli

Vous pouvez maintenant **interroger, analyser et ajuster les feedbacks** stockés dans Vercel KV directement depuis votre IDE (Cursor, VSCode, etc.), sans passer par le dashboard Vercel.

---

## 📦 Scripts créés

### TypeScript/Node.js

| Script | Commande | Description | Sortie |
|--------|----------|-------------|--------|
| **testKVConnection.ts** | `npm run kv:test` | Test connexion + variables KV | Terminal |
| **kv_dump_feedbacks.ts** | `npm run kv:dump` | Export feedbacks KV → JSON | `data/feedbacks_dump.json` |
| **analyzeFeedbacks.ts** | `npm run kv:analyze` | Analyse approfondie | `data/feedbacks_analysis.json` + Terminal |
| **exportFeedbacksCSV.ts** | `npm run kv:export-csv` | Export CSV (Excel/Pandas) | `data/feedbacks.csv` |
| **updateAdaptiveWeights.ts** | `npm run kv:update-weights` | Recalcul difficultés dynamiques | `src/data/questions-weighted.json` |

### Python (alternative)

| Script | Commande | Description |
|--------|----------|-------------|
| **kv_fetch_feedbacks.py** | `python scripts/kv_fetch_feedbacks.py` | Export feedbacks (version Python) |

---

## 🚀 Utilisation

### Première utilisation

```bash
# 1. Configurer Vercel KV
vercel env pull .env.local

# 2. Vérifier connexion
npm run kv:test
```

### Workflow d'analyse typique

```bash
# Après avoir collecté des feedbacks en production:

# 1. Export des feedbacks
npm run kv:dump

# 2. Analyse détaillée
npm run kv:analyze

# 3. Export CSV pour traitement externe
npm run kv:export-csv

# 4. Mise à jour des poids adaptatifs
npm run kv:update-weights

# 5. Déployer les améliorations
git add src/data/questions-weighted.json
git commit -m "chore: update adaptive weights based on user feedback"
git push
```

---

## 📊 Fichiers générés

```
data/
├── feedbacks_dump.json         # Export brut des feedbacks
├── feedbacks_analysis.json     # Rapport d'analyse détaillé
├── feedbacks.csv               # Export CSV (Excel/Pandas)
└── questions-weighted.json     # Dataset enrichi avec poids adaptatifs
```

---

## 📖 Documentation complète

Voir **`KV_ACCESS_GUIDE.md`** pour :

- 🔧 Configuration détaillée
- 📊 Exemples d'analyses avancées
- 🐍 Intégration Python/Pandas
- 🤖 Automatisation avec cron jobs
- 🎯 Cas d'usage pratiques

---

## 🧪 Exemple de résultats

### `npm run kv:dump`

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

### `npm run kv:analyze`

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

## 🎯 Intégration dans votre pipeline adaptatif

### Utiliser le dataset pondéré

```typescript
// Dans votre app
import questionsWeighted from '../data/questions-weighted.json';

// Les questions sont déjà enrichies avec:
// - feedbackStats (rating moyen, total feedbacks)
// - dynamicDifficulty (ajustée selon feedbacks)
// - selectionWeight (pondération pour sélection)

const questions = questionsWeighted.questions.filter(
  q => q.feedbackStats && q.feedbackStats.averageRating > 2.5
);
```

### Analyser avec Python/Pandas

```python
import pandas as pd

# Charger les feedbacks
df = pd.read_csv('data/feedbacks.csv')

# Analyse par question
stats_by_question = df.groupby('questionId').agg({
    'rating': 'mean',
    'wasCorrect': 'mean'
}).sort_values('rating')

# Questions problématiques
problematic = stats_by_question[
    (stats_by_question['rating'] < 1.5) & 
    (stats_by_question['wasCorrect'] < 0.5)
]

print("Questions à retirer:", problematic.index.tolist())
```

---

## 🔐 Sécurité

- ✅ `.env.local` ajouté au `.gitignore`
- ✅ Variables KV sensibles non exposées
- ✅ Accès lecture seule possible (voir guide)

**⚠️ Ne jamais commit `.env.local` !**

---

## 🤖 Automatisation

### Cron job Vercel (exemple)

```typescript
// api/cron/daily-analysis.ts
import { dumpFeedbacks } from '../../scripts/kv_dump_feedbacks';
import { updateAdaptiveWeights } from '../../scripts/updateAdaptiveWeights';

export default async function handler(req: Request) {
  // Analyse quotidienne automatique
  await dumpFeedbacks();
  await updateAdaptiveWeights();
  
  // Envoyer rapport par email
  // ...
  
  return Response.json({ success: true });
}
```

---

## ✅ Checklist de mise en route

- [ ] Vercel KV configuré (voir `CONFIGURATION_KV_ETAPES.md`)
- [ ] Variables KV pullées : `vercel env pull .env.local`
- [ ] Test connexion : `npm run kv:test`
- [ ] Feedbacks collectés en production (tester l'app)
- [ ] Premier export : `npm run kv:dump`
- [ ] Première analyse : `npm run kv:analyze`

---

## 🎓 Cas d'usage avancés

### 1. Identifier questions à retirer

Questions mal notées avec beaucoup de feedbacks doivent être revues ou retirées.

### 2. Détecter questions trop faciles

Questions excellemment notées avec 100% de réussite peuvent être trop simples.

### 3. Prioriser génération IA

Domaines avec feedbacks faibles nécessitent plus de questions générées.

### 4. Valider efficacité pédagogique

Corréler rating des questions avec progression utilisateur.

---

## 🎉 Résultat

Vous avez maintenant un **système d'analyse complet** pour:

✅ Extraire les feedbacks de Vercel KV  
✅ Analyser la qualité des questions  
✅ Identifier les points d'amélioration  
✅ Ajuster automatiquement le moteur adaptatif  
✅ Déployer les améliorations en continu  

**Boucle d'amélioration continue opérationnelle !** 🚀

---

## 📚 Ressources

- **Guide complet:** `KV_ACCESS_GUIDE.md`
- **Config KV:** `CONFIGURATION_KV_ETAPES.md`
- **Documentation Vercel KV:** https://vercel.com/docs/storage/vercel-kv

---

**Prêt à analyser vos feedbacks !** 🔬

**Commande de démarrage:**
```bash
npm run kv:test
```

