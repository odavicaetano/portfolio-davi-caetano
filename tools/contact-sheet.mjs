// Gera uma folha de contato numerada das imagens de uma pasta (uso interno de curadoria).
// Uso: node tools/contact-sheet.mjs <pasta> <saida.jpg>
import sharp from 'sharp';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const [dir, out] = process.argv.slice(2);
const files = readdirSync(dir).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const W = 360, H = 270, cols = 4;
const tiles = await Promise.all(files.map(async (f, i) => {
  const img = await sharp(join(dir, f)).resize(W, H - 30, { fit: 'contain', background: '#222' }).toBuffer();
  const label = Buffer.from(`<svg width="${W}" height="30"><rect width="100%" height="100%" fill="#000"/><text x="6" y="21" font-size="16" fill="#fff" font-family="Arial">${i + 1}</text></svg>`);
  return sharp({ create: { width: W, height: H, channels: 3, background: '#000' } })
    .composite([{ input: img, top: 0, left: 0 }, { input: label, top: H - 30, left: 0 }]).jpeg().toBuffer();
}));
const rows = Math.ceil(tiles.length / cols);
await sharp({ create: { width: W * cols, height: H * rows, channels: 3, background: '#000' } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % cols) * W, top: Math.floor(i / cols) * H })))
  .jpeg({ quality: 80 }).toFile(out);
files.forEach((f, i) => console.log(i + 1, f));
