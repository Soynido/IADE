# 🔧 Guide Configuration Vercel KV (5 minutes)

## 📋 Instructions pas-à-pas

### Étape 1: Accéder au Dashboard Vercel

```
👉 https://vercel.com/dashboard
```

**Vous devriez voir:**
- Liste de vos projets
- Projet "IADE" ou similaire

---

### Étape 2: Sélectionner le projet

**Cliquer sur votre projet IADE**

Vous arrivez sur la page Overview avec:
- Derniers deployments
- Onglets: Deployments, Analytics, Settings, Storage, etc.

---

### Étape 3: Créer la base KV

**Cliquer sur l'onglet "Storage"**

Vous voyez:
- "Create Database"
- Liste vide (si première fois)

**Cliquer "Create Database"**

---

### Étape 4: Sélectionner KV (Redis)

**Options disponibles:**
- ✅ **KV** (choisir celle-ci)
- Postgres
- Blob
- Edge Config

**Configuration:**
```
Name:      iade-feedbacks
Region:    iad1 (Washington, D.C., USA)
           (ou eu-central-1 si Europe préféré)
```

**Cliquer "Create"**

⏱️ Création: ~10 secondes

---

### Étape 5: Connecter au projet

**Après création, vous voyez:**
```
Database created successfully! ✅
```

**Bouton "Connect to Project" apparaît**

**Cliquer "Connect to Project"**

**Sélectionner:**
- Project: IADE (ou votre nom de projet)
- Environment: Production + Preview + Development (tout cocher)

**Cliquer "Connect"**

---

### Étape 6: Variables auto-injectées ✅

**Vercel génère automatiquement:**

```bash
KV_REST_API_URL=https://xxx-xxx.kv.vercel-storage.com
KV_REST_API_TOKEN=Axxx_xxxxxxxxxxxxx
```

**Ces variables sont:**
- ✅ Automatiquement ajoutées à votre projet
- ✅ Disponibles dans tous les environnements
- ✅ Sécurisées (token non visible en clair)

**Vous POUVEZ:**
- Voir dans Settings → Environment Variables

**Vous N'AVEZ PAS BESOIN:**
- De les copier manuellement
- De les configurer dans .env
- De rebuilder manuellement

---

### Étape 7: Redéploiement automatique

**Vercel détecte les nouvelles variables et redéploie automatiquement**

Vous verrez dans Deployments:
```
🔄 Building...
   └─ Installing dependencies
   └─ Building application
   └─ Uploading assets
✅ Ready (2-3 minutes)
```

---

## ✅ Vérification rapide

### Test 1: KV Database active

```
Dashboard Vercel → Storage → iade-feedbacks
```

**Devrait afficher:**
- Status: Active ✅
- Region: iad1
- Connected to: IADE (votre projet)

### Test 2: Variables présentes

```
Settings → Environment Variables
```

**Devrait contenir:**
- `KV_REST_API_URL` (Production, Preview, Development)
- `KV_REST_API_TOKEN` (Production, Preview, Development)

### Test 3: Déploiement terminé

```
Deployments → Latest
```

**Devrait afficher:**
- Status: ✅ Ready
- URL: `https://votre-projet.vercel.app`

---

## 🧪 Test de l'API Feedback

### En ligne de commande

```bash
# Test stats API
curl "https://votre-projet.vercel.app/api/feedback/stats?questionId=test"

# Devrait retourner:
{
  "questionId": "test",
  "averageRating": 0,
  "totalFeedbacks": 0,
  "lastUpdated": "2025-11-04T..."
}
```

### Dans l'application

1. **Ouvrir** `https://votre-projet.vercel.app`
2. **Cliquer** "Démarrer révision"
3. **Répondre** à une question
4. **Noter** avec 👍 ou 🌟
5. **Vérifier** console navigateur (F12)
   - Network → Appel POST `/api/feedback` → Status 200 ✅

---

## 🐛 Troubleshooting

### Problème: "KV_REST_API_URL is not defined"

**Cause:** KV Database pas connectée au projet

**Solution:**
1. Storage → iade-feedbacks → "Connect to Project"
2. Sélectionner IADE
3. Redéployer: Deployments → ... → Redeploy

---

### Problème: API retourne 500

**Cause:** Variables KV pas injectées

**Solution:**
1. Settings → Environment Variables
2. Vérifier KV_REST_API_URL et TOKEN présents
3. Si absents: Storage → Reconnect Database

---

### Problème: Deployment échoue

**Vérifier Build Logs:**
```
Deployments → Latest → View Build Logs
```

**Erreurs possibles:**
- PDFs trop gros (> 100 MB) → Compresser
- @vercel/kv manquant → `npm install @vercel/kv`

---

## ✅ Checklist finale

Après configuration KV, vérifier:

- [ ] Dashboard Vercel → Storage → iade-feedbacks (Active ✅)
- [ ] Settings → Env Vars → KV_REST_API_URL (présent ✅)
- [ ] Settings → Env Vars → KV_REST_API_TOKEN (présent ✅)
- [ ] Deployments → Latest → Ready ✅
- [ ] App accessible sur URL production ✅
- [ ] Test feedback fonctionne ✅

---

## 🎯 Vous êtes prêt !

Une fois ces 7 étapes complétées:

```
✅ IADE Adaptive Learning Engine v1.1.0 est en PRODUCTION !
```

**Prochaine étape:**
- Tester en production
- Partager avec beta users
- Commencer à collecter des feedbacks réels

---

**Temps total:** 5-10 minutes  
**Difficulté:** Facile (interface guidée)  
**Support:** [Vercel KV Documentation](https://vercel.com/docs/storage/vercel-kv)

---

🚀 **Bon déploiement !**

