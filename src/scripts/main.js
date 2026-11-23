import { projects, categories, statusLabel } from '../data/projects.js';
import media from '../data/media.js';
import { openLightbox } from './lightbox.js';

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Imagens ---------- */
const m = (proj, id) => media[proj]?.[id];
const objPos = { center: '50% 50%', top: '50% 0%', left: '0% 50%', right: '100% 50%' };
function picture(md, alt, { eager = false } = {}) {
  return `<picture>
    <source srcset="${md.thumb}.webp" type="image/webp">
    <img src="${md.thumb}.jpg" alt="${esc(alt)}" width="800" height="600" ${eager ? '' : 'loading="lazy"'} decoding="async" style="object-position:${objPos[md.pos] || '50% 50%'}">
  </picture>`;
}
const galleryItems = p => p.gallery.map(([id, caption]) => ({ full: m(p.id, id).full, caption, alt: caption }));

/* ---------- Cards ---------- */
const grid = $('#projectsGrid');
const icons = {
  live: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  code: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 7-5 5 5 5m8-10 5 5-5 5"/></svg>',
  source: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  case: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>',
};
function linkHtml(l, cls = 'link-action') {
  const cl = l.kind === 'live' ? `${cls} primary` : cls;
  return `<a class="${cl}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)} ${icons[l.kind] || ''}<span class="sr-only"> (abre em nova aba)</span></a>`;
}

function cardHtml(p) {
  const cover = p.cover && m(p.id, p.cover);
  const coverCaption = p.gallery.find(g => g[0] === p.cover)?.[1] || p.title;
  const tags = `<div class="tags"><span class="tag tag-${p.status}">${statusLabel[p.status]}</span>${p.period ? `<span class="tag">${esc(p.period)}</span>` : ''}</div>`;
  const mediaHtml = cover
    ? `<div class="card-media"><button class="img-button" data-gallery="${p.id}" aria-label="Ampliar imagens de ${esc(p.title)}">${picture(cover, coverCaption)}</button>${tags}</div>`
    : `<div class="card-media ${p.anchorCover ? '' : 'is-placeholder'}">${p.anchorCover ? `<a class="img-button" href="${p.anchor}" aria-label="Ir para o visualizador 3D">${picture(p.anchorCover, 'Renderização do modelo 3D da estátua de Helena Antipoff.')}</a>` : '<span class="placeholder-mark" aria-hidden="true">3D</span>'}${tags}</div>`;
  const actions = [];
  if (p.anchor) actions.push(`<a class="link-action primary" href="${p.anchor}">Abrir visualizador 3D ${icons.case}</a>`);
  else actions.push(`<a class="link-action" href="#/projeto/${p.id}" data-case="${p.id}">Ver case ${icons.case}</a>`);
  p.links.filter(l => l.kind !== 'source').forEach(l => actions.push(linkHtml(l)));
  return `<article class="card project-card ${p.featured ? 'is-featured' : ''}" data-id="${p.id}" data-cats="${p.categories.join(' ')}">
    ${mediaHtml}
    <div class="card-body">
      <p class="card-kicker">${esc(p.kicker)}</p>
      <h3 class="card-title">${esc(p.title)}</h3>
      <p class="card-summary">${esc(p.summary)}</p>
      ${p.tools.length ? `<ul class="card-tools" aria-label="Ferramentas">${p.tools.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <div class="card-actions">${actions.join('')}</div>
    </div>
  </article>`;
}

function renderCards() {
  grid.innerHTML = projects.filter(p => !['docencia','helena-3d'].includes(p.id)).sort((a,b) => (a.id === 'titanic' ? -1 : b.id === 'titanic' ? 1 : 0)).map(cardHtml).join('');
  const teaching = projects.find(p => p.id === 'docencia');
  const preview = $('#teachingPreview');
  if (teaching && preview) {
    const cover = m(teaching.id, teaching.cover);
    if (cover) preview.innerHTML = `<img src="${cover.full}" alt="Davi Caetano durante palestra sobre criatividade e inteligência artificial" loading="lazy" decoding="async">`;
  }
}

/* ---------- Filtros ---------- */
const filtersEl = $('#projectFilters');
function renderFilters() {
  filtersEl.innerHTML = categories.map(c => {
    const n = c.id === 'all' ? projects.filter(p => !['docencia','helena-3d'].includes(p.id)).length : projects.filter(p => !['docencia','helena-3d'].includes(p.id) && p.categories.includes(c.id)).length;
    return `<button class="chip ${c.id === 'all' ? 'is-active' : ''}" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${esc(c.label)}<span class="count">${n}</span></button>`;
  }).join('');
}
function applyFilter(cat) {
  let shown = 0;
  grid.querySelectorAll('.project-card').forEach(card => {
    const ok = cat === 'all' || card.dataset.cats.split(' ').includes(cat);
    card.hidden = !ok;
    // Destaque ocupa linha inteira só na visão "Todos".
    card.classList.toggle('is-featured', ok && cat === 'all' && projects.find(p => p.id === card.dataset.id).featured);
    if (ok) shown++;
  });
  filtersEl.querySelectorAll('.chip').forEach(b => {
    const on = b.dataset.filter === cat;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-pressed', on);
  });
  $('#emptyState').hidden = shown > 0;
  $('#filterStatus').textContent = `${shown} ${shown === 1 ? 'projeto' : 'projetos'} exibidos.`;
}
filtersEl.addEventListener('click', e => {
  const b = e.target.closest('[data-filter]');
  if (b) applyFilter(b.dataset.filter);
});

/* ---------- Galerias dos cards ---------- */
document.addEventListener('click', e => {
  const g = e.target.closest('[data-gallery]');
  if (g) {
    const p = projects.find(x => x.id === g.dataset.gallery);
    const start = Math.max(0, p.gallery.findIndex(x => x[0] === (g.dataset.start || p.cover)));
    openLightbox(galleryItems(p), start);
    return;
  }
  const s = e.target.closest('[data-lightbox-single]');
  if (s) openLightbox([{ full: s.dataset.full, caption: s.dataset.caption, alt: s.querySelector('img')?.alt }]);
});

/* ---------- Case (rota #/projeto/<id>) ---------- */
const caseDlg = $('#caseDialog');
const caseContent = $('#caseContent');
const sectionTitles = { contexto: 'Contexto', desafio: 'Desafio', papel: 'Meu papel', processo: 'Processo', entregas: 'Entregas', resultados: 'Resultados' };
let lastFocus = null;

function caseHtml(p) {
  const cover = p.cover && m(p.id, p.cover);
  const blocks = Object.entries(p.sections).filter(([k]) => k !== 'papel').map(([k, v]) => `
    <div class="case-block"><h3>${sectionTitles[k] || k}</h3>${Array.isArray(v) ? `<ul>${v.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : `<p>${esc(v)}</p>`}</div>`).join('');
  const aside = [
    p.sections.papel && `<div class="case-block"><h3>Meu papel</h3><p>${esc(p.sections.papel)}</p></div>`,
    p.tools.length && `<div class="case-block"><h3>Ferramentas</h3><ul class="card-tools">${p.tools.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`,
    p.credits && `<div class="case-block"><h3>Créditos</h3><p>${esc(p.credits)}</p></div>`,
    p.pending && `<div class="case-block"><h3>Pendência</h3><p><span class="tag tag-pending">A confirmar</span> ${esc(p.pending)}</p></div>`,
  ].filter(Boolean).join('');
  const gallery = p.id === 'docencia' ? `<div class="teaching-case-groups"><section class="teaching-case-group"><h3>Criatividade na Era da Inteligência Artificial: ferramenta ou muleta?</h3><div class="case-gallery">${[['palestra-ia-1','Palestra sobre criatividade e inteligência artificial'],['palestra-ia-2','Auditório da palestra']].map(([id,c])=>`<figure><button class="img-button" data-gallery="docencia" data-start="${id}" aria-label="Ampliar ${c}">${picture(m('docencia',id),c)}</button><figcaption>${c}</figcaption></figure>`).join('')}</div></section><section class="teaching-case-group"><h3>Inteligência Artificial: expanda sua criatividade!</h3><div class="case-gallery">${[['ia-criatividade-palco','Palestra no palco'],['ia-criatividade-publico','Público da palestra'],['ia-criatividade-grupo','Participantes'],['ia-criatividade-conversa','Conversa com o público']].map(([id,c])=>`<figure><button class="img-button" data-gallery="docencia" data-start="${id}" aria-label="Ampliar ${c}">${picture(m('docencia',id),c)}</button><figcaption>${c}</figcaption></figure>`).join('')}</div></section><section class="teaching-case-group"><h3>Aulas e formação em Multimídia</h3><div class="case-gallery">${[['turma-multimidia','Turma do Técnico em Multimídia'],['aula-eventos','Aula sobre tecnologia e criatividade em eventos']].map(([id,c])=>`<figure><button class="img-button" data-gallery="docencia" data-start="${id}" aria-label="Ampliar ${c}">${picture(m('docencia',id),c)}</button><figcaption>${c}</figcaption></figure>`).join('')}</div></section></div>` : p.gallery.length > 1 ? `<div><div class="case-block"><h3>Galeria</h3></div><div class="case-gallery">${p.gallery.map(([id, c], i) => `
      <figure><button class="img-button" data-gallery="${p.id}" data-start="${id}" aria-label="Ampliar imagem ${i + 1}: ${esc(c)}">${picture(m(p.id, id), c)}</button><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div></div>` : '';
  return `
    ${cover ? `<div class="case-hero"><button class="img-button" data-gallery="${p.id}" aria-label="Ampliar capa"><img src="${cover.full}" alt="${esc(p.gallery[0]?.[1] || p.title)}" width="${cover.w}" height="${cover.h}" style="object-position:${objPos[cover.pos] || '50% 50%'}"></button></div>` : ''}
    <div class="case-body">
      <header class="case-head">
        <p class="card-kicker">${esc(p.kicker)}</p>
        <h2 id="caseTitle">${esc(p.title)}</h2>
        <div class="tags-row"><span class="tag tag-${p.status}">${statusLabel[p.status]}</span>${p.period ? `<span class="tag">${esc(p.period)}</span>` : ''}</div>
        <p class="lead">${esc(p.summary)}</p>
        ${p.links.length ? `<div class="case-links">${p.links.map(l => `<a class="btn ${l.kind === 'live' ? 'btn-primary' : 'btn-ghost'}" href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.label)}<span class="sr-only"> (abre em nova aba)</span></a>`).join('')}</div>` : ''}
      </header>
      <div class="case-cols"><div>${blocks}</div>${aside ? `<aside class="case-aside">${aside}</aside>` : ''}</div>
      ${gallery}
      ${p.sources?.length ? `<p class="case-sources">Referências: ${p.sources.map(esc).join(' · ')}</p>` : ''}
    </div>`;
}

function openCase(id) {
  const p = projects.find(x => x.id === id && !x.anchor);
  if (!p) return false;
  caseContent.innerHTML = caseHtml(p);
  if (!caseDlg.open) { lastFocus = document.activeElement; caseDlg.showModal(); }
  caseDlg.querySelector('.case-shell').scrollTop = 0;
  $('#caseClose').focus();
  document.body.classList.add('no-scroll');
  document.title = `${p.title} | Davi Caetano Portfólio Digital`;
  return true;
}
const baseTitle = document.title;
function closeCase() { if (caseDlg.open) caseDlg.close(); }
caseDlg.addEventListener('close', () => {
  document.title = baseTitle;
  if (location.hash.startsWith('#/projeto/')) history.pushState(null, '', location.pathname + location.search + '#projetos');
  if (!document.querySelector('dialog[open]')) document.body.classList.remove('no-scroll');
  (lastFocus && document.contains(lastFocus) ? lastFocus : grid.querySelector('[data-case]'))?.focus();
});
$('#caseClose').addEventListener('click', closeCase);
caseDlg.addEventListener('click', e => { if (e.target === caseDlg) closeCase(); });

function route() {
  const mt = location.hash.match(/^#\/projeto\/([\w-]+)/);
  if (mt) { if (!openCase(mt[1])) history.replaceState(null, '', '#projetos'); }
  else closeCase();
}
window.addEventListener('hashchange', route);

/* ---------- Menu, navegação e detalhes ---------- */
const toggle = $('#menuToggle'), menu = $('#mobileMenu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.hidden = !open;
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
matchMedia('(min-width: 1025px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

const toTop = $('#toTop');
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    toTop.hidden = scrollY < innerHeight * .8;
    const y = scrollY + innerHeight * .35;
    let cur = -1;
    sections.forEach((s, i) => { if (s && s.offsetTop <= y) cur = i; });
    navLinks.forEach((a, i) => a.setAttribute('aria-current', i === cur ? 'true' : 'false'));
    ticking = false;
  });
}, { passive: true });

const toast = $('#toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}
$('#copyEmail').addEventListener('click', async e => {
  const email = e.currentTarget.dataset.email;
  try { await navigator.clipboard.writeText(email); showToast('E-mail copiado. Agora é só colar.'); }
  catch { location.href = `mailto:${email}`; }
});

// Monograma pisca de vez em quando quando alguém passa o mouse muitas vezes.
const brand = $('.brand');
let hovers = 0;
brand.addEventListener('mouseenter', () => {
  if (reducedMotion || ++hovers % 3) return;
  brand.classList.add('is-winking');
  setTimeout(() => brand.classList.remove('is-winking'), 700);
});

/* ---------- 3D sob demanda ---------- */
function whenVisible(el, cb, margin = '200px') {
  if (!el) return;
  const r = el.getBoundingClientRect();
  if (r.bottom > 0 && r.top < innerHeight) { cb(); return; } // já está na tela
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { rootMargin: margin });
  io.observe(el);
}
function webglOk() {
  // Teste barato: criar um contexto só para testar custa caro em GPUs fracas. Falhas reais caem no catch do import.
  return 'WebGLRenderingContext' in window;
}
const hero = $('#hero3DContainer');
const statue = $('#statue3DContainer');
// O hero mostra primeiro uma imagem dos óculos; o 3D entra depois que a página carregou.
const afterLoad = fn => {
  let done = false;
  const run = () => { if (!done) { done = true; fn(); } };
  const go = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1500 });
    setTimeout(run, 1800); // garantia caso o navegador nunca fique ocioso
  };
  if (document.readyState === 'complete') go();
  else { addEventListener('load', go, { once: true }); setTimeout(run, 6000); }
};
if (webglOk()) {
  afterLoad(() => whenVisible(hero, () => import('./viewer-glasses.js').then(mod => mod.init(hero)).catch(showFallback), '0px'));
  whenVisible(statue, () => import('./viewer-statue.js').then(mod => mod.init(statue)).catch(() => {
    $('#statueLoaderText').textContent = 'Não foi possível carregar o modelo 3D neste navegador.';
  }));
} else {
  showFallback();
  $('#statueLoaderText').textContent = 'Seu navegador não oferece WebGL, necessário para o modelo 3D.';
}
function showFallback() {
  hero?.classList.add('is-static');
}

/* ---------- Início ---------- */
const helena = projects.find(p => p.id === 'helena-3d');
if (helena && media['helena-3d']?.render) helena.anchorCover = media['helena-3d'].render;
renderFilters();
renderCards();
applyFilter('all');
route();




