#!/bin/bash

PDF_DIR="raw-materials"
OUTPUT_DIR="data/extracted"

mkdir -p "$OUTPUT_DIR"

# Extraction du cours complet
python scripts/extraction/extractWithUnstructured.py \
  "$PDF_DIR/cours/Prepaconcoursiade-Complet.pdf" \
  "$OUTPUT_DIR/cours-semantic.json"

python scripts/extraction/extractWithPyMuPDF.py \
  "$PDF_DIR/cours/Prepaconcoursiade-Complet.pdf" \
  "$OUTPUT_DIR/cours-layout.json"

python scripts/extraction/mergeExtractions.py \
  "$OUTPUT_DIR/cours-semantic.json" \
  "$OUTPUT_DIR/cours-layout.json" \
  "src/data/cours-enriched.json"

echo "✅ Extraction complète terminée"

