# 📁 Raw Materials - Guide d'utilisation

Ce dossier contient les **fichiers sources** (PDFs, images) qui seront convertis en fichiers Markdown structurés via l'agent OCR.

## 📂 Structure

```
raw-materials/
├── cours/              # Cours et supports pédagogiques
├── concours-2024/      # Sujets de concours 2024
└── concours-2025/      # Sujets de concours 2025
```

## 🚀 Utilisation rapide

### Méthode 1 : Mode automatique (recommandé)

1. **Démarrer le watcher** :
   ```bash
   npm run watch
   ```

2. **Glisser-déposer** vos fichiers dans le bon sous-dossier :
   - Cours → `raw-materials/cours/`
   - Sujets 2024 → `raw-materials/concours-2024/`
   - Sujets 2025 → `raw-materials/concours-2025/`

3. **Le pipeline se déclenche automatiquement** :
   - OCR du fichier
   - Génération du Markdown
   - Compilation des questions
   - Notification de fin

### Méthode 2 : Mode manuel

**Traiter un fichier unique** :
```bash
npm run ocr -- --input raw-materials/cours/anatomie.pdf
```

**Traiter un dossier complet** :
```bash
# Tous les cours
npm run ocr:batch-cours

# Tous les sujets 2024
npm run ocr:batch-2024

# Tous les sujets 2025
npm run ocr:batch-2025
```

**Compiler ensuite les questions** :
```bash
npm run compile
```

## 📝 Formats supportés

- **PDFs** : `.pdf` (multi-pages supportées)
- **Images** : `.png`, `.jpg`, `.jpeg`, `.webp`

## 🎯 Conventions de nommage

Pour de meilleurs résultats, nommez vos fichiers de manière descriptive :

✅ **Bon** :
- `anatomie_respiratoire_2025.pdf`
- `pharmacologie_antalgiques.pdf`
- `sujet_concours_lille_2024.pdf`

❌ **À éviter** :
- `scan_001.pdf`
- `IMG_1234.jpg`
- `document.pdf`

## ⚙️ Options avancées

### Traiter un fichier avec options

```bash
# Spécifier la catégorie manuellement
npm run ocr -- --input fichier.pdf --category concours_2024

# Personnaliser le nom de sortie
npm run ocr -- --input fichier.pdf --output module_custom.md

# Mode dry-run (aperçu sans sauvegarde)
npm run ocr -- --input fichier.pdf --dry-run

# Mode non-interactif (skip confirmations schémas)
npm run ocr -- --input fichier.pdf --no-interactive
```

### Configuration du watcher

Créer un fichier `.ocrconfig.json` à la racine :

```json
{
  "watchEnabled": true,
  "debounceMs": 2000,
  "autoCompile": true,
  "notifications": true,
  "ignorePatterns": ["*.tmp", "*.processing"]
}
```

## 🔍 Détection de schémas

L'agent détecte automatiquement les schémas dans vos documents :
- Flèches (→, ⇒, etc.)
- Mots-clés ("Figure", "Schéma", "Diagramme")
- Structures hiérarchiques

En **mode interactif**, vous serez invité à :
1. Confirmer si vous voulez un diagramme Mermaid
2. Choisir le type (flowchart, graph, sequence)

Le template Mermaid généré devra être ajusté manuellement.

## 📊 Résultats

Les fichiers Markdown générés sont automatiquement placés dans :
```
src/data/modules/
```

Avec le format de nommage :
- `module_XXXXXX_nom_fichier.md` (pour les cours)
- `sujet_XXXXXX_nom_fichier.md` (pour les concours)

## 🧹 Nettoyage

Les fichiers temporaires sont automatiquement nettoyés après traitement dans :
```
tmp/ocr-cache/
```

## 🐛 Dépannage

### L'OCR ne fonctionne pas

**Vérifier l'installation** :
```bash
npm install
```

**Tester avec un fichier simple** :
```bash
npm run ocr -- --input raw-materials/cours/test.pdf --dry-run
```

### Qualité OCR médiocre

**Améliorer la source** :
- Scanner en **300 DPI minimum**
- Utiliser des **images nettes** et **contrastées**
- Éviter les documents **trop sombres** ou **trop clairs**

**Le prétraitement automatique** améliore :
- Contraste
- Netteté
- Résolution

### Erreur sur un PDF

Certains PDFs protégés ou avec une structure complexe peuvent échouer.

**Solutions** :
1. Convertir le PDF en images (PNG) manuellement
2. Utiliser un outil externe pour "aplatir" le PDF
3. Re-scanner le document si possible

### Le watcher ne détecte pas les fichiers

**Vérifier** :
1. Le watcher est bien démarré : `npm run watch`
2. Les fichiers sont dans le bon dossier
3. Les extensions sont supportées (`.pdf`, `.png`, `.jpg`)
4. Pas de pattern d'ignore dans `.ocrconfig.json`

## 💡 Conseils

1. **Organiser par catégorie** : Respectez la structure des sous-dossiers
2. **Fichiers clairs** : Préférez les scans haute qualité
3. **Mode interactif** : Utilisez-le pour les diagrammes importants
4. **Vérifier après** : Relire les Markdown générés pour ajuster si nécessaire

## 📚 Workflow complet

```
1. Recevoir un cours/sujet (PDF ou image)
   ↓
2. Le placer dans raw-materials/cours/ (ou concours-2024/2025/)
   ↓
3. Le watcher détecte automatiquement
   ↓
4. OCR + extraction du texte
   ↓
5. Formatage Markdown intelligent
   ↓
6. Détection schémas (avec confirmation)
   ↓
7. Sauvegarde dans src/data/modules/
   ↓
8. Compilation automatique (génération questions)
   ↓
9. ✅ Questions disponibles dans l'application !
```

## 🔗 Liens utiles

- [Documentation Tesseract.js](https://tesseract.projectnaptha.com/)
- [Syntaxe Mermaid](https://mermaid.js.org/)
- [Markdown Guide](https://www.markdownguide.org/)

---

**🤝 Besoin d'aide ?**  
Consultez les logs dans la console ou créez une issue sur le repository.

