#!/bin/bash

# Script pour lancer l'extraction des PDFs avec logs détaillés

echo "🚀 Lancement de l'extraction des PDFs IADE..."
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "⏱️  Durée estimée : 15-20 minutes pour 141 pages"
echo "📊 Les logs seront affichés en temps réel"
echo ""

cd "$(dirname "$0")/.."

npx tsx scripts/pipelines/pipelineManager.ts

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ Extraction terminée !"
echo ""
echo "📁 Fichiers générés dans: src/data/concours/"
echo ""

