#!/usr/bin/env python3
"""
Script Python pour récupérer les feedbacks depuis Vercel KV

Utilisation:
    python scripts/kv_fetch_feedbacks.py

Sortie: data/feedbacks_dump.json

Nécessite:
    pip install requests python-dotenv
"""

import json
import os
import sys
from datetime import datetime
from collections import defaultdict

try:
    import requests
    from dotenv import load_dotenv
except ImportError:
    print("❌ Dépendances manquantes")
    print("   Installer: pip install requests python-dotenv")
    sys.exit(1)

# Charger les variables d'environnement
load_dotenv()

KV_REST_API_URL = os.getenv("KV_REST_API_URL")
KV_REST_API_TOKEN = os.getenv("KV_REST_API_TOKEN")

if not KV_REST_API_URL or not KV_REST_API_TOKEN:
    print("❌ Variables KV non configurées")
    print("   Vérifier .env.local ou variables Vercel")
    sys.exit(1)

def fetch_feedbacks():
    """Récupérer tous les feedbacks depuis Vercel KV"""
    print("🔄 Récupération des feedbacks depuis Vercel KV...\n")
    
    headers = {
        "Authorization": f"Bearer {KV_REST_API_TOKEN}"
    }
    
    # Récupérer la liste complète
    url = f"{KV_REST_API_URL}/lrange/feedbacks:all/0/-1"
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        feedbacks_raw = data.get("result", [])
        
        print(f"📊 {len(feedbacks_raw)} feedbacks trouvés\n")
        
        # Parser les feedbacks JSON
        feedbacks = []
        for f in feedbacks_raw:
            try:
                feedback = json.loads(f) if isinstance(f, str) else f
                feedbacks.append(feedback)
            except json.JSONDecodeError:
                print(f"⚠️  Feedback invalide ignoré: {f}")
        
        print(f"✅ {len(feedbacks)} feedbacks valides parsés\n")
        
        # Sauvegarder
        output_file = "data/feedbacks_dump.json"
        os.makedirs("data", exist_ok=True)
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(feedbacks, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Feedbacks exportés: {output_file}\n")
        
        # Statistiques
        analyze_stats(feedbacks)
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur réseau: {e}")
        sys.exit(1)

def analyze_stats(feedbacks):
    """Afficher statistiques rapides"""
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("STATISTIQUES GLOBALES")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
    
    total = len(feedbacks)
    avg_rating = sum(f['rating'] for f in feedbacks) / total
    
    distribution = {
        'bad': len([f for f in feedbacks if f['rating'] == 1]),
        'good': len([f for f in feedbacks if f['rating'] == 2]),
        'veryGood': len([f for f in feedbacks if f['rating'] == 3])
    }
    
    print(f"Total feedbacks:     {total}")
    print(f"Moyenne rating:      {avg_rating:.2f}/3\n")
    print(f"👎 Peu utile (1):    {distribution['bad']} ({distribution['bad']/total*100:.1f}%)")
    print(f"👍 Utile (2):        {distribution['good']} ({distribution['good']/total*100:.1f}%)")
    print(f"🌟 Excellente (3):   {distribution['veryGood']} ({distribution['veryGood']/total*100:.1f}%)\n")
    
    unique_users = len(set(f['userId'] for f in feedbacks))
    unique_questions = len(set(f['questionId'] for f in feedbacks))
    
    print(f"Utilisateurs uniques: {unique_users}")
    print(f"Questions notées:     {unique_questions}")
    print(f"Feedbacks/user:       {total/unique_users:.1f}\n")
    
    # Questions problématiques (rating < 1.5)
    by_question = defaultdict(list)
    for f in feedbacks:
        by_question[f['questionId']].append(f['rating'])
    
    problematic = []
    for qid, ratings in by_question.items():
        avg = sum(ratings) / len(ratings)
        if avg < 1.5 and len(ratings) >= 3:  # Au moins 3 feedbacks
            problematic.append((qid, avg, len(ratings)))
    
    if problematic:
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("⚠️  QUESTIONS À AMÉLIORER (rating < 1.5)")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
        
        for qid, avg, count in sorted(problematic, key=lambda x: x[1])[:5]:
            print(f"   {qid}: {avg:.2f}/3 ({count} feedbacks)")
        print()
    
    print("✅ Analyse terminée !")

if __name__ == "__main__":
    fetch_feedbacks()

