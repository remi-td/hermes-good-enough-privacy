import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docs = path.join(root, 'docs');
const source = fs.readFileSync(path.join(root, 'article.md'), 'utf8');
const siteUrl = 'https://remi-td.github.io/hermes-good-enough-privacy/';
const titleMatch = source.match(/^# (.+)\n\n\*(.+)\*\n\n/);
if (!titleMatch) throw new Error('Expected article title and subtitle at the start of article.md');
const [, title, subtitle] = titleMatch;
const body = source.slice(titleMatch[0].length);

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const slug = (value) => value.toLowerCase().replace(/<[^>]*>/g, '').replace(/[^\p{L}\p{N}\s-]/gu, '').trim().replace(/\s+/g, '-');
const renderer = new marked.Renderer();
let diagramIndex = 0;
const diagramCaptions = ['How requests move through the data-policy lanes', 'An emergency handoff through the privacy guard', 'How the privacy guard handles a delegation request'];

renderer.heading = function ({ text, depth, tokens }) {
  const label = this.parser.parseInline(tokens);
  return `<h${depth} id="${slug(text)}">${label}</h${depth}>\n`;
};
renderer.code = function ({ text, lang }) {
  if (lang === 'mermaid') {
    const caption = diagramCaptions[diagramIndex++];
    if (!caption) throw new Error('Unexpected extra Mermaid diagram');
    return `<figure class="diagram"><div class="mermaid">${escapeHtml(text)}</div><figcaption>${escapeHtml(caption)}</figcaption></figure>\n`;
  }
  return `<pre><code class="language-${escapeHtml(lang || 'text')}">${escapeHtml(text)}</code></pre>\n`;
};

const article = marked.parse(body, { renderer, gfm: true }).replace(
  './docs/assets/architecture-final.png',
  'assets/architecture-final.png'
);
if (diagramIndex !== 3) throw new Error(`Expected 3 Mermaid diagrams, found ${diagramIndex}`);
if (article.includes('Good-enough%20privacy%20architecture')) throw new Error('Unresolved image path');
const contents = article.match(/<ol>[\s\S]*?<\/ol>/)?.[0];
if (!contents || (contents.match(/<li>/g) || []).length !== 8) throw new Error('Expected the eight-item contents list');

const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#faf9f5">
  <meta name="description" content="Eight patterns for a useful personal agent with more privacy: local memory, explicit data-policy lanes, de-identified delegation and deliberate communications.">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(subtitle)}">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:image" content="${siteUrl}assets/architecture-final.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${siteUrl}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="assets/site.css">
  <title>${escapeHtml(title)}</title>
  <script type="module" src="assets/diagrams.js"></script>
</head>
<body>
  <a class="skip-link" href="#article">Skip to article</a>
  <header class="site-header">
    <a class="site-mark" href="${siteUrl}" aria-label="Good-enough privacy, home"><span class="mark-symbol" aria-hidden="true">R.</span><span>Rémi <span class="mark-divider">/</span> Field Notes</span></a>
    <nav class="social-links" aria-label="Social links">
      <a class="social-link" href="https://www.linkedin.com/in/remi-turpaud/" aria-label="Rémi on LinkedIn" title="LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z"/></svg></a>
      <a class="social-link" href="https://github.com/remi-td/hermes-good-enough-privacy" aria-label="View this page on GitHub" title="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 .297a12 12 0 0 0-3.793 23.385c.6.111.82-.261.82-.577v-2.234c-3.338.726-4.043-1.416-4.043-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.303-5.467-1.333-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.52 11.52 0 0 1 6.007 0c2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.119 3.176.77.84 1.235 1.91 1.235 3.221 0 4.61-2.807 5.625-5.479 5.922.43.372.823 1.102.823 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297Z"/></svg></a>
    </nav>
  </header>
  <main id="article">
    <div class="hero">
      <div class="hero-inner">
        <p class="eyebrow">Personal agents / Privacy</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="dek">${escapeHtml(subtitle)}</p>
      </div>
    </div>
    <div class="content-grid">
      <nav class="section-nav" aria-label="Article contents"><p class="nav-label">Contents</p>${contents}</nav>
      <article class="article-body">${article}</article>
    </div>
  </main>
  <footer class="site-footer"><span>Rémi / Field Notes</span><a href="#article">Back to top ↑</a></footer>
</body>
</html>\n`;

fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, 'index.html'), html);
fs.writeFileSync(path.join(docs, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
