const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

const ogTags = `
    <meta property="og:type" content="website" />
    <meta property="og:title" content="ArcRadius - Policy Navigator" />
    <meta property="og:description" content="Track LGBTQ+ legislation across all 50 states. Understand bills, take action, and stay informed." />
    <meta property="og:image" content="https://arcradius.netlify.app/thumbnail-tiny.png" />
    <meta property="og:url" content="https://arcradius.netlify.app" />
`;

// Inject after <title> tag
html = html.replace('</title>', `</title>${ogTags}`);

fs.writeFileSync(indexPath, html);
console.log('Injected OG meta tags into dist/index.html');
