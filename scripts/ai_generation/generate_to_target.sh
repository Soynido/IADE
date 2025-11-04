#!/bin/bash
# Génère des questions jusqu'à atteindre la cible de 200

TARGET=200
BATCH_SIZE=20
MAX_ITERATIONS=20

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║        🎯 GÉNÉRATION CONTINUE VERS $TARGET QUESTIONS 🎯           ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

source venv/bin/activate

for ((iteration=1; iteration<=MAX_ITERATIONS; iteration++)); do
    # Compter questions actuelles
    current=$(grep -c '"id"' src/data/compiledQuestions.json 2>/dev/null || echo 0)
    
    if [ $current -ge $TARGET ]; then
        echo "✅ OBJECTIF ATTEINT: $current questions (cible $TARGET)"
        break
    fi
    
    remaining=$((TARGET - current))
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 ITÉRATION $iteration/$MAX_ITERATIONS"
    echo "📊 Actuel: $current | Objectif: $TARGET | Reste: $remaining"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Générer
    echo "🧠 Génération $BATCH_SIZE questions..."
    python scripts/ai_generation/generate_batch.py $BATCH_SIZE 2>&1 | grep -E "(🧠|✅|❌|📊)"
    
    # Valider
    echo "🔍 Validation..."
    python scripts/ai_generation/validate_batch.py 2>&1 | grep -E "(Score:|Acceptées:|Score moyen:)"
    
    # Fusionner
    echo "🔗 Fusion..."
    npm run ai:merge 2>&1 | grep -E "(Ajoutées:|Total:)"
    
    # Afficher progression
    new_current=$(grep -c '"id"' src/data/compiledQuestions.json 2>/dev/null || echo 0)
    added=$((new_current - current))
    progress=$((new_current * 100 / TARGET))
    
    echo "✅ +$added questions | Total: $new_current/$TARGET ($progress%)"
    echo ""
    
    # Pause entre itérations
    sleep 1
done

final=$(grep -c '"id"' src/data/compiledQuestions.json 2>/dev/null || echo 0)

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ GÉNÉRATION TERMINÉE ✅                      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 RÉSULTAT FINAL: $final questions"
echo ""

if [ $final -ge $TARGET ]; then
    echo "🎉 OBJECTIF ATTEINT ! $final ≥ $TARGET"
    echo ""
    echo "💾 Sauvegarde du dataset de production..."
    mkdir -p data/training
    cp src/data/questions-validated.json data/training/QA_IADE_v1_$(date +%Y%m%d).json
    echo "✅ Dataset sauvegardé: data/training/QA_IADE_v1_$(date +%Y%m%d).json"
else
    echo "⚠️ Objectif non atteint: $final/$TARGET"
    echo "   Relancez le script pour continuer"
fi

