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

### Utiliser un template spécifique

```bash
mdpdf document.md --template qualiopi
```

### Orientation paysage

```bash
mdpdf document.md --landscape
```

### Sans header ni footer

```bash
mdpdf document.md --no-header --no-footer
```

## Options

| Option | Description |
|--------|-------------|
| `--template <nom>` | Utiliser un template spécifique (défaut: `default`) |
| `--no-header` | Désactiver le header |
| `--no-footer` | Désactiver le footer |
| `--no-logo` | Désactiver le logo |
| `--landscape` | Orientation paysage (défaut: portrait) |
| `--output <fichier>` | Chemin du fichier PDF de sortie |
| `--list-templates` | Lister les templates disponibles |
| `--help`, `-h` | Afficher l'aide |

## Front Matter YAML

Vous pouvez configurer les options directement dans l'en-tête YAML de chaque fichier Markdown. Cela permet une configuration par fichier, sans avoir à passer les options en CLI.

### Exemple

```markdown
---
template: formation
landscape: true
header: show
footer: hidden
logo: hidden
output: mon-document.pdf
---

# Mon document

Contenu du document...
```

### Clés supportées

| Clé | Type | Valeurs | Description |
|-----|------|---------|-------------|
| `template` | string | nom du template | Template à utiliser |
| `landscape` | boolean | `true` / `false` | Orientation paysage |
| `header` | string | `show` / `hidden` | Afficher ou masquer le header |
| `footer` | string | `show` / `hidden` | Afficher ou masquer le footer |
| `logo` | string | `show` / `hidden` | Afficher ou masquer le logo |
| `output` | string | chemin du fichier | Chemin du PDF de sortie |

### Priorité de fusion

Les options sont fusionnées selon la priorité suivante :

```
défaut < front matter < CLI explicite
```

- Les **valeurs par défaut** s'appliquent toujours (template `default`, portrait, header/footer activés)
- Le **front matter** du fichier écrase les valeurs par défaut
- Seules les options **explicitement passées en CLI** écrasent le front matter

**Exemple :** un fichier avec `header: show` dans le front matter, lancé avec `--no-header`, aura le header désactivé (la CLI gagne).

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
- ✅ Orientation paysage/portrait
- ✅ Front matter YAML pour configuration par fichier
- ✅ Fusion intelligente des options (défaut < front matter < CLI)

## Todo :

- [x] Rajouter un repo pour les templates (~/.mdpdf)
- [x] Rajouter dans ce répertoire un dossier themes contenant pour chaque thème un répertoire
    - [x] Formation (actuel)
    - [x] Default
    - [ ] Formation-Uneeti (actuel)
- [x] Pouvoir choisir le thème via un paramètre --template formation
- [x] Gérer l'orientation (paysage/portrait)
- [x] Ajouter des propriétés dans le markdown pour indiquer le theme, l'orientation, faire disparaitre ou apparaitre header, footer, logo (pour gérer des cas particulier)
- [x] Du coup nouveau comportement :
    - Si on n'indique aucun paramètre : Il export tous les fichiers .md du dossier courant en .pdf avec theme indiqué dans les paramètres du .md
    - Si on indique un ou plusieurs fichier en particulier : il le ou les convertis en .pdf avec thème et propriété indiqué dans les paramètres du .md
    - Si paramètre indiqué, surcharge le paramètre indiqué dans fichier .md
    - Si aucun paramètre indiqué, prends valeur par défaut (thème default, portrait, sans logo etc.)
- [ ] Améliorer rendu des citations [!INFO] [!WARNING] etc
- [x] Extraire Header et Footer dans le thème pour pouvoir les configurer par thèmes

### Projet annexe : MdPdf Template Builder
- [ ] Visualiser le rendu live de ce que donne un template donné à partir d'un .md d'exemple comprenant tous types de balise md
    - Respecter le format de la page (A4) et le style CSS
    - Chaque modification dans le css doit être appliqué en live
- [ ] Rajouter un panneau à gauche avec les titres avec possibilité de changer la taille, la couleur et le centrage qui s'applique au fichier css et au rendu de droite en live
- [ ] Activer/désactiver la présence des header/footer
- [ ] Pouvoir custom le header/footer en les divisants en 3 parties : droite, centre, gauche, ajouter une image, sa position, marge au bord, texte, taille de texte à chaque partie, italique, gras, pouvoir rajouter des infos normée (nom du doc, numéro de page (format : X ou X/Y ou Page : X), date, etc)
- [ ] Style de texte dans le body (taille, couleur etc)
- [ ] Format doc (A4), taille des marges
- [ ] Activer ou non le sommaire, modifier son style
- [ ] ...

## Structure du PDF

- **Header** : Logo à gauche, date du jour à droite (configurable par template)
- **Corps** : Contenu Markdown converti avec votre CSS
- **Footer** : Informations de contact (configurable par template)

## Personnalisation des templates

Chaque template est un dossier contenant :

```
mon-template/
├── header.html       # Template du header (variables : {{LOGO}}, {{DATE}})
├── footer.html       # Template du footer (variables : {{LOGO}}, {{DATE}})
├── template.css      # Styles CSS
└── logo.png          # Logo (optionnel)
```

Les templates sont cherchés dans cet ordre :
1. `~/.mdpdf/templates/<nom>/` (templates utilisateur)
2. `./templates/<nom>/` (templates du projet)

Pour créer un nouveau template :

```bash
mkdir -p ~/.mdpdf/templates/mon-template
# Puis ajoutez vos fichiers header.html, footer.html, template.css, logo.png
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
- [gray-matter](https://www.npmjs.com/package/gray-matter) - Parsing du front matter YAML
