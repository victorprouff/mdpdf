# mdpdf - Convertisseur Markdown vers PDF

Outil en ligne de commande pour convertir vos fichiers Markdown en PDF professionnels avec votre charte graphique personnalisée.

## Installation

```bash
# Cloner ou télécharger le projet
cd mdpdf

# Installer les dépendances
npm install

# Installer globalement
npm link
```

## Configuration

Créez vos templates par défaut dans `~/.mdpdf/` :

```bash
mkdir -p ~/.mdpdf
cp logo.png ~/.mdpdf/
cp template.css ~/.mdpdf/
```

**Fichiers nécessaires :**
- `logo.png` : Votre logo (format PNG recommandé)
- `template.css` : Votre feuille de style personnalisée

## Utilisation

### Convertir un fichier

```bash
mdpdf document.md
```

### Convertir plusieurs fichiers

```bash
mdpdf doc1.md doc2.md doc3.md
```

### Convertir tous les fichiers .md du répertoire

```bash
mdpdf
```

### Utiliser un logo ou CSS personnalisé

```bash
mdpdf document.md --logo mon-logo.png --css mon-style.css
```

## Options

| Option | Description |
|--------|-------------|
| `--logo <chemin>` | Utiliser un logo personnalisé |
| `--css <chemin>` | Utiliser un CSS personnalisé |
| `--help`, `-h` | Afficher l'aide |

## Exemple de template CSS

```css
body {
    font-family: 'Segoe UI', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

h1 {
    color: #2C5F8D;
    font-size: 24pt;
    border-bottom: 3px solid #2C5F8D;
    padding-bottom: 10px;
}

table {
    border-collapse: collapse;
    width: 100%;
}

th, td {
    border: 1px solid #000;
    padding: 8px 12px;
}
```

## Fonctionnalités

- ✅ Header avec logo et date
- ✅ Footer personnalisable
- ✅ Support complet du Markdown (titres, listes, tableaux, liens)
- ✅ Liens cliquables dans le PDF
- ✅ Charte graphique CSS personnalisable
- ✅ Génération par lot

## Todo :

- [ ] Rajouter un repo pour les templates (~/.mdpdf)
- [ ] Rajouter dans ce répertoire un dossier themes contenant pour chaque thème un répertoire
    - [ ] Default
    - [ ] Formation (actuel)
    - [ ] Formation-Uneeti (actuel)

## Structure du PDF

- **Header** : Logo à gauche, date du jour à droite
- **Corps** : Contenu Markdown converti avec votre CSS
- **Footer** : Informations de contact (personnalisable dans le code)

## Personnalisation du footer

Éditez `bin/mdpdf.js`, section `footerTemplate` :

```javascript
footerTemplate: `
    <div style="width: 100%; text-align: center; font-size: 9px; color: #666;">
        Votre texte personnalisé
    </div>
`,
```
## Mise à jour

Pour toute mise à jour, il faut désinstaller le projet via le commande :

```bash
npm unlink mdpdf
```

Puis réinstallé le projet avec la commande :
```bash
npm link mdpdf
```
### Pour plus de simplicité, j'ai rajouté le raccourcis dans ma configuration zsh

```bash
alias mdpdf-reload="cd /chemin/complet/vers/votre/projet/mdpdf && ./reload.sh && cd -"
```

Un petit coup de `mdpdf-reload` n'importe où dans un terminal et c'est rechargé.

## Désinstallation

```bash
npm unlink mdpdf
```

## Dépendances

- [md-to-pdf](https://www.npmjs.com/package/md-to-pdf) - Conversion Markdown vers PDF
- [glob](https://www.npmjs.com/package/glob) - Recherche de fichiers

## License

MIT
```

Vous pouvez copier ce contenu dans un fichier `README.md` à la racine de votre projet ! 📄