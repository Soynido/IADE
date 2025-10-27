# 🧠 IADE Learning Core V2

**Plateforme d'apprentissage adaptatif intelligente pour la préparation au concours IADE 2025**

---

## 📋 Table des matières

- [🎯 Description](#-description)
- [✨ Fonctionnalités principales](#-fonctionnalités-principales)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation & Démarrage](#-installation--démarrage)
- [📊 Données & Contenu](#-données--contenu)
- [🎨 Technologies utilisées](#-technologies-utilisées)
- [📈 Fonctionnalités implémentées](#-fonctionnalités-implémentées)
- [🔮 Roadmap](#-roadmap)

---

## 🎯 Description

IADE Learning Core V2 est une application web moderne et intelligente conçue pour optimiser la préparation aux concours d'Infirmier Anesthésiste Diplômé d'État (IADE) 2025.

L'application combine :
- **Un moteur adaptatif intelligent** qui personnalise les questions selon les performances
- **Un système de gamification** pour maintenir la motivation
- **Un algorithme de répétition espacée** pour optimiser la mémorisation
- **Une interface moderne et intuitive** pour une expérience d'apprentissage fluide

---

## ✨ Fonctionnalités principales

### 🎓 Moteur d'apprentissage adaptatif V2

- **Génération intelligente** : Sélection automatique des questions selon le profil
- **Spaced Repetition** : Algorithme de répétition espacée pour optimiser la rétention
- **Adaptation dynamique** : Ajustement de la difficulté en temps réel
- **Priorisation** : Focus automatique sur les zones faibles
- **Variantes** : Génération automatique de variantes de questions (permutations, reformulations, distracteurs contextuels)

### 📊 Dashboard analytique

- **Score global** : CircularProgress animé avec pourcentage
- **Statistiques détaillées** : Sessions complétées, streak, moyenne
- **Progression** : Graphique d'évolution et trend +/-
- **Zones faibles** : Identification automatique des thèmes à renforcer
- **Historique** : Affichage des 5 dernières sessions

### 🏆 Système de gamification

- **10 Achievements** : Premiers pas, streak 7 jours, 100 questions, score parfait, etc.
- **4 Niveaux** : Bronze → Silver → Gold → Platinum
- **Notifications** : Toast animées lors du déblocage
- **Progression** : Tracking en temps réel de l'avancée

### 📚 Sessions de quiz

- **2 Modes** : Révision (feedback immédiat) & Simulation (timer + feedback final)
- **Interface élégante** : Cards avec tags multiples (thème, difficulté, points, pathologie)
- **Feedback détaillé** : Explications complètes avec la bonne réponse
- **Barre de progression** : Visualisation en temps réel de l'avancée

### 🎨 Design System cohérent

- **Palette IADE** : Couleurs standardisées (blue, green, purple, gray)
- **Components UI** : 8 composants réutilisables (Button, Card, Badge, Modal, etc.)
- **Animations** : 15+ animations fluides (fade, slide, shimmer, glow, etc.)
- **Responsive** : Adaptation mobile/tablet/desktop

---

## 🏗️ Architecture

### Structure du projet

```
iade-app/
├── src/
│   ├── components/
│   │   ├── ui/                    # Components atomiques réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── StatCard.tsx
│   │   ├── quiz/                  # Components de quiz
│   │   │   ├── QuestionCard.tsx
│   │   │   └── FeedbackModal.tsx
│   │   ├── dashboard/             # Dashboard
│   │   │   └── Dashboard.tsx
│   │   ├── layout/                # Layout & navigation
│   │   │   └── Layout.tsx
│   │   ├── QuizSessionV2.tsx      # Session de quiz refactorisée
│   │   └── QuizSession.tsx        # (Legacy)
│   ├── services/
│   │   ├── contentParser.ts       # Parser Markdown → Questions
│   │   ├── questionGenerator.ts   # Moteur adaptatif V1 (Legacy)
│   │   ├── questionGeneratorV2.ts # Moteur adaptatif V2 (avec variantes)
│   │   ├── variantGenerator.ts    # Générateur de variantes
│   │   ├── storageService.ts      # Gestion localStorage + versioning
│   │   └── achievementsEngine.ts  # Gestion des achievements
│   ├── types/
│   │   ├── pathology.ts           # Types de base (Question, UserStats, etc.)
│   │   ├── module.ts              # Types pour modules (CompiledQuestion, Module)
│   │   └── user.ts                # Types utilisateur (UserProfile, Achievement)
│   ├── data/
│   │   ├── modules/               # Fichiers Markdown sources (24 modules)
│   │   ├── pathologies.ts         # 16 pathologies hardcodées
│   │   ├── compiledQuestions.json # Questions compilées (générées au build)
│   │   └── modulesIndex.json      # Index des modules (généré au build)
│   ├── styles/
│   │   └── animations.css         # Animations et transitions
│   ├── App.tsx                    # Point d'entrée principal
│   └── main.tsx                   # Bootstrap React
├── scripts/
│   └── compileContent.ts          # Script de compilation Markdown
├── tailwind.config.js             # Configuration Tailwind + palette IADE
├── package.json
└── README.md
```

### Technologies

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 19, TypeScript 5.9 |
| **Build** | Vite 7, ESBuild |
| **Styling** | TailwindCSS 4, CSS3 |
| **Parsing** | Marked (Markdown), DOMPurify |
| **Storage** | localStorage (avec versioning) |
| **Routing** | React Router DOM 6 |
| **Utils** | date-fns |

### Flow de données

```
┌─────────────────────────────────────────────────────────────┐
│                    User Profile (localStorage)              │
│  • Stats: score, sessions, progression                      │
│  • Achievements: badges débloqués                           │
│  • Learning Path: modules complétés, zones faibles          │
│  • Questions Seen: IDs des questions vues                   │
│  • Questions To Review: planning spaced repetition          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            QuestionGeneratorV2 (Adaptive Engine)            │
│  1. Analyse le profil utilisateur                           │
│  2. Sélectionne le thème optimal                            │
│  3. Calcule la difficulté adaptée                           │
│  4. Enrichit avec variantes (VariantGenerator)              │
│  5. Priorise selon spaced repetition                        │
│  6. Retourne 10 questions optimales                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   QuizSessionV2 (UI)                        │
│  • Affiche questions avec QuestionCard                      │
│  • Collecte réponses + temps de réponse                     │
│  • Affiche feedback avec FeedbackModal                      │
│  • Track progression en temps réel                          │
│  • Sauvegarde résultats → StorageService                    │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│            AchievementsEngine (Gamification)                │
│  • Vérifie conditions de déblocage                          │
│  • Unlock achievements                                      │
│  • Calcule nouveau niveau (Bronze → Platinum)               │
│  • Affiche notifications Toast                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** : v20.19.5 (LTS recommandé)
- **npm** : v10+

### Installation

```bash
# 1. Cloner le projet
cd "/Users/valentingaludec/IADE /iade-app"

# 2. Installer les dépendances
npm install

# 3. Compiler le contenu (extraction des questions depuis Markdown)
npm run compile

# 4. Lancer en mode développement
npm run dev

# 5. Builder pour la production
npm run build

# 6. Prévisualiser la version de production
npm run preview
```

### Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Lance le serveur de développement (http://localhost:5173) |
| `npm run build` | Build de production (prebuild → compile → tsc → vite build) |
| `npm run compile` | Exécute le script de compilation Markdown → JSON |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Linting ESLint |

---

## 📊 Données & Contenu

### Modules inclus

**24 modules** de cours et sujets de concours :

#### Cours (13 modules)
1. Module 01 - Révision Neuro (2025)
2. Module 02 - Anatomie physiologie respiratoire (2018)
3. Module 03 - Pneumopathies (2020)
4. Module 04 - Cours concours IADE 2025 ✨ (34 questions)
5. Module 05 - Les Antalgiques (2025)
6. Module 06 - Les Antibiotiques (2025)
7. Module 07 - Les Benzodiazépines (2025)
8. Module 08 - Les Curares (2025)
9. Module 09 - Médicaments urgences (2024)
10. Module 10 - Normes biologiques
11. Module 11 - Les Anticoagulants (2025)
12. Module 12 - Hémovigilance (2025)
13. Module 13 - IRA (2020)

#### Sujets de concours
- **11 sujets** de concours 2024-2025

### Questions extraites

- **52 questions originales** extraites automatiquement
- **~100+ variantes générées** (permutations + reformulations + distracteurs)
- **Total : ~150 questions** disponibles dans le pool

### Pathologies couvertes

**16 pathologies** avec données structurées :
- Choc anaphylactique
- Arrêt cardiaque
- SDRA
- AVC
- OAP
- Asthme aigu grave
- Acidose métabolique sévère
- Traumatisme crânien
- Choc septique
- Hémorragie digestive
- Hémorragie obstétricale
- Et plus...

---

## 📈 Fonctionnalités implémentées

### ✅ Sprint 1 - Fondations & Architecture

- [x] Setup infrastructure (dépendances, structure dossiers)
- [x] Configuration Tailwind avec palette IADE
- [x] Parsing automatique Markdown → JSON
- [x] Script de compilation au build
- [x] 8 Components UI atomiques
- [x] Dashboard avec stats et progression
- [x] StorageService avec versioning
- [x] Types TypeScript exhaustifs
- [x] Layout responsive

### ✅ Sprint 2 - Intelligence & Gamification

- [x] QuestionGeneratorV2 avec adaptation intelligente
- [x] Spaced Repetition algorithm
- [x] Scoring par temps de réponse
- [x] Priorisation zones faibles
- [x] 10 Achievements définis
- [x] Toast notifications animées
- [x] QuizSessionV2 refactorisé (QuestionCard + FeedbackModal)
- [x] Modes Révision & Simulation
- [x] VariantGenerator (permutations + reformulations + distracteurs)
- [x] Écran de résultats avec CircularProgress

### 📊 Statistiques du projet

```
✅ Fichiers créés : 35+
✅ Lines of Code : ~5000+
✅ Components : 15
✅ Services : 5
✅ Types : 15+
✅ Questions : 52 originales + ~100 variantes
✅ Modules : 24
✅ Achievements : 10
✅ Animations : 15+
✅ Build time : ~1s
✅ Bundle size : 250KB (gzipped: 78KB)
```

---

## 🔮 Roadmap

### Version 1.1 (Nice-to-have)

- [ ] Recherche web (PubMed/Wikipedia) pour enrichir les explications
- [ ] Timer visuel pour mode simulation
- [ ] Graphiques de progression avancés (Chart.js)
- [ ] Export/Import profil utilisateur (JSON)
- [ ] Mode nuit (dark theme)

### Version 1.2 (Futur)

- [ ] Tests unitaires (Vitest)
- [ ] Tests E2E (Playwright)
- [ ] PWA avec service worker
- [ ] Mode hors-ligne complet
- [ ] Synchronisation cloud (Firebase/Supabase)
- [ ] Partage de scores

### Version 2.0 (Long terme)

- [ ] Backend Node.js + API REST
- [ ] Authentification utilisateur
- [ ] Classement global
- [ ] Mode collaboratif
- [ ] IA générative pour nouvelles questions (OpenAI/Claude)
- [ ] Analytics avancées

---

## 🎓 Notes techniques

### Performance

- **Build optimisé** : Code splitting, tree shaking, minification
- **Animations GPU** : Transform + opacity pour fluidité
- **Lazy loading** : Composants chargés à la demande
- **localStorage** : Cache local pour performances instantanées

### Accessibilité

- **Navigation clavier** : Tab, Enter, Escape
- **ARIA labels** : Étiquettes pour lecteurs d'écran
- **Contrastes** : WCAG AA compliant
- **Focus visible** : Indicateurs clairs

### Sécurité

- **Sanitization** : DOMPurify pour le contenu HTML
- **Versioning** : Migration automatique des données
- **Validation** : Types TypeScript stricts
- **No eval()** : Code sécurisé

---

## 📄 Licence

MIT License - Libre d'utilisation pour la préparation aux concours IADE.

---

## 🙏 Crédits

- **Corpus knowledge-pack** : Modules de cours et sujets de concours 2024-2025
- **Communauté IADE** : Retours et suggestions
- **Stack moderne** : React 19, Vite 7, TailwindCSS 4

---

## 📞 Support

Pour toute question ou suggestion :
- **Issues** : Ouvrir une issue sur le repo
- **Pull Requests** : Contributions bienvenues !

---

**IADE Learning Core V2** - Votre compagnon intelligent pour réussir le concours IADE 2025 ! 🚀🧠

*Dernière mise à jour : Octobre 2025*

