// Converte os OBJ originais em GLB otimizados para a web.
// Uso: node tools/build-models.mjs <pasta-dos-originais>
//   <pasta>/45-oculos/oculos.obj + glasses.png  -> assets/models/oculos/oculos.glb
//   <pasta>/Helena Antipoff.obj                -> assets/models/helena-antipoff/helena-antipoff.glb
// Os OBJ originais não são alterados; guarde-os fora do site (são a fonte).
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, KHRMaterialsTransmission } from '@gltf-transform/extensions';
import { weld, meshopt, dedup, prune, quantize } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const src = process.argv[2];
if (!src) throw new Error('Informe a pasta dos originais.');
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder });

/** Lê um OBJ triangulando polígonos. Devolve triângulos "desindexados" com posição, uv e normal. */
function parseObj(text) {
  const v = [], vt = [], vn = [];
  const out = { pos: [], uv: [], nor: [] };
  for (const line of text.split('\n')) {
    if (line.startsWith('v ')) { const p = line.split(/\s+/); v.push([+p[1], +p[2], +p[3]]); }
    else if (line.startsWith('vt ')) { const p = line.split(/\s+/); vt.push([+p[1], +p[2]]); }
    else if (line.startsWith('vn ')) { const p = line.split(/\s+/); vn.push([+p[1], +p[2], +p[3]]); }
    else if (line.startsWith('f ')) {
      const idx = line.trim().split(/\s+/).slice(1).map(t => t.split('/').map(n => (n ? parseInt(n, 10) : 0)));
      for (let i = 1; i < idx.length - 1; i++) {
        for (const c of [idx[0], idx[i], idx[i + 1]]) {
          const [a, b, n] = c;
          out.pos.push(...v[a < 0 ? v.length + a : a - 1]);
          out.uv.push(...(b ? vt[b < 0 ? vt.length + b : b - 1] : [0, 0]));
          out.nor.push(...(n ? vn[n < 0 ? vn.length + n : n - 1] : [0, 0, 0]));
        }
      }
    }
  }
  return out;
}

function addPrim(doc, buffer, data, material, { uv = true, nor = true } = {}) {
  const prim = doc.createPrimitive().setMaterial(material)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(data.pos)).setBuffer(buffer));
  if (uv) prim.setAttribute('TEXCOORD_0', doc.createAccessor().setType('VEC2').setArray(new Float32Array(data.uv)).setBuffer(buffer));
  if (nor) prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(data.nor)).setBuffer(buffer));
  return prim;
}

// ---------- Óculos ----------
{
  const dir = join(src, '45-oculos');
  const obj = parseObj(readFileSync(join(dir, 'oculos.obj'), 'utf8'));
  // A textura tem um retângulo branco (px 163..348 x 118..264) que seria das lentes; o OBJ atual
  // não tem faces mapeadas ali (só a armação), mas o teste fica para uma versão futura com lentes.
  const isLens = (u, v) => u > 160 / 512 && u < 351 / 512 && (1 - v) > 115 / 512 && (1 - v) < 267 / 512;
  const frame = { pos: [], uv: [], nor: [] }, lens = { pos: [], uv: [], nor: [] };
  for (let t = 0; t < obj.pos.length / 9; t++) {
    let u = 0, w = 0;
    for (let k = 0; k < 3; k++) { u += obj.uv[(t * 3 + k) * 2] / 3; w += obj.uv[(t * 3 + k) * 2 + 1] / 3; }
    const target = isLens(u, w) ? lens : frame;
    target.pos.push(...obj.pos.slice(t * 9, t * 9 + 9));
    target.uv.push(...obj.uv.slice(t * 6, t * 6 + 6));
    target.nor.push(...obj.nor.slice(t * 9, t * 9 + 9));
  }
  const doc = new Document();
  const buffer = doc.createBuffer();
  const tex = doc.createTexture('armacao').setImage(readFileSync(join(dir, 'glasses.png'))).setMimeType('image/png');
  const matFrame = doc.createMaterial('armacao').setBaseColorTexture(tex).setRoughnessFactor(0.32).setMetallicFactor(0.05);
  const tr = doc.createExtension(KHRMaterialsTransmission);
  const matLens = doc.createMaterial('lente').setBaseColorFactor([0.75, 0.8, 1, 0.28]).setAlphaMode('BLEND')
    .setRoughnessFactor(0.05).setMetallicFactor(0).setDoubleSided(true)
    .setExtension('KHR_materials_transmission', tr.createTransmission().setTransmissionFactor(0.9));
  const mesh = doc.createMesh('oculos').addPrimitive(addPrim(doc, buffer, frame, matFrame));
  if (lens.pos.length) mesh.addPrimitive(addPrim(doc, buffer, lens, matLens));
  doc.createScene().addChild(doc.createNode('oculos').setMesh(mesh));
  await doc.transform(weld(), dedup(), prune());
  const outDir = 'assets/models/oculos';
  mkdirSync(outDir, { recursive: true });
  await io.write(join(outDir, 'oculos.glb'), doc);
  console.log(`óculos: ${frame.pos.length / 9} triângulos de armação, ${lens.pos.length / 9} de lente`);
}

// ---------- Helena Antipoff ----------
{
  const text = readFileSync(join(src, 'Helena Antipoff.obj'), 'utf8');
  // Indexado direto (o arquivo não traz normais; a textura PBR referenciada não foi fornecida, então UV é descartado).
  const v = [], f = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('v ')) { const p = line.split(/\s+/); v.push(+p[1], +p[2], +p[3]); }
    else if (line.startsWith('f ')) {
      const idx = line.trim().split(/\s+/).slice(1).map(t => parseInt(t, 10) - 1);
      for (let i = 1; i < idx.length - 1; i++) f.push(idx[0], idx[i], idx[i + 1]);
    }
  }
  const before = f.length / 3;
  // Solda vértices coincidentes (o OBJ duplica vértices nas costuras de UV).
  const key = new Map(), remap = new Uint32Array(v.length / 3), wv = [];
  for (let i = 0; i < v.length / 3; i++) {
    const k = `${v[i * 3].toFixed(6)},${v[i * 3 + 1].toFixed(6)},${v[i * 3 + 2].toFixed(6)}`;
    let id = key.get(k);
    if (id === undefined) { id = wv.length / 3; key.set(k, id); wv.push(v[i * 3], v[i * 3 + 1], v[i * 3 + 2]); }
    remap[i] = id;
  }
  const pos = new Float32Array(wv);
  const idx0 = Uint32Array.from(f, i => remap[i]);
  const target = Math.floor(idx0.length * 0.36 / 3) * 3;
  const [simp] = MeshoptSimplifier.simplify(idx0, pos, 3, target, 0.002);
  // Compacta os vértices usados.
  const used = new Map(), np = [];
  const ni = new Uint32Array(simp.length);
  for (let i = 0; i < simp.length; i++) {
    let id = used.get(simp[i]);
    if (id === undefined) { id = np.length / 3; used.set(simp[i], id); np.push(pos[simp[i] * 3], pos[simp[i] * 3 + 1], pos[simp[i] * 3 + 2]); }
    ni[i] = id;
  }
  // Normais suaves por área.
  const nn = new Float32Array(np.length);
  for (let t = 0; t < ni.length; t += 3) {
    const [a, b, c] = [ni[t], ni[t + 1], ni[t + 2]];
    const ux = np[b * 3] - np[a * 3], uy = np[b * 3 + 1] - np[a * 3 + 1], uz = np[b * 3 + 2] - np[a * 3 + 2];
    const vx = np[c * 3] - np[a * 3], vy = np[c * 3 + 1] - np[a * 3 + 1], vz = np[c * 3 + 2] - np[a * 3 + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    for (const p of [a, b, c]) { nn[p * 3] += cx; nn[p * 3 + 1] += cy; nn[p * 3 + 2] += cz; }
  }
  for (let i = 0; i < nn.length; i += 3) {
    const l = Math.hypot(nn[i], nn[i + 1], nn[i + 2]) || 1; nn[i] /= l; nn[i + 1] /= l; nn[i + 2] /= l;
  }
  const doc = new Document();
  const buffer = doc.createBuffer();
  const mat = doc.createMaterial('bronze').setBaseColorFactor([0.62, 0.5, 0.38, 1]).setRoughnessFactor(0.45).setMetallicFactor(0.6);
  const prim = doc.createPrimitive().setMaterial(mat)
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(np)).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(nn).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(ni).setBuffer(buffer));
  doc.createScene().addChild(doc.createNode('helena-antipoff').setMesh(doc.createMesh('helena').addPrimitive(prim)));
  await doc.transform(
    quantize({ quantizePosition: 14, quantizeNormal: 10 }),
    meshopt({ encoder: MeshoptEncoder, level: 'high' }),
  );
  const after = ni.length / 3;
  const outDir = 'assets/models/helena-antipoff';
  mkdirSync(outDir, { recursive: true });
  await io.write(join(outDir, 'helena-antipoff.glb'), doc);
  writeFileSync(join(outDir, 'FONTE.txt'),
    `Derivado de "Helena Antipoff.obj" (${v.length / 3} vértices, ${before} triângulos).\n` +
    `Versão web: ${Math.round(after)} triângulos (simplificação meshoptimizer), normais recalculadas, compressão EXT_meshopt_compression.\n` +
    `O OBJ original referencia "material.mtl" e texturas PBR que não foram fornecidas; o site usa material neutro.\n`);
  console.log(`helena: ${before} -> ${Math.round(after)} triângulos`);
}

