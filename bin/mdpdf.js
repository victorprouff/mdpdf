#!/usr/bin/env node

import { mdToPdf } from 'md-to-pdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';
import matter from 'gray-matter';
import { marked } from 'marked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des templates
const PROJECT_TEMPLATES = path.join(__dirname, '..', 'templates');
const USER_TEMPLATES = path.join(process.env.HOME, '.mdpdf', 'templates');

// Fonction pour formater la date
function formatDate() {
    return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

// Fonction pour charger un template
function loadTemplate(templateName) {
    // Chercher d'abord dans les templates utilisateur, puis dans les templates du projet
    const userTemplatePath = path.join(USER_TEMPLATES, templateName);
    const projectTemplatePath = path.join(PROJECT_TEMPLATES, templateName);
    
    let templatePath;
    if (fs.existsSync(userTemplatePath)) {
        templatePath = userTemplatePath;
        console.log(`📁 Template utilisateur : ${templateName}`);
    } else if (fs.existsSync(projectTemplatePath)) {
        templatePath = projectTemplatePath;
        console.log(`📁 Template projet : ${templateName}`);
    } else {
        console.error(`❌ Template introuvable : ${templateName}`);
        return null;
    }
    
    return {
        header: path.join(templatePath, 'header.html'),
        footer: path.join(templatePath, 'footer.html'),
        css: path.join(templatePath, 'template.css'),
        logo: path.join(templatePath, 'logo.png')
    };
}

// Fonction pour charger le logo en base64
function loadLogo(logoPath) {
    if (!fs.existsSync(logoPath)) {
        console.warn(`⚠️  Logo non trouvé : ${logoPath}`);
        return null;
    }
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });
    return `data:image/png;base64,${logoBase64}`;
}

// Fonction pour charger un fichier HTML template et remplacer les variables
function loadHTMLTemplate(templatePath, variables) {
    if (!fs.existsSync(templatePath)) {
        return '';
    }
    
    let content = fs.readFileSync(templatePath, 'utf8');
    
    // Remplacer les variables {{VAR}} par leurs valeurs
    Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, variables[key] || '');
    });
    
    return content;
}

// Fonction pour convertir les images locales en base64 data URI dans le markdown
function processImages(markdownContent, baseDir) {
    const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp',
        '.ico': 'image/x-icon'
    };

    // Remplacer les images markdown : ![alt](path) ou ![alt](path "title")
    return markdownContent.replace(/!\[([^\]]*)\]\(([^)"]+)(?:\s+"[^"]*")?\)/g, (match, alt, imgPath) => {
        // Ignorer les URLs et data URIs
        if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) {
            return match;
        }

        const absolutePath = path.resolve(baseDir, imgPath);

        if (!fs.existsSync(absolutePath)) {
            console.warn(`⚠️  Image non trouvée : ${imgPath}`);
            return match;
        }

        const ext = path.extname(absolutePath).toLowerCase();
        const mime = mimeTypes[ext] || 'application/octet-stream';
        const base64 = fs.readFileSync(absolutePath, { encoding: 'base64' });
        const dataUri = `data:${mime};base64,${base64}`;

        console.log(`🖼️  Image embarquée : ${imgPath}`);
        return `![${alt}](${dataUri})`;
    });
}

// Fonction pour générer un slug à partir d'un texte de heading (pour les ancres)
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/<[^>]+>/g, '')       // Supprimer les balises HTML
        .replace(/[^\w\s-]/g, '')      // Supprimer les caractères spéciaux
        .replace(/\s+/g, '-')          // Espaces → tirets
        .replace(/-+/g, '-')           // Tirets multiples → un seul
        .replace(/^-|-$/g, '');        // Supprimer tirets en début/fin
}

// Fonction pour générer la table des matières et injecter les ancres dans le markdown
function processToc(markdownContent, tocStart = 1, tocDepth = 3) {
    // Vérifier si la balise [[toc]] est présente
    if (!markdownContent.includes('[[toc]]')) {
        return markdownContent;
    }

    // Parser les headings (en dehors des blocs de code)
    const headings = [];
    const slugCount = {};
    let inCodeBlock = false;

    const lines = markdownContent.split('\n');
    for (const line of lines) {
        // Détecter les blocs de code
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            continue;
        }
        if (inCodeBlock) continue;

        // Ignorer la ligne [[toc]] elle-même
        if (line.trim() === '[[toc]]') continue;

        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            if (level < tocStart || level > tocDepth) continue;

            const rawTitle = match[2].trim();
            let slug = slugify(rawTitle);

            // Gérer les doublons de slug
            if (slugCount[slug] !== undefined) {
                slugCount[slug]++;
                slug = `${slug}-${slugCount[slug]}`;
            } else {
                slugCount[slug] = 0;
            }

            headings.push({ level, title: rawTitle, slug });
        }
    }

    if (headings.length === 0) {
        return markdownContent.replace(/\[\[toc\]\]/g, '');
    }

    // Générer le HTML du sommaire avec listes imbriquées
    const minLevel = Math.min(...headings.map(h => h.level));
    let tocBody = '';
    let currentLevel = minLevel - 1;

    for (const h of headings) {
        const htmlTitle = marked.parseInline(h.title);

        if (h.level > currentLevel) {
            // Ouvrir des <ul> pour descendre au bon niveau
            for (let i = currentLevel; i < h.level; i++) {
                tocBody += '<ul>';
            }
        } else if (h.level < currentLevel) {
            // Fermer les </li></ul> pour remonter au bon niveau
            for (let i = currentLevel; i > h.level; i--) {
                tocBody += '</li></ul>';
            }
            tocBody += '</li>';
        } else {
            tocBody += '</li>';
        }

        tocBody += `<li><a href="#${h.slug}">${htmlTitle}</a>`;
        currentLevel = h.level;
    }

    // Fermer tous les niveaux restants
    for (let i = currentLevel; i >= minLevel; i--) {
        tocBody += '</li></ul>';
    }

    const tocHtml = `<nav class="toc">
<h2 class="toc-title">Sommaire</h2>
${tocBody}
</nav>`;

    // Remplacer [[toc]] par le HTML généré
    let result = markdownContent.replace(/\[\[toc\]\]/g, tocHtml);

    // Injecter des ancres <a> avant chaque heading concerné
    inCodeBlock = false;
    const slugCount2 = {};
    const resultLines = result.split('\n');
    const outputLines = [];

    for (const line of resultLines) {
        if (line.trim().startsWith('```')) {
            inCodeBlock = !inCodeBlock;
            outputLines.push(line);
            continue;
        }
        if (inCodeBlock) {
            outputLines.push(line);
            continue;
        }

        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const rawTitle = match[2].trim();

            if (level >= tocStart && level <= tocDepth) {
                let slug = slugify(rawTitle);
                if (slugCount2[slug] !== undefined) {
                    slugCount2[slug]++;
                    slug = `${slug}-${slugCount2[slug]}`;
                } else {
                    slugCount2[slug] = 0;
                }

                outputLines.push(`<a id="${slug}"></a>\n\n${line}`);
                continue;
            }
        }

        outputLines.push(line);
    }

    return outputLines.join('\n');
}

// Fonction pour transformer les GitHub-style alerts en HTML
function processAlerts(markdownContent) {
    const alertTypes = {
        NOTE:      { className: 'note',      title: 'Note',      icon: 'ℹ️' },
        TIP:       { className: 'tip',       title: 'Tip',       icon: '💡' },
        IMPORTANT: { className: 'important', title: 'Important', icon: '❗' },
        WARNING:   { className: 'warning',   title: 'Warning',   icon: '⚠️' },
        CAUTION:   { className: 'caution',   title: 'Caution',   icon: '🔴' },
        INFO:      { className: 'note',      title: 'Info',      icon: 'ℹ️' },
        DANGER:    { className: 'caution',   title: 'Danger',    icon: '🔴' },
    };

    const typePattern = Object.keys(alertTypes).join('|');
    // Capture: [!TYPE] + texte optionnel sur la même ligne + corps du blockquote
    const alertRegex = new RegExp(
        `^(?:> *\\[!(${typePattern})\\]([^\\n]*)\\n)((?:> *[^\\n]*\\n?)*)`,
        'gmi'
    );

    return markdownContent.replace(alertRegex, (match, type, titleSuffix, body) => {
        const alertDef = alertTypes[type.toUpperCase()];
        if (!alertDef) return match;

        // Titre personnalisé après [!TYPE] ou titre par défaut
        const customTitle = titleSuffix.trim();
        const title = customTitle
            ? marked.parseInline(customTitle)
            : alertDef.title;

        // Strip leading "> " from each line
        const contentLines = body
            .split('\n')
            .filter(line => line.trim() !== '')
            .map(line => line.replace(/^> ?/, '').trim());

        // Group lines into paragraphs (empty lines = séparateurs)
        const paragraphs = [];
        let current = [];
        for (const line of contentLines) {
            if (line === '') {
                if (current.length > 0) {
                    paragraphs.push(current.join(' '));
                    current = [];
                }
            } else {
                current.push(line);
            }
        }
        if (current.length > 0) {
            paragraphs.push(current.join(' '));
        }

        // Traiter le markdown inline dans chaque paragraphe
        const htmlBody = paragraphs
            .map(p => `  <p>${marked.parseInline(p)}</p>`)
            .join('\n');

        return `<div class="markdown-alert markdown-alert-${alertDef.className}">
  <p class="markdown-alert-title">${alertDef.icon} ${title}</p>
${htmlBody}
</div>\n`;
    });
}

// Fonction pour obtenir le CSS par défaut
function getDefaultCSS() {
    return `
/* === Style du corps === */
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
}

/* === Titres === */
h1 {
    color: #2C5F8D;
    font-size: 24pt;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 3px solid #2C5F8D;
    padding-bottom: 10px;
}

h2 {
    color: #2C5F8D;
    font-size: 18pt;
    margin-top: 30px;
    margin-bottom: 15px;
}

h3 {
    color: #4A90E2;
    font-size: 14pt;
    margin-top: 20px;
    margin-bottom: 10px;
}

/* === Paragraphes === */
p {
    margin-bottom: 12px;
    text-align: justify;
}

/* === Listes === */
ul > li {
    margin-bottom: 10px;
}

ul > li > ul > li {
    margin-bottom: 10px;
}

ul > li > ul {
    margin-top: 5px;
    margin-bottom: 0;
}

ul > li:last-child,
ul > li > ul > li:last-child {
    margin-bottom: 0;
}

/* === Tableaux === */
table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
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
    color: #2C5F8D;
}

tr:nth-child(even) {
    background-color: #fafafa;
}

/* === Pagination === */
h1, h2, h3 {
    page-break-after: avoid;
}

p, li {
    page-break-inside: avoid;
}

/* === GitHub-style Alerts === */
.markdown-alert {
    padding: 12px 16px;
    margin: 16px 0;
    border-left: 4px solid;
    border-radius: 4px;
    page-break-inside: avoid;
}

.markdown-alert p {
    margin: 4px 0;
    text-align: left;
}

.markdown-alert-title {
    font-weight: 600;
    margin-bottom: 4px !important;
}

.markdown-alert-note {
    border-left-color: #0969da;
    background-color: #ddf4ff;
}
.markdown-alert-note .markdown-alert-title { color: #0969da; }

.markdown-alert-tip {
    border-left-color: #1a7f37;
    background-color: #dafbe1;
}
.markdown-alert-tip .markdown-alert-title { color: #1a7f37; }

.markdown-alert-important {
    border-left-color: #8250df;
    background-color: #eddeff;
}
.markdown-alert-important .markdown-alert-title { color: #8250df; }

.markdown-alert-warning {
    border-left-color: #9a6700;
    background-color: #fff8c5;
}
.markdown-alert-warning .markdown-alert-title { color: #9a6700; }

.markdown-alert-caution {
    border-left-color: #cf222e;
    background-color: #ffebe9;
}
.markdown-alert-caution .markdown-alert-title { color: #cf222e; }

/* === Table des matières === */
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
    color: #2C5F8D;
    margin-top: 0;
    margin-bottom: 12px;
    border-bottom: 2px solid #2C5F8D;
    padding-bottom: 8px;
}

.toc > ul {
    list-style: none;
    padding-left: 0;
    margin: 0;
}

.toc ul ul {
    list-style: none;
    padding-left: 20px;
    margin: 0;
}

.toc li {
    margin: 4px 0;
    line-height: 1.5;
}

.toc li a {
    color: #333;
    text-decoration: none;
}

.toc li a:hover {
    text-decoration: underline;
}
`;
}

// Fonction pour parser le front matter YAML d'un fichier Markdown
function parseFrontMatter(mdFile) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const { data } = matter(content);

    const result = {};

    if (data.template !== undefined) {
        result.template = String(data.template);
    }
    if (data.landscape !== undefined) {
        result.landscape = Boolean(data.landscape);
    }
    if (data.header !== undefined) {
        result.header = data.header === 'show' || data.header === true;
    }
    if (data.footer !== undefined) {
        result.footer = data.footer === 'show' || data.footer === true;
    }
    if (data.logo !== undefined) {
        result.logo = data.logo === 'show' || data.logo === true;
    }
    if (data.output !== undefined) {
        result.output = String(data.output);
    }
    if (data['toc-start'] !== undefined) {
        const start = parseInt(data['toc-start'], 10);
        if (start >= 1 && start <= 6) {
            result['toc-start'] = start;
        }
    }
    if (data['toc-depth'] !== undefined) {
        const depth = parseInt(data['toc-depth'], 10);
        if (depth >= 1 && depth <= 6) {
            result['toc-depth'] = depth;
        }
    }

    return result;
}

// Fonction pour fusionner les options (défaut < front matter < CLI explicite)
function mergeOptions(defaults, frontMatter, cliOptions, cliExplicit) {
    const result = { ...defaults };

    for (const key of Object.keys(result)) {
        if (cliExplicit.has(key)) {
            result[key] = cliOptions[key];
        } else if (key in frontMatter) {
            result[key] = frontMatter[key];
        }
    }

    // Gérer output séparément (pas dans les défauts)
    if (cliExplicit.has('output')) {
        result.output = cliOptions.output;
    } else if ('output' in frontMatter) {
        result.output = frontMatter.output;
    }

    return result;
}

// Extraire les marges depuis la règle @page du CSS
function extractPageMargins(css) {
    const defaults = { top: '25mm', bottom: '20mm', left: '15mm', right: '15mm' };
    const pageMatch = css.match(/@page\s*\{([^}]*)\}/);
    if (!pageMatch) return defaults;

    const body = pageMatch[1];
    const sides = ['top', 'right', 'bottom', 'left'];
    const result = { ...defaults };

    sides.forEach(side => {
        const re = new RegExp(`margin-${side}\\s*:\\s*([\\d.]+\\s*(?:mm|cm|px|in|pt))`, 'i');
        const m = body.match(re);
        if (m) result[side] = m[1].replace(/\s+/g, '');
    });

    return result;
}

// Fonction pour générer un PDF
async function generatePDF(mdFile, cliOptions = {}, cliExplicit = new Set()) {
    const today = formatDate();

    // Parser le front matter et fusionner avec les options CLI
    const defaults = {
        template: 'default',
        header: true,
        footer: true,
        logo: true,
        landscape: false,
        'toc-start': 1,
        'toc-depth': 3
    };

    const frontMatter = parseFrontMatter(mdFile);
    const options = mergeOptions(defaults, frontMatter, cliOptions, cliExplicit);

    // Log des options venant du front matter
    const fmKeys = Object.keys(frontMatter);
    if (fmKeys.length > 0) {
        console.log(`\n📋 Front matter détecté : ${fmKeys.join(', ')}`);
    }

    const baseName = path.basename(mdFile, '.md');
    const outputPath = options.output || `${baseName}.pdf`;

    console.log(`\n📄 Conversion de ${mdFile}...`);

    // Charger le template
    const templateName = options.template;
    const template = loadTemplate(templateName);
    
    if (!template) {
        console.error(`❌ Impossible de charger le template : ${templateName}`);
        return;
    }
    
    // Charger le logo
    let logoDataUri = null;
    if (options.logo !== false) {
        logoDataUri = loadLogo(template.logo);
    } else {
        console.log(`⊘ Logo désactivé`);
    }

    // Variables pour les templates HTML
    const templateVars = {
        LOGO: logoDataUri || '',
        DATE: today
    };
    
    // Charger header et footer selon les options
    let headerTemplate = '<div></div>'; // Template vide par défaut
    let footerTemplate = '<div></div>'; // Template vide par défaut
    
    if (options.header !== false) {
        headerTemplate = loadHTMLTemplate(template.header, templateVars);
        console.log(`✅ Header chargé`);
    } else {
        console.log(`⊘ Header désactivé`);
    } 
    
    if (options.footer !== false) {
        footerTemplate = loadHTMLTemplate(template.footer, templateVars);
        console.log(`✅ Footer chargé`);
    } else {
        console.log(`⊘ Footer désactivé`);
    }
    
    // Charger le CSS
    let cssContent = '';
    if (fs.existsSync(template.css)) {
        cssContent = fs.readFileSync(template.css, 'utf8');
        console.log(`✅ CSS chargé (${cssContent.length} caractères)`);
    } else {
        console.warn(`⚠️  CSS non trouvé, utilisation du style par défaut`);
        cssContent = getDefaultCSS();
    }
    
    console.log(`📅 Date : ${today}`);
    console.log(`📤 Sortie : ${outputPath}`);
    console.log(`🚀 Lancement de la génération PDF...\n`);

    try {
        // Extraire les marges depuis @page dans le CSS du template
        const margins = extractPageMargins(cssContent);

        // Saut de page sur les <hr> (balise --- en Markdown)
        cssContent += `
hr {
    page-break-after: always;
    border: none;
    margin: 0;
    padding: 0;
    height: 0;
}
`;

        // Configuration de la page selon l'orientation
        // A4 Portrait : 210mm x 297mm
        // A4 Paysage : 297mm x 210mm
        // Ajouter la règle @page pour l'orientation si nécessaire
        if (options.landscape) {
            cssContent += `
    @page {
        size: A4 landscape;
    }
    `;
        }

        // Lire le contenu markdown et convertir les images locales en base64
        const rawContent = fs.readFileSync(mdFile, 'utf8');
        const { content: mdContent } = matter(rawContent);
        const imagesProcessed = processImages(mdContent, path.dirname(mdFile));
        const tocProcessed = processToc(imagesProcessed, options['toc-start'], options['toc-depth']);
        const processedContent = processAlerts(tocProcessed);

        await mdToPdf(
            { content: processedContent },
            {
                dest: outputPath,
                basedir: path.dirname(mdFile),
                css: cssContent,
                pdf_options: {
                    format: 'A4',
                    landscape: options.landscape || false,
                    margin: margins,
                    displayHeaderFooter: (options.header !== false || options.footer !== false),
                    headerTemplate: headerTemplate,
                    footerTemplate: footerTemplate,
                    printBackground: true,
                    tagged: true,
                    preferCSSPageSize: true
                }
            }
        );
        
        console.log(`\n✅ PDF généré avec succès : ${outputPath}\n`);
    } catch (error) {
        console.error(`\n❌ Erreur lors de la conversion de ${mdFile}:`);
        console.error(error.message);
        console.error(error.stack);
    }
}

// Fonction pour lister les templates disponibles
function listTemplates() {
    console.log('\n📚 Templates disponibles :\n');
    
    // Templates du projet
    if (fs.existsSync(PROJECT_TEMPLATES)) {
        const projectTemplates = fs.readdirSync(PROJECT_TEMPLATES)
            .filter(f => fs.statSync(path.join(PROJECT_TEMPLATES, f)).isDirectory());
        
        if (projectTemplates.length > 0) {
            console.log('🔹 Templates du projet :');
            projectTemplates.forEach(t => console.log(`   - ${t}`));
        }
    }
    
    // Templates utilisateur
    if (fs.existsSync(USER_TEMPLATES)) {
        const userTemplates = fs.readdirSync(USER_TEMPLATES)
            .filter(f => fs.statSync(path.join(USER_TEMPLATES, f)).isDirectory());
        
        if (userTemplates.length > 0) {
            console.log('\n🔸 Templates utilisateur (~/.mdpdf/templates/) :');
            userTemplates.forEach(t => console.log(`   - ${t}`));
        }
    }
    
    console.log('');
}

// Fonction principale
async function main() {
    const args = process.argv.slice(2);
    
    // Options CLI et tracking des options explicitement passées
    const cliOptions = {};
    const cliExplicit = new Set();

    // Parser les arguments
    let files = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--template' && args[i + 1]) {
            cliOptions.template = args[i + 1];
            cliExplicit.add('template');
            i++;
        } else if (args[i] === '--no-header') {
            cliOptions.header = false;
            cliExplicit.add('header');
        } else if (args[i] === '--no-footer') {
            cliOptions.footer = false;
            cliExplicit.add('footer');
        } else if (args[i] === '--no-logo') {
            cliOptions.logo = false;
            cliExplicit.add('logo');
        } else if (args[i] === '--toc-start' && args[i + 1]) {
            const start = parseInt(args[i + 1], 10);
            if (start >= 1 && start <= 6) {
                cliOptions['toc-start'] = start;
                cliExplicit.add('toc-start');
            } else {
                console.warn(`⚠️  toc-start doit être entre 1 et 6, ignoré : ${args[i + 1]}`);
            }
            i++;
        } else if (args[i] === '--toc-depth' && args[i + 1]) {
            const depth = parseInt(args[i + 1], 10);
            if (depth >= 1 && depth <= 6) {
                cliOptions['toc-depth'] = depth;
                cliExplicit.add('toc-depth');
            } else {
                console.warn(`⚠️  toc-depth doit être entre 1 et 6, ignoré : ${args[i + 1]}`);
            }
            i++;
        } else if (args[i] === '--landscape') {
            cliOptions.landscape = true;
            cliExplicit.add('landscape');
        } else if (args[i] === '--output' && args[i + 1]) {
            cliOptions.output = args[i + 1];
            cliExplicit.add('output');
            i++;
        } else if (args[i] === '--list-templates') {
            listTemplates();
            return;
        } else if (args[i] === '--help' || args[i] === '-h') {
            showHelp();
            return;
        } else if (!args[i].startsWith('--')) {
            files.push(args[i]);
        }
    }
    
    // Si aucun fichier spécifié, chercher tous les .md dans le répertoire courant
    if (files.length === 0) {
        files = await glob('*.md', { cwd: process.cwd() });
        
        if (files.length === 0) {
            console.log('ℹ️  Aucun fichier Markdown trouvé dans le répertoire courant.');
            return;
        }
        
        console.log(`📚 ${files.length} fichier(s) Markdown trouvé(s):\n`);
        files.forEach(f => console.log(`   - ${f}`));
        console.log('');
    }
    
    // Convertir tous les fichiers
    for (const file of files) {
        const fullPath = path.resolve(file);
        
        if (!fs.existsSync(fullPath)) {
            console.error(`❌ Fichier introuvable : ${file}`);
            continue;
        }
        
        await generatePDF(fullPath, cliOptions, cliExplicit);
    }
    
    console.log('\n✨ Conversion terminée !');
}

function showHelp() {
    console.log(`
mdpdf - Convertisseur Markdown vers PDF avec templates

USAGE:
    mdpdf [fichiers...] [options]

EXEMPLES:
    mdpdf document.md                    # Convertir un fichier avec le template par défaut
    mdpdf doc1.md doc2.md                # Convertir plusieurs fichiers
    mdpdf                                # Convertir tous les .md du répertoire
    mdpdf document.md --template qualiopi # Utiliser un template spécifique
    mdpdf document.md --no-header        # Sans header
    mdpdf document.md --no-footer        # Sans footer
    mdpdf document.md --landscape        # Orientation paysage
    mdpdf document.md --no-header --no-footer # Sans header ni footer

OPTIONS:
    --template <nom>                     # Utiliser un template spécifique (défaut: default)
    --no-header                          # Désactiver le header
    --no-footer                          # Désactiver le footer
    --no-logo                            # Désactiver le logo
    --toc-start <n>                      # Niveau de titre minimum dans le sommaire, 1-6 (défaut: 1)
    --toc-depth <n>                      # Niveau de titre maximum dans le sommaire, 1-6 (défaut: 3)
    --landscape                          # Orientation paysage (défaut: portrait)
    --output <fichier>                   # Chemin du fichier PDF de sortie
    --list-templates                     # Lister les templates disponibles
    --help, -h                           # Afficher cette aide

FRONT MATTER YAML:
    Vous pouvez configurer les options directement dans le fichier Markdown
    via un en-tête YAML (front matter). Les options CLI explicites ont
    priorité sur le front matter.

    Exemple :
    ---
    template: formation
    landscape: true
    header: show
    footer: hidden
    logo: hidden
    toc-start: 2
    toc-depth: 4
    output: mon-document.pdf
    ---

    Clés supportées :
    - template   : nom du template (string)
    - landscape   : true/false
    - header      : show/hidden
    - footer      : show/hidden
    - logo        : show/hidden
    - toc-start   : niveau min du sommaire, 1-6 (défaut: 1)
    - toc-depth   : niveau max du sommaire, 1-6 (défaut: 3)
    - output      : chemin du PDF de sortie

    Priorité : défaut < front matter < CLI explicite

TEMPLATES:
    Les templates sont cherchés dans cet ordre :
    1. ~/.mdpdf/templates/<nom>/
    2. ./templates/<nom>/

    Structure d'un template :
    <nom>/
    ├── header.html       # Template du header (optionnel)
    ├── footer.html       # Template du footer (optionnel)
    ├── template.css      # Styles CSS
    └── logo.png          # Logo (optionnel)

    Variables disponibles dans header.html et footer.html :
    - {{LOGO}}  : Logo en base64
    - {{DATE}}  : Date du jour au format français

Pour créer un nouveau template :
    mkdir -p ~/.mdpdf/templates/mon-template
    # Puis ajoutez vos fichiers header.html, footer.html, template.css, logo.png
`);
}
// Lancer le programme
main().catch(console.error);