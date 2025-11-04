# 🔬 Analyse Vercel KV - Guide Rapide

> **Interrogez et analysez les feedbacks Vercel KV directement depuis votre IDE**

---

## ⚡ Quick Start

### 1. Configuration (une fois)

```bash
# Pull variables KV localement
vercel env pull .env.local

# Tester connexion
npm run kv:test
```

### 2. Utilisation quotidienne

```bash
# Export feedbacks
npm run kv:dump

# Analyse détaillée
npm run kv:analyze

# Export CSV
npm run kv:export-csv
```

### 3. Amélioration moteur adaptatif

```bash
# Recalculer poids
npm run kv:update-weights

# Déployer
git add src/data/questions-weighted.json
git commit -m "chore: update adaptive weights"
git push
```

---

## 📦 Commandes disponibles

| Commande | Action |
|----------|--------|
| `npm run kv:test` | Tester connexion KV |
| `npm run kv:dump` | Exporter feedbacks → JSON |
| `npm run kv:analyze` | Analyser en détail |
| `npm run kv:export-csv` | Export CSV |
| `npm run kv:update-weights` | Ajuster difficultés |

---

## 📄 Fichiers générés

```
data/
├── feedbacks_dump.json         # Export brut
├── feedbacks_analysis.json     # Analyse complète
├── feedbacks.csv               # CSV Excel/Pandas
└── questions-weighted.json     # Dataset ajusté
```

---

## 📚 Documentation complète

- **Guide complet:** `KV_ACCESS_GUIDE.md`
- **Doc scripts:** `SCRIPTS_KV_READY.md`
- **Config KV:** `CONFIGURATION_KV_ETAPES.md`

---

## 🎯 Workflow recommandé

### Hebdomadaire

```bash
npm run kv:dump && npm run kv:analyze
```

### Mensuel

```bash
npm run kv:update-weights
git push
```

---

**Prêt à optimiser votre moteur adaptatif ! 🚀**

