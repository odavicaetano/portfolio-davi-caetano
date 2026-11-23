// Gera favicon.ico e os ícones PNG a partir de favicon.svg, e a imagem de reserva dos óculos.
// A capa de compartilhamento (assets/og-image.jpg) é feita e mantida à mão pelo autor: este script não a altera.
// Uso: node tools/build-brand.mjs
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

// Imagem estática dos óculos (fallback sem WebGL), renderizada por tools/render-glasses.html.
try {
  mkdirSync('assets/images/oculos', { recursive: true });
  await sharp('media-src/capturas/oculos-render.png').resize(900, 900).jpeg({ quality: 85 }).toFile('assets/images/oculos/oculos-render.jpg');
} catch (e) { console.log('Sem captura para o fallback dos óculos.', e.message); }
console.log('ok');
