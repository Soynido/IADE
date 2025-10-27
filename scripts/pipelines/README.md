# Pipeline d'Extraction - Knowledge Learning Engine IADE

## Description

Ce pipeline extrait et structure les contenus des PDFs de cours et annales pour alimenter le Knowledge Learning Engine.

## Architecture Modulaire

- **baseExtractor.ts** : Extraction OCR + nettoyage du texte brut
- **courseParser.ts** : Parsing des cours (chapitres → sections → concepts)
- **annalesParser.ts** : Parsing des annales (questions QCM/QROC/Cas)
- **correctionParser.ts** : Parsing des corrections associées
- **pipelineManager.ts** : Orchestration automatique du processus

## Utilisation

### Extraction complète des PDFs

```bash
# Depuis la racine iade-app
./scripts/runExtraction.sh

# OU directement
npx tsx scripts/pipelines/pipelineManager.ts
```

### Fichiers générés

Les fichiers JSON structurés seront créés dans `src/data/concours/` :
- `cours-complet.json` - Cours complet structuré
- `annales-volume-1.json` - Annales Volume 1 (base)
- `annales-volume-2.json` - Annales Volume 2 (intermédiaire)

## Durée estimée

- **Prepaconcoursiade-Complet.pdf** (74 pages) : ~8-10 min
- **annalescorrigées-Volume-1.pdf** (31 pages) : ~4-5 min
- **annalescorrigées-Volume-2.pdf** (36 pages) : ~4-5 min

**Total : 15-20 minutes** pour les 141 pages

## Notes

- Les PDFs source sont dans `raw-materials/Concours IADE/`
- L'extraction utilise Tesseract.js pour l'OCR
- Le processus nettoie automatiquement les artefacts OCR
- Les images temporaires sont supprimées après extraction

