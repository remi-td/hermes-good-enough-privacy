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
  './Good-enough%20privacy%20architecture%20-%20Final.png',
  'assets/architecture.png'
);
if (diagramIndex !== 3) throw new Error(`Expected 3 Mermaid diagrams, found ${diagramIndex}`);
if (article.includes('Good-enough%20privacy%20architecture')) throw new Error('Unresolved image path');

const html = `<!doctype html>
<html lang="en-GB">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#fbfaf7">
  <meta name="description" content="Eight patterns for a useful personal agent with more privacy: local memory, explicit data-policy lanes, de-identified delegation and deliberate communications.">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(subtitle)}">
  <meta property="og:url" content="${siteUrl}">
  <meta property="og:image" content="${siteUrl}assets/architecture.png">
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
    <a class="site-mark" href="${siteUrl}" aria-label="Good-enough privacy, home"><span class="mark-symbol" aria-hidden="true">◈</span><span>Good-enough privacy</span></a>
    <a class="header-link" href="https://github.com/remi-td/hermes-good-enough-privacy">View source <span aria-hidden="true">↗</span></a>
  </header>
  <main id="article">
    <div class="hero">
      <div class="hero-inner">
        <p class="eyebrow">A personal agent · Privacy by design</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="dek">${escapeHtml(subtitle)}</p>
        <a class="read-link" href="#if-you-want-to-enjoy-the-party-you-need-to-give-up-some-things">Read the essay <span aria-hidden="true">↓</span></a>
      </div>
    </div>
    <article class="article-body">${article}</article>
  </main>
  <footer class="site-footer"><span>Good-enough privacy with Hermes Agent</span><a href="#article">Back to top ↑</a></footer>
</body>
</html>\n`;

fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, 'index.html'), html);
fs.writeFileSync(path.join(docs, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${siteUrl}</loc></url></urlset>\n`);
fs.writeFileSync(path.join(docs, '.nojekyll'), '');
