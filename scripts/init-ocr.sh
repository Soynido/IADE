#!/bin/bash

# Script d'initialisation de l'agent OCR
# Usage: ./scripts/init-ocr.sh

set -e

echo "🚀 Initialisation de l'agent OCR IADE..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Vérifier Node.js
echo "📦 Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "💡 Installez Node.js 20+ depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "⚠️  Node.js version $NODE_VERSION détectée"
    echo "💡 Version 20+ recommandée"
else
    echo "✅ Node.js $(node -v)"
fi

# 2. Installer les dépendances
echo ""
echo "📥 Installation des dépendances..."
npm install

# 3. Créer les dossiers
echo ""
echo "📁 Création de la structure..."
mkdir -p raw-materials/cours
mkdir -p raw-materials/concours-2024
mkdir -p raw-materials/concours-2025
mkdir -p tmp/ocr-cache
mkdir -p src/data/modules

echo "✅ Structure créée"

# 4. Créer les fichiers .gitkeep
touch raw-materials/cours/.gitkeep
touch raw-materials/concours-2024/.gitkeep
touch raw-materials/concours-2025/.gitkeep

# 5. Copier la config exemple
if [ ! -f ".ocrconfig.json" ]; then
    if [ -f ".ocrconfig.example.json" ]; then
        cp .ocrconfig.example.json .ocrconfig.json
        echo "✅ Fichier .ocrconfig.json créé"
    fi
fi

# 6. Tester l'installation
echo ""
echo "🧪 Test de l'installation..."
npm run test:ocr

# 7. Afficher les instructions
echo ""
echo "${GREEN}════════════════════════════════════════════════${NC}"
echo "${GREEN}✅ Installation terminée avec succès !${NC}"
echo "${GREEN}════════════════════════════════════════════════${NC}"
echo ""
echo "${BLUE}📚 Prochaines étapes :${NC}"
echo ""
echo "1️⃣  Placer vos PDFs/images dans :"
echo "   ${YELLOW}raw-materials/cours/${NC}"
echo "   ${YELLOW}raw-materials/concours-2024/${NC}"
echo "   ${YELLOW}raw-materials/concours-2025/${NC}"
echo ""
echo "2️⃣  Démarrer le watcher automatique :"
echo "   ${YELLOW}npm run watch${NC}"
echo ""
echo "3️⃣  Ou traiter manuellement :"
echo "   ${YELLOW}npm run ocr -- --input raw-materials/cours/fichier.pdf${NC}"
echo ""
echo "4️⃣  Lancer l'application :"
echo "   ${YELLOW}npm run dev${NC}"
echo ""
echo "${BLUE}📖 Documentation :${NC}"
echo "   - Guide rapide : ${YELLOW}QUICKSTART.md${NC}"
echo "   - Guide complet : ${YELLOW}raw-materials/README.md${NC}"
echo "   - Implémentation : ${YELLOW}OCR_IMPLEMENTATION.md${NC}"
echo ""
echo "${GREEN}🎓 Bonne préparation au concours IADE !${NC}"
echo ""

