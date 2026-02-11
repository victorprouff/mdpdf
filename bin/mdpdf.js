#!/usr/bin/env node

import { mdToPdf } from 'md-to-pdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

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
`;
}

// Fonction pour générer un PDF
async function generatePDF(mdFile, options = {}) {
    const today = formatDate();
    
    const baseName = path.basename(mdFile, '.md');
    const outputPath = options.output || `${baseName}.pdf`;
    
    console.log(`\n📄 Conversion de ${mdFile}...`);

    // Charger le template
    const templateName = options.template || 'default';
    const template = loadTemplate(templateName);
    
    if (!template) {
        console.error(`❌ Impossible de charger le template : ${templateName}`);
        return;
    }
    
    // Charger le logo
    const logoDataUri = loadLogo(template.logo);
    
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
        // Calculer les marges en fonction de header/footer
        const margins = {
            top: options.header !== false ? '100px' : '25mm',
            bottom: options.footer !== false ? '120px' : '25mm',
            left: '25mm',
            right: '25mm'
        };
        
        await mdToPdf(
            { path: mdFile },
            {
                dest: outputPath,
                css: cssContent,
                pdf_options: {
                    format: 'A4',
                    margin: margins,
                    displayHeaderFooter: (options.header !== false || options.footer !== false),
                    headerTemplate: headerTemplate,
                    footerTemplate: footerTemplate,
                    printBackground: true,
                    tagged: true,
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
    
    // Options
    const options = {
        template: 'default',
        header: true,
        footer: true
    };
    
    // Parser les arguments
    let files = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--template' && args[i + 1]) {
            options.template = args[i + 1];
            i++;
        } else if (args[i] === '--no-header') {
            options.header = false;
        } else if (args[i] === '--no-footer') {
            options.footer = false;
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
        
        await generatePDF(fullPath, options);
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
    mdpdf document.md --no-header --no-footer # Sans header ni footer

OPTIONS:
    --template <nom>                     # Utiliser un template spécifique (défaut: default)
    --no-header                          # Désactiver le header
    --no-footer                          # Désactiver le footer
    --list-templates                     # Lister les templates disponibles
    --help, -h                           # Afficher cette aide

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