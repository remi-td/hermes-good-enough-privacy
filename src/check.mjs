import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'docs/index.html'), 'utf8');
const source = fs.readFileSync(path.join(root, 'article.md'), 'utf8');
const checks = [
  [html.includes('<link rel="canonical" href="https://remi-td.github.io/hermes-good-enough-privacy/">'), 'canonical URL'],
  [(html.match(/class="mermaid"/g) || []).length === 3, 'three diagrams'],
  [html.includes('src="assets/architecture.png"'), 'architecture image'],
  [html.includes('id="8-choose-the-messaging-channel-deliberately"'), 'complete article'],
  [!html.includes('Good-enough%20privacy%20architecture'), 'resolved image path'],
  [fs.statSync(path.join(root, 'docs/assets/architecture.png')).size > 0, 'image asset'],
  [fs.statSync(path.join(root, 'docs/assets/diagrams.js')).size > 0, 'diagram bundle'],
  [source.includes('## How well does this work?'), 'source conclusion']
];
for (const [ok, label] of checks) {
  if (!ok) throw new Error(`Check failed: ${label}`);
  console.log(`✓ ${label}`);
}
