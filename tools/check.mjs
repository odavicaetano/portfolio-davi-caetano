// Verificação rápida: arquivos referenciados existem, âncoras internas existem,
// links externos respondem e os textos não usam travessões.
// Uso: node tools/check.mjs [--offline]
import { readFileSync, existsSync, statSync } from 'node:fs';
import media from '../src/data/media.js';
import { projects } from '../src/data/projects.js';

const offline = process.argv.includes('--offline');
const html = readFileSync('index.html', 'utf8');
const problems = [];

// 1. Arquivos locais citados no HTML.
for (const [, ref] of html.matchAll(/(?:src|href|srcset|data-src|data-full)="([^"#:]+?)"/g)) {
  if (!existsSync(ref)) problems.push(`Arquivo ausente no HTML: ${ref}`);
}
// 2. Mídias geradas.
let count = 0, bytes = 0;
for (const proj of Object.values(media)) for (const m of Object.values(proj)) {
  for (const f of m.thumb ? [m.full, `${m.thumb}.webp`, `${m.thumb}.jpg`] : [m.full]) {
    if (!existsSync(f)) problems.push(`Mídia ausente: ${f}`); else { count++; bytes += statSync(f).size; }
  }
}
// 3. Projetos apontam para imagens existentes.
for (const p of projects) {
  for (const [id] of p.gallery) if (!media[p.id]?.[id]) problems.push(`Projeto ${p.id}: imagem ${id} sem mídia`);
  if (p.cover && !media[p.id]?.[p.cover]) problems.push(`Projeto ${p.id}: capa ${p.cover} sem mídia`);
}
// 4. Âncoras internas.
const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]));
for (const [, a] of html.matchAll(/href="#([^"/]+)"/g)) if (!ids.has(a)) problems.push(`Âncora sem destino: #${a}`);
// 5. Travessões nos textos.
for (const f of ['index.html', 'src/data/projects.js', '404.html']) {
  if (/[—–]/.test(readFileSync(f, 'utf8'))) problems.push(`Travessão encontrado em ${f}`);
}
// 6. Links externos.
const ext = new Set([...html.matchAll(/href="(https:[^"]+)"/g)].map(m => m[1]));
projects.forEach(p => p.links.forEach(l => ext.add(l.href)));
const linkReport = [];
if (!offline) {
  await Promise.all([...ext].map(async url => {
    if (url.includes('fonts.g') || url.includes('odavicaetano.github.io/portfolio-davi-caetano')) return;
    try {
      const r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (link check)' } });
      linkReport.push(`${r.status} ${url}`);
      if (r.status >= 400 && !/linkedin|behance/.test(url)) problems.push(`Link com erro ${r.status}: ${url}`);
    } catch (e) { problems.push(`Link inacessível: ${url} (${e.message})`); }
  }));
}
console.log(`Mídias: ${count} arquivos, ${(bytes / 1048576).toFixed(1)} MB`);
linkReport.sort().forEach(l => console.log('  ' + l));
console.log(problems.length ? `\n${problems.length} problema(s):\n- ` + problems.join('\n- ') : '\nNenhum problema encontrado.');
process.exitCode = problems.length ? 1 : 0;
