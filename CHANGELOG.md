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
