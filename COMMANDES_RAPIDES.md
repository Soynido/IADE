# ⚡ Commandes Rapides - IADE Learning Core V2

## 🚀 Développement

### Démarrer l'application

```bash
cd "/Users/valentingaludec/IADE /iade-app"
npm run dev
```

➜ **URL** : http://localhost:5174/

### Build de production

```bash
npm run build
```

### Prévisualiser le build

```bash
npm run preview
```

---

## 🔧 Maintenance

### Recompiler le contenu Markdown

```bash
npm run compile
```

Génère :
- `src/data/compiledQuestions.json` (52 questions)
- `src/data/modulesIndex.json` (24 modules)

### Linting

```bash
npm run lint
```

### Nettoyer et réinstaller

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📊 Statistiques du projet

### Fichiers générés

```bash
# Compter les fichiers créés
find src -type f | wc -l
# → ~40 fichiers

# Lignes de code TypeScript
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l
# → ~5000 lignes
```

### Taille du build

```bash
ls -lh dist/assets/
# index.css : 42KB (gzipped: 7.6KB)
# index.js : 272KB (gzipped: 78KB)
```

### Questions extraites

```bash
# Voir le nombre de questions compilées
cat src/data/compiledQuestions.json | grep '"id"' | wc -l
# → 52 questions
```

---

## 🐛 Debugging

### Console navigateur

```javascript
// Voir le profil utilisateur
const profile = JSON.parse(atob(localStorage.getItem('iade_user_profile')));
console.log(profile);

// Voir toutes les questions compilées
fetch('/src/data/compiledQuestions.json')
  .then(r => r.json())
  .then(q => console.log(q.length + ' questions'));

// Reset le profil
localStorage.clear();
location.reload();
```

### Logs de compilation

```bash
# Voir les logs détaillés de compilation
npm run compile 2>&1 | tee compilation.log
```

### Hot Reload

Le serveur Vite supporte le **Hot Module Replacement** (HMR) :
- Modification d'un fichier `.tsx` → Reload instantané
- Modification d'un fichier `.css` → Reload instantané
- Modification d'un fichier `.ts` → Rebuild automatique

---

## 📁 Structure des fichiers

### Fichiers principaux

```
iade-app/
├── src/
│   ├── components/
│   │   ├── ui/              # 8 components atomiques
│   │   ├── quiz/            # QuestionCard + FeedbackModal
│   │   ├── dashboard/       # Dashboard
│   │   ├── layout/          # Layout
│   │   ├── QuizSessionV2.tsx
│   │   └── QuizSession.tsx  # (Legacy)
│   ├── services/
│   │   ├── contentParser.ts
│   │   ├── questionGeneratorV2.ts
│   │   ├── variantGenerator.ts
│   │   ├── storageService.ts
│   │   └── achievementsEngine.ts
│   ├── types/               # 3 fichiers de types
│   ├── data/
│   │   ├── modules/         # 24 fichiers MD
│   │   ├── compiledQuestions.json  # Généré
│   │   └── modulesIndex.json       # Généré
│   └── styles/
│       └── animations.css
├── scripts/
│   └── compileContent.ts
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

---

## 🎨 Commandes utiles pour le développement

### Ajouter un nouveau module

```bash
# 1. Copier le fichier MD dans src/data/modules/
cp /path/to/module.md src/data/modules/

# 2. Recompiler
npm run compile

# 3. Vérifier l'extraction
cat src/data/compiledQuestions.json | grep "module_name"
```

### Modifier les couleurs IADE

```javascript
// tailwind.config.js
colors: {
  iade: {
    blue: { 500: '#NOUVELLE_COULEUR' },
    // ...
  }
}
```

Puis :
```bash
# Rebuild pour appliquer
npm run build
```

### Ajouter un achievement

```javascript
// src/services/achievementsEngine.ts
const ACHIEVEMENTS_DEFINITIONS = [
  // ...
  {
    id: 'new_achievement',
    title: 'Nouveau Achievement',
    description: 'Description',
    icon: '🎖️',
    target: 100,
  },
];
```

---

## 📈 Métriques de performance

### Lighthouse (recommandé)

```bash
# Installer Lighthouse
npm install -g lighthouse

# Analyser le build
npm run build
npm run preview
lighthouse http://localhost:4173 --view
```

**Objectifs** :
- Performance : ≥ 90
- Accessibility : ≥ 90
- Best Practices : ≥ 90
- SEO : ≥ 80

### Bundle Analyzer

```bash
# Installer l'analyseur
npm install -D rollup-plugin-visualizer

# Analyser le bundle
npm run build
# → Ouvrir dist/stats.html
```

---

## 🔐 Sécurité

### Audit des dépendances

```bash
npm audit
```

### Fix automatique

```bash
npm audit fix
```

---

## 🌐 Déploiement

### GitHub Pages

```bash
# 1. Build
npm run build

# 2. Commit le dossier dist
git add dist -f
git commit -m "chore: update build"

# 3. Deploy
git subtree push --prefix dist origin gh-pages
```

### Netlify / Vercel

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (aucune requise)
```

---

## ⚙️ Variables d'environnement (futures)

Pour l'instant, l'application est **100% statique** (pas de variables d'environnement).

Future V2.0 avec backend :

```env
VITE_API_URL=https://api.iade-learning.com
VITE_FIREBASE_API_KEY=...
VITE_ENABLE_ANALYTICS=true
```

---

## 🎯 Shortcuts clavier (futurs)

| Touche | Action |
|--------|--------|
| `Espace` | Continuer (après feedback) |
| `1-4` | Sélectionner réponse A-D |
| `Enter` | Valider la réponse |
| `Esc` | Retour au Dashboard |
| `?` | Aide contextuelle |

---

## 📞 Support rapide

### Logs utiles

```bash
# Voir les erreurs Vite
npm run dev 2>&1 | grep ERROR

# Voir les warnings
npm run build 2>&1 | grep WARN

# Tester TypeScript uniquement
npx tsc --noEmit
```

### Reset complet

```bash
# Clean total
rm -rf node_modules package-lock.json dist src/data/*.json
npm install
npm run compile
npm run build
npm run dev
```

---

## 🎓 Commandes de test (futures)

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

---

**Aide-mémoire** - Gardez ce fichier à portée de main ! 📌

