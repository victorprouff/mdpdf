# md2pdf

CLI Node.js pour convertir des fichiers Markdown en PDF professionnels avec templates personnalisables.

## Stack & dépendances

- **Node.js** (ESM - `"type": "module"`)
- `md-to-pdf` (v5) — conversion MD → PDF via Puppeteer
- `gray-matter` — parsing du front matter YAML
- `glob` — recherche de fichiers

## Structure du projet

```
bin/mdpdf.js          # Point d'entrée CLI + toute la logique (parsing args, front matter, génération PDF)
lib/template.js       # Export du CSS par défaut (defaultCSS)
templates/default/    # Template par défaut embarqué (template.css uniquement)
```

Le projet est volontairement simple : un seul fichier principal `bin/mdpdf.js` (~530 lignes) qui contient tout.

## Système de templates

Les templates sont dans `~/.mdpdf/templates/<nom>/` (utilisateur) ou `./templates/<nom>/` (projet).
Priorité : utilisateur > projet.

Chaque template peut contenir :
- `template.css` — styles CSS
- `header.html` — template header (variables : `{{LOGO}}`, `{{DATE}}`)
- `footer.html` — template footer (variables : `{{LOGO}}`, `{{DATE}}`)
- `logo.png` — logo converti en base64 data URI

Templates existants : `default` (CSS seul, sans header/footer), `formation` (complet, dans ~/.mdpdf/templates/).

## Fusion des options

Priorité : **défaut < front matter YAML < CLI explicite**

Valeurs par défaut : template=`default`, header=true, footer=true, logo=true, landscape=false.

Front matter supporté dans les fichiers .md :
```yaml
---
template: formation
landscape: true
header: show/hidden
footer: show/hidden
logo: show/hidden
output: mon-doc.pdf
---
```

Le tracking des options CLI explicites se fait via un `Set` (`cliExplicit`) pour ne pas écraser le front matter avec les valeurs par défaut.

## Options CLI

`--template <nom>`, `--no-header`, `--no-footer`, `--no-logo`, `--landscape`, `--output <fichier>`, `--list-templates`, `--help`

Sans argument fichier : convertit tous les `.md` du répertoire courant.

## Conventions de code

- ESM (`import`/`export`), pas de CommonJS
- Pas de framework de test (pas de tests actuellement)
- Emojis dans les console.log pour le feedback utilisateur
- Installé globalement via `npm link`

## Projet compagnon

`mdpdf-template-builder` dans `/Users/victorprouff/tools/mdpdf-template-builder` — app web Express pour éditer visuellement les templates (preview live, WebSocket, CodeMirror).
