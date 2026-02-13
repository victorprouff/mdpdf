export const defaultCSS = `
/* === Configuration de la page === */
@page {
    size: A4;
    margin-top: 100px;
    margin-bottom: 120px;
    margin-left: 25mm;
    margin-right: 25mm;
}

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
`;