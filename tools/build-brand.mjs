// Gera favicon.ico, ícones PNG e a capa social (Open Graph) a partir de favicon.svg.
// Uso: node tools/build-brand.mjs  (rode depois de build-images.mjs)
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const svg = readFileSync('favicon.svg');
mkdirSync('assets/icons', { recursive: true });
for (const s of [32, 180, 192, 512]) {
  await sharp(svg, { density: 600 }).resize(s, s).png().toFile(`assets/icons/icon-${s}.png`);
}
// ICO com PNGs de 16, 32 e 48 px embutidos.
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(s => sharp(svg, { density: 600 }).resize(s, s).png().toBuffer()));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e); header.writeUInt8(s, e + 1); header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(pngs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
  offset += pngs[i].length;
});
writeFileSync('favicon.ico', Buffer.concat([header, ...pngs]));

// Capa social 1200x630: monograma, nome, eixo e uma miniatura do próprio site (se existir).
const W = 1200, H = 630;
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
    </pattern>
    <radialGradient id="glow" cx="0.15" cy="0.2" r="0.7">
      <stop offset="0" stop-color="#6366f1" stop-opacity="0.35"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="#0a0a0c"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <g transform="translate(72 72) scale(1.25)">${svg.toString().replace(/<\/?svg[^>]*>/g, '')}</g>
  <text x="72" y="300" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="88" fill="#ffffff">DAVI</text>
  <text x="72" y="392" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="88" fill="#c7cbe0">CAETANO</text>
  <text x="74" y="458" font-family="Consolas, monospace" font-size="19" fill="#00f2fe" letter-spacing="2">DESIGN · COMUNICAÇÃO · TECNOLOGIA</text>
  <text x="74" y="560" font-family="Arial, sans-serif" font-size="24" fill="#9ca3af">Davi Caetano Portfólio Digital</text>
</svg>`);
const layers = [];
try {
  const shot = await sharp('media-src/capturas/portfolio.png').resize(520, 325, { fit: 'cover', position: 'north' })
    .composite([{ input: Buffer.from('<svg width="520" height="325"><rect x="0.5" y="0.5" width="519" height="324" rx="14" fill="none" stroke="#2a2a35" stroke-width="2"/></svg>') }])
    .png().toBuffer();
  const mask = Buffer.from('<svg width="520" height="325"><rect width="520" height="325" rx="14"/></svg>');
  layers.push({ input: await sharp(shot).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer(), left: 620, top: 152 });
} catch { console.log('Sem captura do site ainda (media-src/capturas/portfolio.png); capa gerada sem miniatura.'); }
await sharp(bg).composite(layers).jpeg({ quality: 88 }).toFile('assets/og-image.jpg');
// Imagem estática dos óculos (fallback sem WebGL), recortada da captura do site.
try {
  mkdirSync('assets/images/oculos', { recursive: true });
  await sharp('media-src/capturas/portfolio.png').extract({ left: 803, top: 222, width: 515, height: 420 })
    .resize(900, 900, { fit: 'contain', background: '#16161c' }).jpeg({ quality: 85 }).toFile('assets/images/oculos/oculos-render.jpg');
} catch (e) { console.log('Sem captura para o fallback dos óculos.', e.message); }
console.log('ok');


