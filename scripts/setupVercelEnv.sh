#!/bin/bash
# Script pour configurer les variables Upstash Redis sur Vercel

echo "🔧 Configuration des variables Vercel pour Upstash Redis"
echo ""

# Variables à configurer
UPSTASH_URL="https://full-crab-26762.upstash.io"
UPSTASH_TOKEN="AWiKAAIncDI0ZWFhNDNjYzA0N2I0NmI4YTQ0ZjU5OGJiNGY4OGY3YnAyMjY3NjI"
UPSTASH_READ_ONLY="AmiKAAIgcDL1u7xQ8IUSdYlSitRatMfZNMkD0Ir1cZt5GmDTR1OzZA"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Ajout des variables Upstash Redis à Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Méthode manuelle recommandée
echo "✋ Configuration manuelle recommandée :"
echo ""
echo "1. Ouvrir: https://vercel.com/valentin-galudec-s-projects/iade-app/settings/environment-variables"
echo ""
echo "2. Ajouter ces 3 variables (Production + Preview + Development):"
echo ""
echo "   Variable 1:"
echo "   Name:  UPSTASH_REDIS_REST_URL"
echo "   Value: $UPSTASH_URL"
echo ""
echo "   Variable 2:"
echo "   Name:  UPSTASH_REDIS_REST_TOKEN"
echo "   Value: $UPSTASH_TOKEN"
echo ""
echo "   Variable 3 (optionnel):"
echo "   Name:  UPSTASH_REDIS_REST_READ_ONLY_TOKEN"
echo "   Value: $UPSTASH_READ_ONLY"
echo ""
echo "3. Save → Redeploy automatique"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ou via CLI (interactif)
echo "💡 Alternative CLI (interactif):"
echo ""
echo "   echo '$UPSTASH_URL' | vercel env add UPSTASH_REDIS_REST_URL"
echo "   echo '$UPSTASH_TOKEN' | vercel env add UPSTASH_REDIS_REST_TOKEN"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Après configuration:"
echo "   → Vercel redéploiera automatiquement"
echo "   → Les Edge Functions auront accès à Redis"
echo "   → Durée: ~2-3 minutes"
echo ""

