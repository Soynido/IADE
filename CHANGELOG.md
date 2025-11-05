<<<<<<< HEAD
# Changelog

Toutes les modifications notables du projet sont documentées dans ce fichier.

## [1.1.0] - 2025-10-23

### 🎉 Nouveautés majeures

#### Agent OCR intégré
- **Conversion automatique** de PDFs et images en Markdown structuré
- **Support multi-formats** : PDF multi-pages, PNG, JPG, JPEG
- **OCR offline** avec Tesseract.js (langue française)
- **Prétraitement intelligent** des images (contraste, netteté, résolution)

#### Pipeline automatique
- **File watching** en temps réel sur le dossier `raw-materials/`
- **Détection automatique** des nouveaux fichiers
- **Compilation automatique** après OCR
- **Notifications desktop** pour informer de la fin du traitement

#### Formatage intelligent
- **Détection automatique** des titres, sous-titres
- **Conversion** des listes à puces et numérotées
- **Détection et formatage** des tableaux en Markdown
- **Préservation** de la structure du document

#### Détection de schémas
- **Mode interactif** pour confirmer les schémas détectés
- **Génération de templates Mermaid** (flowchart, graph, sequence)
- **Détection** des flèches ASCII et mots-clés (Figure, Schéma, etc.)

### ✨ Fonctionnalités

#### Scripts npm
- `npm run ocr` - Agent OCR avec options CLI
- `npm run ocr:batch-cours` - Traitement par lot des cours
- `npm run ocr:batch-2024` - Traitement par lot sujets 2024
- `npm run ocr:batch-2025` - Traitement par lot sujets 2025
- `npm run watch` - Watcher automatique
- `npm run test:ocr` - Test de l'installation

#### Structure
- Dossier `raw-materials/` pour les fichiers sources
- Dossier `scripts/lib/` pour les modules OCR
- Dossier `tmp/ocr-cache/` pour les fichiers temporaires

#### Modules OCR
- `ocr-engine.ts` - Moteur OCR avec Tesseract.js
- `pdf-processor.ts` - Conversion PDF → images
- `markdown-formatter.ts` - Formatage Markdown intelligent
- `diagram-detector.ts` - Détection et génération Mermaid

#### Documentation
- `raw-materials/README.md` - Guide complet d'utilisation
- `README.md` - Mise à jour avec section OCR
- `.ocrconfig.example.json` - Configuration exemple
- `CHANGELOG.md` - Ce fichier

### 📦 Dépendances ajoutées
- `tesseract.js@^6.0.1` - OCR
- `pdf2pic@^3.2.0` - Conversion PDF
- `sharp@^0.34.4` - Traitement d'images
- `inquirer@^12.10.0` - CLI interactif
- `commander@^14.0.1` - Parsing arguments
- `chokidar@^4.0.3` - File watching
- `node-notifier@^10.0.1` - Notifications
- `cli-progress@^3.12.0` - Barres de progression
- `ora@^9.0.0` - Spinners CLI

### 🔧 Améliorations
- Prétraitement automatique des images pour meilleure qualité OCR
- Nettoyage automatique des fichiers temporaires
- Logs détaillés et statistiques de traitement
- Gestion d'erreurs robuste avec retry

### 📝 Configuration
- `.gitignore` mis à jour pour ignorer `raw-materials/` (sauf README)
- Support de `.ocrconfig.json` pour personnaliser le watcher
- Mode dry-run pour tester sans écrire les fichiers

### 🐛 Corrections
- N/A (nouvelle fonctionnalité)

---

## [1.0.0] - 2025-10-XX

### Version initiale
- Application React + TypeScript + Vite
- Génération de questions à partir de Markdown
- Dashboard de progression
- Système de quiz interactif
- Support de 13 modules de cours
=======
# Changelog - Projet IADE

Tous les changements notables du projet IADE sont documentés ici.

## [v0.92] - 2025-10-28 - Cycle IADE-0 Autopilot

### ✅ Ajouté
- **Mode Autopilot RL3**: Exécution autonome de 6 tâches prioritaires
- **CourseReviewMode**: 3 parcours (Débutant, Intensif, Révision), 13 modules
- **ExamSimulationMode**: Timer 90 min, choix difficulté, post-exam détaillé
- **Knowledge Graph**: 42 noeuds, 102 liens sémantiques
- **Dashboard Analytics**: Prédiction réussite, Top 5 concepts à revoir
- **Générateurs Questions**: Architecture pluggable (Definition, QCM)
- **Reasoning Layer V3**: Patterns, Forecasts, ADRs, Integrity chain

### 🔧 Corrigé
- Export TypeScript générateurs (ES modules)
- Runtime error `AchievementsEngine.getAllAchievements`
- Vercel deployment 401 authentication

### 📊 Métriques
- Confiance: 0.87 → 0.92 (+0.05)
- Questions: 22 → 50 (+128%)
- Build size: 388KB (optimisé)
- Biais résolus: 4/5

### 🏷️ Tags
- `autopilot-IADE-v0.92`: Baseline Reasoning Layer V3

---

## [v0.87] - 2025-10-27 - Cycle IADE-0 Initial

### ✅ Ajouté
- Extraction PDF OCR (pipelines)
- Questions mockées (22 questions)
- Algorithmes cognitifs (Ebbinghaus + SM-2, Interleaving)
- Success Prediction Engine
- Spaced Repetition Engine
- UI 3 modes (Cours, Entraînement, Concours)
- Reasoning Layer V3 activation

### 📊 Métriques
- Confiance initiale: 0.87
- 284 events capturés
- 3 ADRs générés

---

## [Phase 0-2] - 2025-10-23 à 2025-10-26

### ✅ Complété
- Phase 0: Setup projet
- Phase 1: Extraction données (OCR, parsers)
- Phase 2: Algorithmes cognitifs
- 167 tâches complétées (67%)

### 📁 Structure
- `iade-app/`: Application React + TypeScript
- `scripts/`: Pipelines extraction + générateurs
- `.reasoning/`: Reasoning Layer V3 metadata

---

Pour plus de détails, voir:
- `docs/archive/` - Documentation historique
- `.reasoning/traces/` - Events détaillés
- `.reasoning/adrs/` - Décisions architecturales


>>>>>>> b118ac5872dd0f9436dffd7c2a2827edc888d4a9
