#!/bin/bash
# Script orchestrateur pour génération massive par batches de 10

TOTAL_CONCEPTS=50
BATCH_SIZE=10
LOG_DIR="logs"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$LOG_DIR"

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║      🚀 GÉNÉRATION MASSIVE - MODE PRODUCTION 🚀                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Configuration:"
echo "   • Total concepts: $TOTAL_CONCEPTS"
echo "   • Taille batch: $BATCH_SIZE"
echo "   • Retry max: 2"
echo "   • Modèle: Mistral 7B"
echo "   • Validation: BioBERT médical (Q+R complète ✨)"
echo ""

# Activer venv Python
source venv/bin/activate

# Compteurs
total_generated=0
total_validated=0
total_merged=0

# Boucle sur batches de 10
for ((i=0; i<$TOTAL_CONCEPTS; i+=$BATCH_SIZE)); do
    batch_num=$((i / BATCH_SIZE + 1))
    remaining=$((TOTAL_CONCEPTS - i))
    current_batch=$((remaining < BATCH_SIZE ? remaining : BATCH_SIZE))
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 BATCH $batch_num/$((TOTAL_CONCEPTS / BATCH_SIZE)) — $current_batch concepts"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # 1. Génération
    echo "🧠 Génération..."
    python scripts/ai_generation/generate_batch.py $current_batch 2>&1 | tee "$LOG_DIR/gen_batch_${batch_num}_${TIMESTAMP}.log"
    
    # Compter succès
    gen_success=$(grep -c "✅ Question générée" "$LOG_DIR/gen_batch_${batch_num}_${TIMESTAMP}.log" || echo 0)
    total_generated=$((total_generated + gen_success))
    
    # 2. Validation (avec validation Q+R complète)
    echo "🔍 Validation Q+R..."
    python scripts/ai_generation/validate_batch.py --with-answers 2>&1 | tee "$LOG_DIR/val_batch_${batch_num}_${TIMESTAMP}.log"
    
    # Compter validées
    val_success=$(grep "Acceptées:" "$LOG_DIR/val_batch_${batch_num}_${TIMESTAMP}.log" | grep -o '[0-9]\+' | head -1 || echo 0)
    total_validated=$((total_validated + val_success))
    
    # 3. Fusion
    echo "🔗 Fusion..."
    npm run ai:merge 2>&1 | tee "$LOG_DIR/merge_batch_${batch_num}_${TIMESTAMP}.log"
    
    # Compter fusionnées
    merge_success=$(grep "Ajoutées:" "$LOG_DIR/merge_batch_${batch_num}_${TIMESTAMP}.log" | grep -o '[0-9]\+' || echo 0)
    total_merged=$((total_merged + merge_success))
    
    echo "✅ Batch $batch_num terminé: $gen_success générées → $val_success validées → $merge_success fusionnées"
    
    # Pause entre batches pour éviter surcharge
    if [ $i -lt $((TOTAL_CONCEPTS - BATCH_SIZE)) ]; then
        echo "⏸️ Pause 2s..."
        sleep 2
    fi
done

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ GÉNÉRATION TERMINÉE ✅                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 RÉSUMÉ FINAL:"
echo "   • Questions générées: $total_generated"
echo "   • Questions validées: $total_validated"
echo "   • Questions fusionnées: $total_merged"
echo ""
echo "📁 Logs sauvegardés dans: $LOG_DIR/"
echo ""
echo "🚀 Prochaine étape: npm run dev"

