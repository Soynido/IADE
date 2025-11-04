# 🚀 Quick Start - IADE Adaptive Learning Engine

## ⚡ Démarrage rapide (2 minutes)

### 1. Installation (première fois)

```bash
cd "/Users/valentingaludec/IADE /iade-app"
npm install
```

### 2. Lancer l'application

```bash
npm run dev
```

Ouvrir: http://localhost:5173

### 3. Tester les nouvelles fonctionnalités

#### A. Feedback Loop
1. Démarrer une révision
2. Répondre à une question
3. Après la correction, noter la qualité: 👎 👍 ou 🌟
4. Observer le message "Merci pour votre feedback !"

#### B. Moteur Adaptatif
1. Compléter 3-5 sessions pour construire le profil
2. Retourner au Dashboard
3. Voir section "Profil d'Apprentissage" apparaître
4. Observer la difficulté s'adapter

#### C. Viewer PDF
1. Pendant une session, si "📖 Voir le cours" apparaît, cliquer
2. Modal PDF s'ouvre (si PDF disponible dans public/pdfs/)
3. Naviguer avec ← et →

---

## 📊 Dashboardineau

### Nouvelles sections

**Qualité du Contenu** (si feedbacks > 0):
- Satisfaction moyenne (0-3)
- Nombre de feedbacks donnés
- Votre contribution

**Profil d'Apprentissage** (si sessions ≥ 3):
- Niveau actuel (Facile/Intermédiaire/Difficile)
- Taux de réussite global
- Domaines à renforcer (rouge si < 60%)
- Performance détaillée par domaine

---

## 🔧 Configuration Vercel (Production)

### Étape 1: Créer Vercel KV

Dashboard Vercel → Storage → Create KV Database → Link to project

### Étape 2: Uploader PDFs

```bash
mkdir -p public/pdfs
cp "raw-materials/Concours IADE"/*.pdf public/pdfs/
```

### Étape 3: Déployer

```bash
git add .
git commit -m "feat: adaptive learning engine"
git push
```

### Étape 4: Tester

```bash
# Test API feedback
curl https://votre-app.vercel.app/api/feedback/stats?questionId=1-1

# Devrait retourner:
# {"questionId":"1-1","averageRating":0,"totalFeedbacks":0,"lastUpdated":"..."}
```

---

## 💡 Tips & Astuces

### Réinitialiser le profil

```javascript
// Console navigateur (F12)
localStorage.clear();
location.reload();
```

### Voir les feedbacks stockés

```javascript
// Console navigateur
const feedbacks = JSON.parse(localStorage.getItem('iade_feedbacks_v1'));
console.table(feedbacks.feedbacks);
```

### Forcer une difficulté

```javascript
// Console navigateur
const profile = JSON.parse(localStorage.getItem('iade_user_profile_v1'));
profile.adaptiveProfile = {
  accuracyRate: 0.95, // Force difficulté "hard"
  targetDifficulty: 'hard',
  domainPerformance: {},
  lastUpdated: new Date().toISOString()
};
localStorage.setItem('iade_user_profile_v1', JSON.stringify(profile));
location.reload();
```

---

## 🐛 Dépannage

### Problème: Build échoue

```bash
# Nettoyer et rebuilder
rm -rf node_modules dist
npm install
npm run build
```

### Problème: PDF ne charge pas

Vérifier que le fichier existe:
```bash
ls -la public/pdfs/
```

### Problème: Feedback ne s'enregistre pas

Vérifier localStorage:
```javascript
console.log(localStorage.getItem('iade_feedbacks_v1'));
console.log(localStorage.getItem('iade_user_id'));
```

---

## 📖 Documentation complète

- **IMPLEMENTATION_COMPLETE.md** - Synthèse complète
- **ADAPTIVE_ENGINE_IMPLEMENTATION.md** - Architecture détaillée
- **PIPELINE_QA_GUIDE.md** - Guide pipeline Q/A

---

🎉 **Bon apprentissage avec IADE Adaptive Engine !**

