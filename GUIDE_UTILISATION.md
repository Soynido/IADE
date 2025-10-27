# 📘 Guide d'Utilisation - IADE Learning Core V2

## 🚀 Démarrage rapide

### Lancement de l'application

```bash
# 1. Démarrer le serveur de développement
cd "/Users/valentingaludec/IADE /iade-app"
npm run dev

# 2. Ouvrir dans le navigateur
# → http://localhost:5174/
```

---

## 🎯 Utilisation de l'application

### Première utilisation

1. **Page d'accueil (Dashboard)**
   - Affiche votre score global (0% au départ)
   - Affiche les statistiques : 0 sessions, 0 streak
   - Aucun achievement débloqué

2. **Démarrer une session**
   - Cliquez sur **"📚 Mode Révision"** pour commencer
   - Ou **"⏱️ Mode Simulation"** pour un mode chronométré (futur)

3. **Répondre aux questions**
   - 10 questions adaptatives générées automatiquement
   - Cliquez sur une option (A, B, C, D)
   - **Feedback immédiat** avec l'explication détaillée
   - Cliquez sur **"Continuer"** pour passer à la question suivante

4. **Résultats**
   - Score final affiché en % avec CircularProgress
   - Statistiques de la session
   - **Achievements débloqués** (Toast notifications)
   - Cliquez sur **"🔄 Nouvelle Session"** ou **"🏠 Dashboard"**

---

## 🎓 Fonctionnalités avancées

### Moteur adaptatif

L'algorithme analyse automatiquement :
- ✅ Votre **score moyen** → Ajuste la difficulté
- ✅ Votre **progression** → Augmente la complexité si +10%
- ✅ Vos **zones faibles** → Focus automatique sur les thèmes < 60%
- ✅ Vos **questions vues** → Évite les répétitions immédiates
- ✅ Votre **spaced repetition** → Planifie les révisions optimales

### Achievements (Gamification)

**10 achievements** à débloquer :

| Achievement | Condition | Icône |
|-------------|-----------|-------|
| Premier Pas | 1ère session complétée | 🎓 |
| Streak 7 jours | 7 jours consécutifs | 🔥 |
| Streak 30 jours | 30 jours consécutifs | 🏅 |
| Centurion | 100 questions réussies | ⭐ |
| Score Parfait | 100% dans une session | 🏆 |
| Apprenti Dévoué | 10 sessions | 📚 |
| Expert IADE | 50 sessions | 🎖️ |
| Progression +10% | Score +10% vs période précédente | 📈 |
| Niveau Or | Atteindre le niveau Or | 🥇 |
| Niveau Platine | Atteindre le niveau Platine | 💎 |

### Système de niveaux

| Niveau | Conditions |
|--------|-----------|
| 🥉 Bronze | Niveau de départ |
| 🥈 Silver | 15+ sessions ET score moyen ≥ 60% |
| 🥇 Gold | 30+ sessions ET score moyen ≥ 70% |
| 💎 Platinum | 50+ sessions ET score moyen ≥ 80% |

### Zones faibles

L'application identifie automatiquement vos zones faibles :
- **Critère** : Score < 60% dans un thème
- **Affichage** : Card orange sur le Dashboard
- **Action** : Priorisation automatique dans les prochaines sessions

---

## 🎨 Interface utilisateur

### Dashboard

```
┌────────────────────────────────────────────┐
│ 🧠 IADE Learning Core        💎 Platine   │
├────────────────────────────────────────────┤
│                                            │
│  [Score: 76%] [Sessions: 42] [Streak: 7j] │
│                                            │
│  ┌──────────┐  Votre Progression          │
│  │   76%    │                              │
│  │  Circle  │  Achievements  🏆 5/10       │
│  └──────────┘                              │
│                                            │
│  🎯 Zones à renforcer: Anesthésie         │
│                                            │
│  [📚 Mode Révision] [⏱️ Simulation]       │
│                                            │
│  Historique Récent:                        │
│  - Réanimation: 82% ✓ Réussi             │
│  - Urgences: 75% ✓ Réussi                │
└────────────────────────────────────────────┘
```

### Session de Quiz

```
┌────────────────────────────────────────────┐
│ Anesthésie • Moyen           45 pts       │
│ [████████░░░░░░] Question 8/10            │
├────────────────────────────────────────────┤
│                                            │
│  [QCM] [📍 Anesthésie] [🏥 Choc]         │
│  [⭐ 1 pts] [Moyen]                       │
│                                            │
│  Quel est le traitement de 1ère ligne... ?│
│                                            │
│  ┌─────────────────────────────────┐      │
│  │ [A] Adrénaline IM 0.5mg        │      │
│  ├─────────────────────────────────┤      │
│  │ [B] Corticoïdes IV             │      │
│  ├─────────────────────────────────┤      │
│  │ [C] Antihistaminiques          │      │
│  └─────────────────────────────────┘      │
└────────────────────────────────────────────┘
```

### Feedback Modal

```
┌──────────────────────┐
│       ✓              │
│     Correct !        │
│    +1 point          │
│                      │
│  💡 Explication      │
│  L'adrénaline IM...  │
│                      │
│  [Continuer]         │
└──────────────────────┘
```

---

## 🎨 Mode Sombre (Dark Mode)

### Activation du mode sombre

L'application **supporte nativement le dark mode** via les classes Tailwind `dark:`.

Pour forcer le mode sombre dans le navigateur :
1. **Chrome/Edge** : DevTools → Rendering → Emulate CSS media `prefers-color-scheme: dark`
2. **Firefox** : DevTools → Settings → Appearance → Dark
3. **Safari** : Develop → Experimental Features → Dark Mode

**Note** : Un toggle manuel dark/light sera ajouté dans une future version (V1.1).

### Couleurs en mode sombre

| Élément | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `gray-50` | `gray-900` |
| Cards | `white` | `gray-800` |
| Texte principal | `gray-900` | `gray-100` |
| Texte secondaire | `gray-600` | `gray-400` |
| Bordures | `gray-200` | `gray-700` |

---

## 📊 Données & Statistiques

### Stockage local

Toutes vos données sont sauvegardées dans **localStorage** :
- ✅ **Profil utilisateur** : Stats, achievements, préférences
- ✅ **Historique** : 10 dernières sessions
- ✅ **Questions vues** : IDs des questions déjà répondues
- ✅ **Planning révision** : Dates de révision spaced repetition

### Export de profil

Pour exporter votre profil (future feature) :
```javascript
// Console navigateur
import { StorageService } from './services/storageService';
const profile = StorageService.exportProfile();
console.log(profile); // Copier le JSON
```

### Reset des données

Pour recommencer à zéro :
```javascript
// Console navigateur
localStorage.clear();
// Puis recharger la page
```

---

## 🔧 Paramètres avancés

### Modes de session

#### 📚 Mode Révision
- **Feedback** : Immédiat après chaque question
- **Timer** : Pas de limite de temps
- **Explication** : Affichée pour chaque réponse
- **Objectif** : Apprendre et comprendre

#### ⏱️ Mode Simulation (à venir)
- **Feedback** : À la fin de la session
- **Timer** : 2 minutes par question
- **Explication** : Affichée à la fin
- **Objectif** : S'entraîner aux conditions d'examen

### Préférences (dans localStorage)

```typescript
preferences: {
  showTimer: boolean,          // Afficher le timer
  feedbackDelay: number,       // Délai avant feedback (ms)
  dailyGoal: number,           // Objectif de sessions/jour
}
```

---

## 🐛 Dépannage

### L'application ne charge pas

**Solution** : Vérifier que le serveur de développement est lancé
```bash
cd "/Users/valentingaludec/IADE /iade-app"
npm run dev
```

### Aucune question ne s'affiche

**Cause** : Les fichiers Markdown n'ont pas été compilés

**Solution** :
```bash
npm run compile   # Force la compilation
npm run build     # Rebuild complet
```

### Les stats ne se sauvegardent pas

**Cause** : localStorage bloqué ou plein

**Solution** :
1. Vérifier que localStorage est activé dans le navigateur
2. Nettoyer l'espace : `localStorage.clear()`
3. Vérifier les erreurs dans la console

### Build échoue

**Solution** :
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

---

## 📈 Conseils pour progresser

### Stratégie optimale

1. **Régularité** : 1-2 sessions par jour minimum (streak 🔥)
2. **Variété** : Alternez les thèmes pour une couverture complète
3. **Focus** : Travaillez vos zones faibles identifiées
4. **Révision** : Suivez les recommandations de spaced repetition

### Objectifs recommandés

| Objectif | Critère de réussite |
|----------|---------------------|
| **Court terme** | Score moyen ≥ 70% |
| **Moyen terme** | Niveau Gold + Streak 30 jours |
| **Long terme** | Niveau Platinum + All achievements |

### Interprétation des scores

| Score | Signification | Action |
|-------|---------------|--------|
| **< 50%** | Révision nécessaire | Relire les cours, ralentir |
| **50-69%** | En progression | Continuer, focus zones faibles |
| **70-89%** | Bon niveau | Maintenir, augmenter difficulté |
| **≥ 90%** | Excellence | Prêt pour l'examen ! |

---

## 🎯 Checklist avant l'examen

- [ ] **Niveau atteint** : Minimum Gold (30+ sessions, 70% moyenne)
- [ ] **Tous les thèmes** : Score ≥ 60% dans chaque thème
- [ ] **Achievements** : Au moins 7/10 débloqués
- [ ] **Streak** : Minimum 14 jours consécutifs
- [ ] **Questions vues** : Au moins 100+ questions
- [ ] **Mode simulation** : Testé plusieurs fois avec succès

---

## 📞 Support

### En cas de problème

1. **Console navigateur** : F12 → Console (vérifier les erreurs)
2. **localStorage** : F12 → Application → Local Storage
3. **Network** : F12 → Network (vérifier le chargement des ressources)

### Logs utiles

```javascript
// Voir le profil actuel
console.log(localStorage.getItem('iade_user_profile'));

// Voir les questions compilées
import compiledQuestions from './data/compiledQuestions.json';
console.log(compiledQuestions.length);

// Voir les modules
import modulesIndex from './data/modulesIndex.json';
console.log(modulesIndex);
```

---

## 🎓 Bon courage pour le concours IADE 2025 !

**Stratégie gagnante** :
1. 📚 Révisez régulièrement (streak ++)
2. 🎯 Travaillez vos zones faibles
3. 📈 Suivez votre progression
4. 🏆 Débloquez tous les achievements
5. 💪 Maintenez un score ≥ 70%

---

**IADE Learning Core V2** - Votre partenaire pour réussir ! 🚀

*Dernière mise à jour : Octobre 2025*

