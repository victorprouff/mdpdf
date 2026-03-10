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

| Option                    | Description                                         |
| ------------------------- | --------------------------------------------------- |
| `--template <nom>`        | Utiliser un template spécifique (défaut: `default`) |
| `--data <fichier.json>`   | Données JSON pour le rendu Handlebars du `template.md` |
| `--no-header`             | Désactiver le header                                |
| `--no-footer`             | Désactiver le footer                                |
| `--no-logo`               | Désactiver le logo                                  |
| `--toc-start <n>`         | Niveau de titre minimum dans le sommaire, 1-6 (défaut: 1) |
| `--toc-depth <n>`         | Niveau de titre maximum dans le sommaire, 1-6 (défaut: 3) |
| `--landscape`             | Orientation paysage (défaut: portrait)              |
| `--output <fichier>`      | Chemin du fichier PDF de sortie                     |
| `--list-templates`        | Lister les templates disponibles                    |
| `--help`, `-h`            | Afficher l'aide                                     |

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
toc-start: 2
toc-depth: 4
page-break-before: 2
output: mon-document.pdf
---

# Mon document

Contenu du document...
```

### Clés supportées

| Clé         | Type    | Valeurs           | Description                   |
| ----------- | ------- | ----------------- | ----------------------------- |
| `template`  | string  | nom du template   | Template à utiliser           |
| `landscape` | boolean | `true` / `false`  | Orientation paysage           |
| `header`    | string  | `show` / `hidden` | Afficher ou masquer le header |
| `footer`    | string  | `show` / `hidden` | Afficher ou masquer le footer |
| `logo`      | string  | `show` / `hidden` | Afficher ou masquer le logo   |
| `toc-start` | number  | `1` - `6`         | Niveau de titre min du sommaire (défaut: 1) |
| `toc-depth` | number  | `1` - `6`         | Niveau de titre max du sommaire (défaut: 3) |
| `page-break-before` | string  | `1,3`         | Saut de page avant les titres des niveaux listés (ex: 1,3) |
| `output`    | string  | chemin du fichier | Chemin du PDF de sortie       |

### Priorité de fusion

Les options sont fusionnées selon la priorité suivante :

```
défaut < front matter < CLI explicite
```

- Les **valeurs par défaut** s'appliquent toujours (template `default`, portrait, header/footer activés)
- Le **front matter** du fichier écrase les valeurs par défaut
- Seules les options **explicitement passées en CLI** écrasent le front matter

**Exemple :** un fichier avec `header: show` dans le front matter, lancé avec `--no-header`, aura le header désactivé (la CLI gagne).

## Alertes GitHub-style

Les alertes sont des blockquotes spéciales qui produisent un encadré coloré dans le PDF.

### Syntaxe

```markdown
> [!NOTE]
> Contenu de la note.

> [!WARNING] **Titre personnalisé**
>
> Contenu avec du **markdown** et du `code`.
```

### Types supportés

| Syntaxe        | Couleur | Description           |
| -------------- | ------- | --------------------- |
| `[!NOTE]`      | Bleu    | Information générale  |
| `[!TIP]`       | Vert    | Astuce                |
| `[!IMPORTANT]` | Violet  | Point important       |
| `[!WARNING]`   | Orange  | Avertissement         |
| `[!CAUTION]`   | Rouge   | Danger                |
| `[!INFO]`      | Bleu    | Alias de NOTE         |
| `[!DANGER]`    | Rouge   | Alias de CAUTION      |

Un titre personnalisé peut être ajouté après le type (ex: `> [!INFO] **Rappel**`). Le markdown inline (gras, italique, code, liens) est supporté dans le titre et le contenu.

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

## Table des matières

Insérez la balise `[[toc]]` dans votre fichier Markdown pour générer automatiquement un sommaire à cet emplacement.

### Syntaxe

```markdown
# Mon document

[[toc]]

## Première section
### Sous-section 1.1
## Deuxième section
### Sous-section 2.1
```

Le sommaire est généré avec des liens cliquables vers chaque section. Il s'affiche dans un encadré stylisé avec indentation par niveau.

### Configuration de la profondeur

Par défaut, le sommaire inclut les niveaux h1 à h3. Vous pouvez ajuster la plage avec `toc-start` (niveau minimum) et `toc-depth` (niveau maximum).

**Exemples :**

```markdown
---
toc-start: 2
toc-depth: 4
---
```

Cela génère un sommaire contenant les h2, h3 et h4 (le h1 est exclu).

Depuis la CLI :

```bash
mdpdf document.md --toc-start 2 --toc-depth 4
```

Si la balise `[[toc]]` n'est pas présente dans le fichier, aucun sommaire n'est généré.

## Séparateur et saut de page

| Syntaxe | Résultat |
| ------- | -------- |
| `---`   | Séparateur visuel (ligne horizontale) |
| `===`   | Saut de page |

```markdown
# Première section

Contenu de la première section...

---

Suite de la même page, avec un séparateur visuel au-dessus.

===

# Deuxième section (nouvelle page)

Contenu de la deuxième section...
```

> **Note :** La ligne `===` doit être précédée d'une ligne vide pour être interprétée comme saut de page (et non comme un titre de niveau 1 en syntaxe setext Markdown).

## Images

Les images sont automatiquement centrées dans le PDF. Les images locales sont embarquées en base64.

### Redimensionnement (format Obsidian)

Utilisez un nombre comme texte alternatif pour définir la largeur en pixels, compatible avec la syntaxe Obsidian :

```markdown
![500](./schema.png)
```

L'image sera centrée et affichée avec une largeur de 500px.

### Alt text avec largeur

Vous pouvez combiner un texte alternatif et une largeur avec la syntaxe `alt|largeur` :

```markdown
![Mon schéma|500](./schema.png)
```

L'image sera centrée, affichée avec une largeur de 500px et `alt="Mon schéma"`.

### Exemples

| Markdown | Résultat |
| --- | --- |
| `![500](./img.png)` | Centrée, largeur 500px |
| `![Mon schéma\|500](./img.png)` | Centrée, largeur 500px, alt="Mon schéma" |
| `![Mon schéma](./img.png)` | Centrée, taille naturelle, alt="Mon schéma" |
| `![](./img.png)` | Centrée, taille naturelle |

## Templates dynamiques (Handlebars)

L'option `--data <fichier.json>` permet de générer un PDF à partir d'un template Markdown avec des données dynamiques injectées via [Handlebars](https://handlebarsjs.com/).

### Fonctionnement

- **Sans fichier `.md`** : mdpdf cherche automatiquement `template.md` dans le dossier du template sélectionné (`~/.mdpdf/templates/<nom>/template.md`)
- **Avec un fichier `.md`** : ce fichier est utilisé comme template Handlebars

Le front matter YAML de `template.md` est toujours parsé normalement (pour les options `template`, `landscape`, etc.). Le rendu Handlebars s'applique uniquement sur le corps du document, après extraction du front matter.

### Exemple

`~/.mdpdf/templates/feuille-presence/template.md` :

```markdown
---
template: feuille-presence
landscape: true
---

# Feuille de présence — {{type_formation}}

| **Date** | {{date}} |
| **Lieu** | {{lieu}} |
| **Formateur** | {{formateur}} |

| **N°** | **NOM Prénom** | **Entreprise** |
|:---:|:---|:---|
{{#each participants}}
| {{num}} | {{nom_prenom}} | {{entreprise}} |
{{/each}}
```

`data.json` :

```json
{
  "type_formation": "Management",
  "date": "10 mars 2026",
  "lieu": "Paris",
  "formateur": "Jean Dupont",
  "participants": [
    { "num": 1, "nom_prenom": "MARTIN Sophie", "entreprise": "Acme" },
    { "num": 2, "nom_prenom": "DURAND Paul", "entreprise": "Beta Corp" }
  ]
}
```

Commande :

```bash
mdpdf --template feuille-presence --data data.json --output sortie.pdf
```

Toute la syntaxe Handlebars est supportée : `{{variable}}`, `{{#each}}`, `{{#if}}`, helpers, etc.

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
- ✅ GitHub-style Alerts (`[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`, `[!INFO]`, `[!DANGER]`)
- ✅ Table des matières avec `[[toc]]` (profondeur configurable)
- ✅ Séparateur visuel avec `---`, saut de page avec `===`
- ✅ Images centrées avec redimensionnement Obsidian (`![largeur](path)`)
- ✅ Templates dynamiques via Handlebars (`--data data.json`)

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
├── template.md       # Template Markdown Handlebars (optionnel, pour --data)
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

## Référence CSS des templates

Le fichier `template.css` d'un template peut surcharger tous les sélecteurs ci-dessous. Le CSS du template est chargé **après** le CSS interne de `md-to-pdf`, donc vos règles ont priorité.

> **Note :** `md-to-pdf` injecte son propre `markdown.css` avec `table { display: block; width: 100% }`. Pour que les tableaux soient correctement centrés, déclarez toujours `display: table; width: auto` dans votre template.

---

### `@page` — mise en page

```css
@page {
    size: A4;                  /* A4, A5, Letter, ou dimensions explicites */
    margin-top: 25mm;
    margin-bottom: 20mm;
    margin-left: 15mm;
    margin-right: 15mm;
}
```

Les marges définies ici sont lues par `mdpdf` pour calculer l'espace réservé au header et footer Puppeteer. Si cette règle est absente, les valeurs par défaut sont appliquées (`25mm / 20mm / 15mm / 15mm`).

---

### Éléments de base

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `body` | Corps du document (police, taille, couleur, interligne) |
| `h1` … `h6` | Titres de niveau 1 à 6 |
| `p` | Paragraphes |
| `a` | Liens hypertextes |
| `strong` | Texte en gras |
| `em` | Texte en italique |
| `hr` | Séparateur horizontal (`---` en Markdown) |

```css
body {
    font-family: 'Segoe UI', sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

h1 { color: #2C5F8D; font-size: 24pt; }
h2 { color: #2C5F8D; font-size: 18pt; }
h3 { color: #4A90E2; font-size: 14pt; }

a {
    color: #153644;
    text-decoration: underline;
}

hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0;
}
```

---

### Listes

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `ul`, `ol` | Listes non-ordonnées / ordonnées |
| `li` | Élément de liste (tous niveaux) |
| `ul > li` | Élément de premier niveau |
| `ul > li > ul > li` | Élément imbriqué (second niveau) |
| `ul > li > ul` | Sous-liste imbriquée |

```css
ul > li { margin-bottom: 8px; }
ul > li > ul { margin-top: 4px; }
ul > li > ul > li { margin-bottom: 4px; }
```

---

### Tableaux

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `table` | Tableau entier |
| `th` | En-tête de colonne |
| `td` | Cellule de données |
| `th, td` | En-têtes et cellules (ensemble) |
| `tr:nth-child(even)` | Lignes paires (alternance de couleur) |

```css
table {
    border-collapse: collapse;
    display: table;      /* obligatoire pour surcharger md-to-pdf */
    width: auto;
    margin: 20px auto;   /* centrage horizontal */
    border: 1px solid #000;
    page-break-inside: avoid;
}

th, td {
    border: 1px solid #000;
    padding: 8px 12px;
    text-align: left;
}

th {
    background-color: #f5f5f5;
    font-weight: bold;
}

tr:nth-child(even) {
    background-color: #fafafa;
}
```

---

### Code

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `code` | Code inline (`` `code` ``) |
| `pre` | Bloc de code (` ```code``` `) |
| `pre code` | Code à l'intérieur d'un bloc |

```css
code {
    font-family: 'Courier New', monospace;
    font-size: 9pt;
    background-color: #f4f4f4;
    padding: 2px 5px;
    border-radius: 3px;
}

pre {
    background-color: #f4f4f4;
    padding: 12px;
    border-radius: 4px;
    overflow-x: auto;
    page-break-inside: avoid;
}

pre code {
    background: none;
    padding: 0;
}
```

---

### Alertes GitHub-style

Générées par les balises `> [!TYPE]` dans le Markdown.

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `.markdown-alert` | Conteneur de toute alerte |
| `.markdown-alert p` | Paragraphes à l'intérieur d'une alerte |
| `.markdown-alert-title` | Ligne de titre (icône + type) |
| `.markdown-alert-note` | Alerte `[!NOTE]` et `[!INFO]` |
| `.markdown-alert-tip` | Alerte `[!TIP]` |
| `.markdown-alert-important` | Alerte `[!IMPORTANT]` |
| `.markdown-alert-warning` | Alerte `[!WARNING]` |
| `.markdown-alert-caution` | Alerte `[!CAUTION]` et `[!DANGER]` |

Chaque variante expose aussi `.markdown-alert-<type> .markdown-alert-title` pour la couleur du titre.

```css
.markdown-alert {
    padding: 12px 16px;
    margin: 16px 0;
    border-left: 4px solid;
    border-radius: 4px;
    page-break-inside: avoid;
}

.markdown-alert-note   { border-left-color: #0969da; background-color: #ddf4ff; }
.markdown-alert-tip    { border-left-color: #1a7f37; background-color: #dafbe1; }
.markdown-alert-important { border-left-color: #8250df; background-color: #eddeff; }
.markdown-alert-warning   { border-left-color: #9a6700; background-color: #fff8c5; }
.markdown-alert-caution   { border-left-color: #cf222e; background-color: #ffebe9; }

.markdown-alert-note .markdown-alert-title      { color: #0969da; }
.markdown-alert-tip .markdown-alert-title       { color: #1a7f37; }
.markdown-alert-important .markdown-alert-title { color: #8250df; }
.markdown-alert-warning .markdown-alert-title   { color: #9a6700; }
.markdown-alert-caution .markdown-alert-title   { color: #cf222e; }
```

---

### Table des matières

Générée par la balise `[[toc]]` dans le Markdown.

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `.toc` | Bloc conteneur du sommaire |
| `.toc-title` | Titre "Sommaire" |
| `.toc > ul` | Liste racine du sommaire |
| `.toc ul ul` | Sous-listes imbriquées |
| `.toc li` | Entrée du sommaire |
| `.toc li a` | Lien d'une entrée |

```css
.toc {
    background-color: #f8f9fa;
    border: 1px solid #e1e4e8;
    border-radius: 6px;
    padding: 16px 24px;
    margin: 20px 0;
    page-break-inside: avoid;
}

.toc-title {
    font-size: 14pt;
    margin-top: 0;
    margin-bottom: 12px;
}

.toc > ul { list-style: none; padding-left: 0; margin: 0; }
.toc ul ul { list-style: none; padding-left: 20px; }
.toc li { margin: 4px 0; line-height: 1.5; }
.toc li a { color: #333; text-decoration: none; }
```

---

### Séparateur et saut de page

| Sélecteur | Ce qu'il cible |
| --------- | -------------- |
| `hr` | Séparateur horizontal (`---` en Markdown) |
| `.page-break` | Saut de page (`===` en Markdown) |

```css
hr {
    border: none;
    border-top: 1px solid #ccc;
    margin: 20px 0;
}

.page-break {
    page-break-after: always;
    height: 0;
    margin: 0;
    padding: 0;
}
```

---

### Contrôle de la pagination

Ces propriétés CSS s'appliquent à n'importe quel sélecteur pour contrôler les sauts de page automatiques.

| Propriété | Valeurs utiles | Usage |
| --------- | -------------- | ----- |
| `page-break-before` | `always`, `avoid`, `auto` | Forcer / interdire un saut avant l'élément |
| `page-break-after` | `always`, `avoid`, `auto` | Forcer / interdire un saut après l'élément |
| `page-break-inside` | `avoid`, `auto` | Interdire la coupure à l'intérieur de l'élément |

```css
/* Ne jamais couper un titre de sa première ligne de contenu */
h1, h2, h3 { page-break-after: avoid; }

/* Ne pas couper un paragraphe ou une liste en deux pages */
p, li { page-break-inside: avoid; }

/* Chaque h1 commence une nouvelle page */
h1 { page-break-before: always; }
```

> Ces règles peuvent aussi être configurées dynamiquement via l'option `page-break-before` du front matter ou de la CLI, sans modifier le CSS du template.

---

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
- [marked](https://www.npmjs.com/package/marked) - Rendu du markdown inline dans les alertes
- [handlebars](https://www.npmjs.com/package/handlebars) - Rendu des templates dynamiques