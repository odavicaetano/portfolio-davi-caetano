// Visualização ampliada: imagem inteira (sem o recorte da miniatura), teclado, deslizar e legenda.
const dlg = document.getElementById('lightbox');
const img = document.getElementById('lbImg');
const stage = document.getElementById('lbStage');
const cap = document.getElementById('lbCaption');
const count = document.getElementById('lbCount');
const spinner = document.getElementById('lbSpinner');
const err = document.getElementById('lbError');
const prev = document.getElementById('lbPrev');
const next = document.getElementById('lbNext');

let items = [];
let index = 0;
let returnFocus = null;

function show(i) {
  index = (i + items.length) % items.length;
  const it = items[index];
  img.classList.remove('is-loaded');
  err.hidden = true;
  spinner.hidden = false;
  img.alt = it.alt || it.caption || '';
  img.onload = () => { spinner.hidden = true; img.classList.add('is-loaded'); };
  img.onerror = () => { spinner.hidden = true; err.hidden = false; };
  img.src = it.full;
  cap.textContent = it.caption || '';
  const many = items.length > 1;
  count.textContent = many ? `${index + 1} de ${items.length}` : '';
  prev.hidden = next.hidden = !many;
  // Pré-carrega a vizinha.
  if (many) { const n = new Image(); n.src = items[(index + 1) % items.length].full; }
}

export function openLightbox(list, start = 0) {
  items = list;
  returnFocus = document.activeElement;
  show(start);
  if (!dlg.open) dlg.showModal();
  document.body.classList.add('no-scroll');
}

function close() { dlg.close(); }

dlg.addEventListener('close', () => {
  img.removeAttribute('src');
  if (!document.querySelector('dialog[open]')) document.body.classList.remove('no-scroll');
  returnFocus?.focus?.();
});
document.getElementById('lbClose').addEventListener('click', close);
prev.addEventListener('click', () => show(index - 1));
next.addEventListener('click', () => show(index + 1));
dlg.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
});
// Clique no fundo (fora da imagem e dos botões) fecha.
dlg.addEventListener('click', e => {
  if (e.target === stage || e.target === dlg) close();
});
// Deslizar no celular.
let x0 = null, y0 = null;
stage.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
stage.addEventListener('touchend', e => {
  if (x0 === null) return;
  const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
  if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && items.length > 1) show(index + (dx < 0 ? 1 : -1));
  else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  x0 = y0 = null;
}, { passive: true });
