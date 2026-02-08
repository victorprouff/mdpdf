#!/usr/bin/env node

import { mdToPdf } from 'md-to-pdf';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins par défaut
const DEFAULT_LOGO = path.join(process.env.HOME, '.md2pdf', 'logo.png');
const DEFAULT_CSS = path.join(process.env.HOME, '.md2pdf', 'template.css');

// Fonction pour formater la date
function formatDate() {
    return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
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
    const logoDataUri = loadLogo(options.logo || DEFAULT_LOGO);
    
    const baseName = path.basename(mdFile, '.md');
    const outputPath = options.output || `${baseName}.pdf`;
    
    console.log(`📄 Conversion de ${mdFile}...`);

    // Lire le CSS et l'injecter directement
    const cssPath = options.css || DEFAULT_CSS;
    let cssContent = '';
    
    console.log(`🔍 Recherche du CSS : ${cssPath}`);

    if (fs.existsSync(cssPath)) {
        cssContent = fs.readFileSync(cssPath, 'utf8');
        console.log(`✅ CSS chargé avec succès (${cssContent.length} caractères)`);
    } else {
        console.warn(`⚠️  CSS non trouvé : ${cssPath}`);
        cssContent = getDefaultCSS();
        console.log(`📋 Utilisation du CSS par défaut (${cssContent.length} caractères)`);
    }

    console.log(`🎨 Logo : ${logoDataUri ? 'Chargé ✓' : 'Non disponible ✗'}`);
    console.log(`📅 Date : ${today}`);
    console.log(`📤 Sortie : ${outputPath}`);
    console.log(`🚀 Lancement de la génération PDF...\n`);

    try {
        await mdToPdf(
            { path: mdFile },
            {
                dest: outputPath,
                css: cssContent,  // Changement ici : injection directe au lieu de stylesheet
                pdf_options: {
                    format: 'A4',
                    margin: {
                        top: '100px',
                        bottom: '120px',
                        left: '25mm',
                        right: '25mm'
                    },
                    displayHeaderFooter: true,
                    headerTemplate: `
                        <div style="width: 100%; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 10mm 0 10mm; font-size: 11px;">
                            <img src="${logoDataUri}" style="height: 60px; display: block;">
                            <span style="color: #666; line-height: 1;">${today}</span>
                        </div>
                    `,
                    footerTemplate: `
                        <div style="width: 100%; text-align: center; font-size: 9px; color: #666; line-height: 1.4;">
                            Prouff Of Concept, 14 Rue Bausset, 75015 Paris, Siret : 91427637300018 <br>
                            Organisme de formation enregistré sous le numéro 11757305375 auprès de la DRIEETS <br>
                            Contact : 0687061835 / contact-pro@victorprouff.fr
                        </div>
                    `,
                    printBackground: true,
                    tagged: true  // Ajouter cette ligne pour les liens cliquables
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

// Fonction principale
async function main() {    
    const args = process.argv.slice(2);
    
    // Options
    const options = {
        logo: DEFAULT_LOGO,
        css: DEFAULT_CSS
    };
    
    // Parser les arguments
    let files = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--logo' && args[i + 1]) {
            options.logo = path.resolve(args[i + 1]);
            i++;
        } else if (args[i] === '--css' && args[i + 1]) {
            options.css = path.resolve(args[i + 1]);
            i++;
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
md2pdf - Convertisseur Markdown vers PDF avec template Qualiopi

USAGE:
    md2pdf [fichiers...] [options]

EXEMPLES:
    md2pdf document.md              # Convertir un fichier
    md2pdf doc1.md doc2.md          # Convertir plusieurs fichiers
    md2pdf                          # Convertir tous les .md du répertoire

OPTIONS:
    --logo <chemin>                 # Utiliser un logo personnalisé
    --css <chemin>                  # Utiliser un CSS personnalisé
    --help, -h                      # Afficher cette aide

CONFIGURATION:
    Les fichiers par défaut sont cherchés dans ~/.md2pdf/
    - logo.png                      # Logo par défaut
    - template.css                  # CSS par défaut

Pour configurer vos templates par défaut:
    mkdir -p ~/.md2pdf
    cp logo.png ~/.md2pdf/
    cp template.css ~/.md2pdf/
`);
}

// Lancer le programme
main().catch(console.error);