#!/bin/bash
# Script de vérification du déploiement Vercel + KV

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                                                                  ║"
echo "║        🔍 VÉRIFICATION DÉPLOIEMENT VERCEL + KV 🔍              ║"
echo "║                                                                  ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Récupérer l'URL de production
echo "📡 Récupération URL de production..."
PROD_URL=$(vercel ls 2>/dev/null | grep "Ready" | grep "Production" | head -1 | awk '{print $2}')

if [ -z "$PROD_URL" ]; then
  echo "❌ Aucun déploiement Ready trouvé"
  echo "   Attendre que le build soit terminé (vercel ls)"
  exit 1
fi

echo "✅ URL production: $PROD_URL"
echo ""

# Test 1: App accessible
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Application accessible"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL")

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ App accessible (HTTP $HTTP_CODE)"
else
  echo "⚠️  App retourne HTTP $HTTP_CODE"
fi
echo ""

# Test 2: API Feedback Stats
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: API Feedback Stats"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATS_RESPONSE=$(curl -s "$PROD_URL/api/feedback/stats?questionId=test")
STATS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$PROD_URL/api/feedback/stats?questionId=test")

if [ "$STATS_CODE" = "200" ]; then
  echo "✅ API Stats fonctionnelle (HTTP $STATS_CODE)"
  echo "   Réponse: $STATS_RESPONSE"
else
  echo "⚠️  API Stats retourne HTTP $STATS_CODE"
  if [ "$STATS_CODE" = "500" ]; then
    echo "   → Vercel KV probablement pas configuré"
    echo "   → L'app fonctionne quand même (localStorage)"
  fi
fi
echo ""

# Test 3: Variables d'environnement
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Variables d'environnement Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ENV_COUNT=$(vercel env ls 2>/dev/null | grep -c "KV_")

if [ "$ENV_COUNT" -ge "2" ]; then
  echo "✅ Variables KV détectées ($ENV_COUNT variables)"
  vercel env ls 2>/dev/null | grep "KV_"
else
  echo "⚠️  Variables KV non détectées"
  echo "   → Configurer KV via dashboard (CONFIGURATION_KV_ETAPES.md)"
fi
echo ""

# Résumé
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RÉSUMÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL Production: $PROD_URL"
echo "Status App: $HTTP_CODE"
echo "Status API: $STATS_CODE"
echo "Variables KV: $ENV_COUNT"
echo ""

if [ "$HTTP_CODE" = "200" ] && [ "$STATS_CODE" = "200" ] && [ "$ENV_COUNT" -ge "2" ]; then
  echo "🎉 SYSTÈME 100% OPÉRATIONNEL !"
  echo ""
  echo "✅ Tout fonctionne parfaitement:"
  echo "   • Application accessible"
  echo "   • API Feedback active"
  echo "   • Vercel KV configuré"
  echo ""
  echo "🎯 Prochaine étape: Tester en production"
  echo "   👉 $PROD_URL"
elif [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Application déployée avec succès !"
  echo ""
  echo "⚠️  Vercel KV pas encore configuré (optionnel)"
  echo "   • L'app fonctionne avec localStorage"
  echo "   • Pour activer KV: voir CONFIGURATION_KV_ETAPES.md"
else
  echo "⏳ Déploiement en cours..."
  echo "   Réessayer dans 1-2 minutes: bash scripts/verifyDeployment.sh"
fi
echo ""

