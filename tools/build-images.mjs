// Gera miniaturas (WebP + JPEG de reserva) e versões ampliadas (JPEG) das imagens dos projetos,
// e escreve src/data/media.js com dimensões e caminhos.
// Uso: node tools/build-images.mjs <pasta-dos-anexos>
// As fontes ficam fora do site (pasta de anexos e media-src/, ignorada pelo git).
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const anexos = process.argv[2];
if (!anexos) throw new Error('Informe a pasta dos anexos.');
const A = f => join(anexos, f);
const B = (p, f) => join('media-src/behance', p, f);
const C = f => join('media-src/capturas', f);

// [projeto, id, fonte, posição do recorte da miniatura]
const list = [
  ['reurb', 'capa', B('reurb', '01.webp'), 'center'],
  ['reurb', 'livreto-apresentacao', B('reurb', '02.webp'), 'center'],
  ['reurb', 'sobre', B('reurb', '04.webp'), 'top'],
  ['reurb', 'cores-tipografia', B('reurb', '05.webp'), 'top'],
  ['reurb', 'grafismos', B('reurb', '06.webp'), 'top'],
  ['reurb', 'capa-contracapa', B('reurb', '07.webp'), 'center'],
  ['reurb', 'miolo', B('reurb', '08.webp'), 'top'],
  ['reurb', 'pagina-prefeituras', B('reurb', '09.webp'), 'top'],
  ['reurb', 'recomposicao-16-9', B('reurb', '10.webp'), 'top'],
  ['reurb', 'apresentacao-slides', B('reurb', '11.webp'), 'top'],
  ['reurb', 'resultados', B('reurb', '12.webp'), 'top'],
  ['reurb', 'entradas-em-camadas', B('reurb', '13.webp'), 'top'],
  ['reurb', 'ficha-tecnica', B('reurb', '14.webp'), 'center'],
  ['reurb', 'versao-web', C('reurb-web.png'), 'center'],
  ['marca-cohab', 'capa', B('marca-cohab', '01.webp'), 'center'],
  ['marca-cohab', 'assinatura', B('marca-cohab', '02.webp'), 'center'],
  ['marca-cohab', 'estudo', B('marca-cohab', '03.webp'), 'center'],
  ['marca-cohab', 'referencias', B('marca-cohab', '04.webp'), 'center'],
  ['marca-cohab', 'tipografia', B('marca-cohab', '05.webp'), 'center'],
  ['marca-cohab', 'paleta', B('marca-cohab', '06.webp'), 'center'],
  ['marca-cohab', 'aplicacoes', B('marca-cohab', '07.webp'), 'center'],
  ['marca-cohab', 'versao-negativa', B('marca-cohab', '08.webp'), 'center'],
  ['campanhas', 'setembro-amarelo', B('setembro', '01.webp'), 'center'],
  ['campanhas', 'setembro-azul', B('setembro', '02.webp'), 'center'],
  ['qr-studio', 'capa', A('Desenvolvi o QR Studio.jpg'), 'contain'],
  ['qr-studio', 'editor', C('qr-studio.png'), 'top'],
  ['titanic', 'capa', A('titanic.png'), 'contain'],
  ['titanic', 'museu', C('titanic.png'), 'center'],
  ['assinatura', 'capa', A('facilitar a criação de assinaturas institucionais de e-mail.jpg'), 'contain'],
  ['assinatura', 'formulario', C('assinatura.png'), 'top'],
  ['engefril', 'capa', C('engefril-capa.webp'), 'left'],
  ['engefril', 'inicio', C('engefril.png'), 'center'],
  ['guia-de-helena', 'capa', A('Guia de Helena.jpg'), 'center'],
  ['docencia', 'turma-multimidia', A('professor da turma do Técnico em Multimídia..jpg'), 'center'],
  ['docencia', 'aula-eventos', A('Ministrei uma aula sobre Tecnologia e Criatividade na área de Eventos..jpg'), 'left'],
  ['docencia', 'palestra-ia-1', A('Criatividade na Era da Inteligência Artificial Ferramenta ou Muleta (2).jpg'), 'center'],
  ['docencia', 'palestra-ia-2', A('Criatividade na Era da Inteligência Artificial Ferramenta ou Muleta (1).jpg'), 'center'],
  ['docencia', 'ia-criatividade-palco', A('Inteligência Artificial Expanda sua Criatividade!.jpg'), 'right'],
  ['docencia', 'ia-criatividade-publico', A('Inteligência Artificial Expanda sua Criatividade! (1).jpg'), 'center'],
  ['docencia', 'ia-criatividade-grupo', A('Inteligência Artificial Expanda sua Criatividade! (2).jpg'), 'center'],
  ['docencia', 'ia-criatividade-conversa', A('Inteligência Artificial Expanda sua Criatividade! (3).jpg'), 'center'],
  ['fha-eventos', 'teloes-1', A('criar e auxiliar na programação dos telões (3).jpg'), 'center'],
  ['fha-eventos', 'teloes-2', A('criar e auxiliar na programação dos telões (2).jpg'), 'center'],
  ['fha-eventos', 'teloes-3', A('criar e auxiliar na programação dos telões (1).jpg'), 'center'],
  ['fha-eventos', 'teloes-4', A('criar e auxiliar na programação dos telões (4).jpg'), 'center'],
  ['fha-eventos', 'captacao', A('Hoje encerro minha jornada na Fundação Helena Antipoff (2).jpg'), 'top'],
  ['fha-eventos', 'crachas', A('Hoje encerro minha jornada na Fundação Helena Antipoff (1).jpg'), 'center'],
  ['fha-eventos', 'trilha-formativa-2025', A('Foi emocionante e transformador participar de mais uma Trilha Formativa da segunda edição 2025.jpg'), 'center'],
  ['helena-3d', 'render', C('helena-render.png'), 'center'],
  ['trajetoria', 'cohab-inicio', A('iniciei um novo capítulo na minha trajetória profissional como Designer Gráfico na ASCOM.jpg'), 'center'],
  ['trajetoria', 'fic-eventos', A('concluí o curso FIC Organizador de Eventos do Pronatec,.jpg'), 'center'],
];

const media = {};
for (const [proj, id, src, pos] of list) {
  const dir = join('assets/images', proj);
  mkdirSync(dir, { recursive: true });
  const base = join(dir, id);
  const img = sharp(src, { animated: false }).rotate();
  const meta = await img.metadata();
  const fullW = Math.min(meta.width, 2200);
  const full = await sharp(src).rotate().resize({ width: fullW, withoutEnlargement: true })
    .flatten({ background: '#0a0a0c' }).jpeg({ quality: 84, mozjpeg: true }).toFile(base + '.jpg');
  const position = { center: 'centre', top: 'north', left: 'west', right: 'east', contain: 'centre' }[pos];
  // 'contain': peças com texto nas bordas; a imagem inteira entra no 4:3 sobre a cor dominante.
  const dom = pos === 'contain' ? (await sharp(src).stats()).dominant : null;
  const thumb = pos === 'contain'
    ? sharp(src).rotate().resize(800, 600, { fit: 'contain', background: dom }).flatten({ background: dom })
    : sharp(src).rotate().resize(800, 600, { fit: 'cover', position }).flatten({ background: '#0a0a0c' });
  await thumb.clone().webp({ quality: 78 }).toFile(base + '-thumb.webp');
  await thumb.clone().jpeg({ quality: 78, mozjpeg: true }).toFile(base + '-thumb.jpg');
  (media[proj] ??= {})[id] = {
    full: `${base}.jpg`.replaceAll('\\', '/'), w: full.width, h: full.height,
    thumb: `${base}-thumb`.replaceAll('\\', '/'), pos,
  };
  console.log(proj, id, `${full.width}x${full.height}`);
}
writeFileSync('src/data/media.js',
  '// Gerado por tools/build-images.mjs. Não edite à mão.\nexport default ' + JSON.stringify(media, null, 2) + ';\n');



