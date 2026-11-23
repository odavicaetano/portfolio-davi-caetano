import { projects, categories, statusLabel } from '../data/projects.js';
import media from '../data/media.js';
import { openLightbox } from './lightbox.js';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const HIDDEN_FROM_GRID = ['docencia', 'helena-3d'];
const TOP_ORDER = ['titanic', 'engefril'];
const topRank = id => { const i = TOP_ORDER.indexOf(id); return i < 0 ? TOP_ORDER.length : i; };

/* ---------- Imagens ---------- */
const m = (proj, id) => media[proj]?.[id];
const objPos = { center: '50% 50%', top: '50% 0%', left: '0% 50%', right: '100% 50%' };
function picture(md, alt, { eager = false } = {}) {
  return md.thumb ? `<picture><source srcset="${md.thumb}.webp" type="image/webp"><img src="${md.thumb}.jpg" alt="${esc(alt)}" width="800" height="600" ${eager ? '' : 'loading="lazy"'} decoding="async" style="object-position:${objPos[md.pos] || '50% 50%'}"></picture>` : `<img src="${md.full}" alt="${esc(alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async" style="object-position:${objPos[md.pos] || '50% 50%'}">`;
}
// Galerias dos cases: a imagem inteira, sem recorte, com o box na proporção real dela.
function fitImage(md, alt) {
  return `<img src="${md.full}" alt="${esc(alt)}" width="${md.w}" height="${md.h}" loading="lazy" decoding="async" style="aspect-ratio:${md.w} / ${md.h}">`;
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

function cardHtml(p, i) {
  const cover = p.cover && m(p.id, p.cover);
  const coverCaption = p.gallery.find(g => g[0] === p.cover)?.[1] || p.title;
  const tags = `<div class="tags"><span class="tag tag-${p.status}">${statusLabel[p.status]}</span>${p.period ? `<span class="tag">${esc(p.period)}</span>` : ''}</div>`;
  const mediaHtml = cover
    ? `<div class="card-media" data-cursor="Ampliar"><button class="img-button" data-gallery="${p.id}" aria-label="Ampliar imagens de ${esc(p.title)}"><img src="${cover.full}" alt="${esc(coverCaption)}" width="${cover.w}" height="${cover.h}" loading="lazy" decoding="async"${cover.pos && cover.pos !== 'center' ? ` style="object-position:${objPos[cover.pos]}"` : ''}></button>${tags}</div>`
    : `<div class="card-media ${p.anchorCover ? '' : 'is-placeholder'}">${p.anchorCover ? `<a class="img-button" href="${p.anchor}" aria-label="Ir para o visualizador 3D">${picture(p.anchorCover, 'Renderização do modelo 3D da estátua de Helena Antipoff.')}</a>` : '<span class="placeholder-mark" aria-hidden="true">3D</span>'}${tags}</div>`;
  const actions = [];
  if (p.anchor) actions.push(`<a class="link-action primary" href="${p.anchor}">Abrir visualizador 3D ${icons.case}</a>`);
  else actions.push(`<a class="link-action" href="#/projeto/${p.id}" data-case="${p.id}">Ver case ${icons.case}</a>`);
  p.links.filter(l => l.kind !== 'source').forEach(l => actions.push(linkHtml(l)));
  return `<article class="card project-card ${p.featured ? 'is-featured' : ''}" data-id="${p.id}" data-cats="${p.categories.join(' ')}" style="view-transition-name:card-${p.id}">
    ${mediaHtml}
    <div class="card-body">
      <span class="card-index" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <p class="card-kicker">${esc(p.kicker)}</p>
      <h3 class="card-title">${esc(p.title)}</h3>
      <p class="card-summary">${esc(p.summary)}</p>
      ${p.tools.length ? `<ul class="card-tools" aria-label="Ferramentas">${p.tools.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
      <div class="card-actions">${actions.join('')}</div>
    </div>
  </article>`;
}

const gridProjects = () => projects
  .filter(p => !HIDDEN_FROM_GRID.includes(p.id))
  // Titanic abre a grade e o ENGEFRIL 3D vem logo depois; o resto segue a ordem de projects.js.
  .sort((a, b) => topRank(a.id) - topRank(b.id));

function renderCards() {
  grid.innerHTML = gridProjects().map(cardHtml).join('');
  const teaching = projects.find(p => p.id === 'docencia');
  const preview = $('#teachingPreview');
  if (teaching && preview) {
    const cover = m(teaching.id, teaching.cover);
    if (cover) preview.insertAdjacentHTML('afterbegin', picture(cover, 'Davi Caetano durante palestra sobre criatividade e inteligência artificial'));
  }
  const count = $('#projectCount');
  if (count) { const n = projects.filter(p => p.id !== 'docencia').length; count.dataset.to = n; count.textContent = n; }
}

/* ---------- Layout da grade ----------
   Destaques ocupam a linha inteira e alternam o lado da imagem.
   A última linha nunca fica com buraco: sobras viram cartões mais largos. */
function columns() {
  if (matchMedia('(max-width: 760px)').matches) return 1;
  if (matchMedia('(max-width: 1024px)').matches) return 2;
  return 3;
}
function layoutGrid(cat) {
  const cols = columns();
  const visible = $$('.project-card', grid).filter(c => !c.hidden);
  let featuredCount = 0;
  const regular = [];
  visible.forEach(card => {
    const p = projects.find(x => x.id === card.dataset.id);
    const featured = cat === 'all' && p.featured;
    card.classList.toggle('is-featured', featured);
    card.classList.remove('span-3', 'is-wide', 'is-flip');
    if (featured) { card.classList.toggle('is-flip', featuredCount % 2 === 1); featuredCount++; }
    else regular.push(card);
  });
  if (cols === 3) {
    const rest = regular.length % 3;
    if (rest === 2) regular.slice(-2).forEach(c => c.classList.add('span-3'));
    if (rest === 1) regular.at(-1).classList.add('is-wide');
  } else if (cols === 2 && regular.length % 2 === 1) {
    regular.at(-1).classList.add('is-wide');
  }
}

/* ---------- Filtros ---------- */
const filtersEl = $('#projectFilters');
let currentFilter = 'all';
let pill;
function renderFilters() {
  const list = gridProjects();
  filtersEl.innerHTML = categories.map(c => {
    const n = c.id === 'all' ? list.length : list.filter(p => p.categories.includes(c.id)).length;
    return `<button class="chip ${c.id === 'all' ? 'is-active' : ''}" data-filter="${c.id}" aria-pressed="${c.id === 'all'}">${esc(c.label)}<span class="count">${n}</span></button>`;
  }).join('');
  pill = document.createElement('span');
  pill.className = 'filter-pill';
  pill.setAttribute('aria-hidden', 'true');
  filtersEl.prepend(pill);
}
function movePill(instant = false) {
  const active = $('.chip.is-active', filtersEl);
  if (!active || !pill) return;
  if (instant) pill.style.transition = 'none';
  pill.style.width = `${active.offsetWidth}px`;
  pill.style.height = `${active.offsetHeight}px`;
  pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
  if (instant) { void pill.offsetWidth; pill.style.transition = ''; }
}
function applyFilter(cat, { animate = false } = {}) {
  const update = () => {
    currentFilter = cat;
    let shown = 0;
    $$('.project-card', grid).forEach(card => {
      const ok = cat === 'all' || card.dataset.cats.split(' ').includes(cat);
      card.hidden = !ok;
      if (ok) shown++;
    });
    layoutGrid(cat);
    $$('.chip', filtersEl).forEach(b => {
      const on = b.dataset.filter === cat;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
    $('#emptyState').hidden = shown > 0;
    $('#filterStatus').textContent = `${shown} ${shown === 1 ? 'projeto' : 'projetos'} exibidos.`;
    movePill();
  };
  if (animate && !reducedMotion && document.startViewTransition) {
    // Os cartões já revelados não devem refazer a entrada durante a troca.
    $$('.project-card.will-reveal', grid).forEach(c => c.classList.remove('will-reveal'));
    document.startViewTransition(update);
  } else update();
}
filtersEl.addEventListener('click', e => {
  const b = e.target.closest('[data-filter]');
  if (b && b.dataset.filter !== currentFilter) {
    applyFilter(b.dataset.filter, { animate: true });
    b.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reducedMotion ? 'auto' : 'smooth' });
  }
});
// Setas do teclado percorrem os filtros.
filtersEl.addEventListener('keydown', e => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const chips = $$('.chip', filtersEl);
  const i = chips.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  chips[(i + (e.key === 'ArrowRight' ? 1 : -1) + chips.length) % chips.length].focus();
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

function teachingGroup(title, items) {
  return `<section class="teaching-case-group"><h3>${title}</h3><div class="case-gallery">${items.map(([id, c]) => `<figure><button class="img-button" data-gallery="docencia" data-start="${id}" aria-label="Ampliar ${c}">${fitImage(m('docencia', id), c)}</button><figcaption>${c}</figcaption></figure>`).join('')}</div></section>`;
}

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
  const gallery = p.id === 'docencia'
    ? `<div class="teaching-case-groups">${
        teachingGroup('Criatividade na Era da Inteligência Artificial: ferramenta ou muleta?', [['palestra-ia-1', 'Palestra sobre criatividade e inteligência artificial'], ['palestra-ia-2', 'Auditório da palestra']])
      }${teachingGroup('Inteligência Artificial: expanda sua criatividade!', [['ia-criatividade-palco', 'Palestra no palco'], ['ia-criatividade-publico', 'Público da palestra'], ['ia-criatividade-grupo', 'Participantes'], ['ia-criatividade-conversa', 'Conversa com o público']])
      }${teachingGroup('Aulas e formação em Multimídia', [['turma-multimidia', 'Turma do Técnico em Multimídia'], ['aula-eventos', 'Aula sobre tecnologia e criatividade em eventos']])}</div>`
    : p.gallery.length > 1
      ? `<div><div class="case-block"><h3>Galeria</h3></div><div class="case-gallery">${p.gallery.map(([id, c], i) => `
      <figure><button class="img-button" data-gallery="${p.id}" data-start="${id}" aria-label="Ampliar imagem ${i + 1}: ${esc(c)}">${fitImage(m(p.id, id), c)}</button><figcaption>${esc(c)}</figcaption></figure>`).join('')}</div></div>`
      : '';
  return `
    ${cover ? `<div class="case-hero"><button class="img-button" data-gallery="${p.id}" aria-label="Ampliar capa"><img src="${cover.full}" alt="${esc(p.gallery[0]?.[1] || p.title)}" width="${cover.w}" height="${cover.h}" style="aspect-ratio:${cover.w} / ${cover.h}"></button></div>` : ''}
    <div class="case-body">
      <header class="case-head">
        <p class="card-kicker">${esc(p.kicker)}</p>
        <h2 id="caseTitle">${esc(p.title)}</h2>
        <div class="tags-row"><span class="tag tag-${p.status}">${statusLabel[p.status]}</span>${p.period ? `<span class="tag">${esc(p.period)}</span>` : ''}</div>
        <p class="lead">${esc(p.summary)}</p>
        ${p.links.length ? `<div class="case-links">${p.links.map(l => `<a class="btn ${l.kind === 'live' ? 'btn-primary' : 'btn-ghost'}" href="${esc(l.href)}" target="_blank" rel="noopener"><span>${esc(l.label)}</span><span class="sr-only"> (abre em nova aba)</span></a>`).join('')}</div>` : ''}
      </header>
      <div class="case-cols"><div>${blocks}</div>${aside ? `<aside class="case-aside">${aside}</aside>` : ''}</div>
      ${gallery}
    </div>`;
}

function openCase(id) {
  const p = projects.find(x => x.id === id && !x.anchor);
  if (!p) return false;
  caseContent.innerHTML = caseHtml(p);
  caseDlg.classList.remove('is-closing');
  if (!caseDlg.open) { lastFocus = document.activeElement; caseDlg.showModal(); }
  caseDlg.querySelector('.case-shell').scrollTop = 0;
  $('#caseClose').focus();
  document.body.classList.add('no-scroll');
  document.title = `${p.title} | Davi Caetano Portfólio Digital`;
  return true;
}
const baseTitle = document.title;
let closing = false;
// Fecha com uma saída curta; sem movimento, fecha na hora.
function closeCase() {
  if (!caseDlg.open || closing) return;
  if (reducedMotion) { caseDlg.close(); return; }
  closing = true;
  caseDlg.classList.add('is-closing');
  setTimeout(() => { caseDlg.close(); caseDlg.classList.remove('is-closing'); closing = false; }, 360);
}
caseDlg.addEventListener('cancel', e => { e.preventDefault(); closeCase(); });
caseDlg.addEventListener('close', () => {
  document.title = baseTitle;
  if (location.hash.startsWith('#/projeto/')) history.pushState(null, '', location.pathname + location.search + '#projetos');
  if (!document.querySelector('dialog[open]')) document.body.classList.remove('no-scroll');
  (lastFocus && document.contains(lastFocus) ? lastFocus : grid.querySelector('[data-case]'))?.focus({ preventScroll: true });
});
$('#caseClose').addEventListener('click', closeCase);
caseDlg.addEventListener('click', e => { if (e.target === caseDlg) closeCase(); });

function route() {
  const mt = location.hash.match(/^#\/projeto\/([\w-]+)/);
  if (mt) { if (!openCase(mt[1])) history.replaceState(null, '', '#projetos'); }
  else closeCase();
}
window.addEventListener('hashchange', route);

/* ---------- Menu ---------- */
const toggle = $('#menuToggle'), menu = $('#mobileMenu');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  menu.hidden = !open;
}
toggle.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); } });
matchMedia('(min-width: 1101px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* ---------- Rolagem: cabeçalho, progresso, navegação, linha do tempo, paralaxe ---------- */
const header = $('.site-header');
const toTop = $('#toTop');
const progress = $('#scrollProgress');
const navLinks = $$('.main-nav a');
const navIndicator = $('#navIndicator');
const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));
const timeline = $('#timeline');
const tlFill = $('#tlProgress');
const tlItems = $$('.tl-item');
const parallax = $$('.section-index, .giant-outline');
let lastY = scrollY, ticking = false, currentNav = -2;

function moveNavIndicator(i) {
  if (!navIndicator) return;
  if (i < 0) { navIndicator.style.opacity = '0'; return; }
  const a = navLinks[i];
  navIndicator.style.opacity = '1';
  navIndicator.style.width = `${a.offsetWidth}px`;
  navIndicator.style.transform = `translateX(${a.offsetLeft}px)`;
}

function onScroll() {
  const y = scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  header.classList.toggle('is-scrolled', y > 24);
  const menuOpen = !menu.hidden;
  header.classList.toggle('is-hidden', !menuOpen && y > innerHeight * .6 && y > lastY + 4);
  if (y < lastY - 4) header.classList.remove('is-hidden');
  lastY = y;

  toTop.hidden = y < innerHeight * .9;

  const probe = y + innerHeight * .35;
  let cur = -1;
  sections.forEach((s, i) => { if (s && s.offsetTop <= probe) cur = i; });
  if (cur !== currentNav) {
    currentNav = cur;
    navLinks.forEach((a, i) => a.setAttribute('aria-current', i === cur ? 'true' : 'false'));
    moveNavIndicator(cur);
  }

  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const mark = innerHeight * .6;
    const p = Math.min(1, Math.max(0, (mark - r.top) / r.height));
    tlFill.style.setProperty('--p', p.toFixed(4));
    tlItems.forEach(item => item.classList.toggle('is-passed', item.getBoundingClientRect().top + 30 < mark));
  }

  if (!reducedMotion) {
    parallax.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      el.style.setProperty('--py', `${((r.top + r.height / 2 - innerHeight / 2) * -0.06).toFixed(1)}px`);
    });
  }
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
addEventListener('resize', () => { moveNavIndicator(currentNav); movePill(true); }, { passive: true });
// Ao trocar de coluna (desktop, tablet, celular), refaz a distribuição da grade.
['(max-width: 760px)', '(max-width: 1024px)'].forEach(q => matchMedia(q).addEventListener('change', () => { layoutGrid(currentFilter); movePill(true); }));

/* ---------- Revelação ao rolar ---------- */
function splitWords(el) {
  let i = 0;
  const walk = node => {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(' '); return; }
          const w = document.createElement('span'); w.className = 'w';
          const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i++);
          wi.textContent = part; w.append(wi); frag.append(w);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1 && (child.tagName === 'EM' || child.classList.contains('shine'))) {
        // Texto em degradê sobe inteiro: dividido em palavras, o navegador o esconde durante o movimento.
        const w = document.createElement('span'); w.className = 'w';
        const wi = document.createElement('span'); wi.className = 'wi'; wi.style.setProperty('--i', i++);
        child.replaceWith(w); wi.append(child); w.append(wi);
      } else if (child.nodeType === 1) walk(child);
    });
  };
  walk(el);
}

const revealIO = 'IntersectionObserver' in window && !reducedMotion ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    revealIO.unobserve(el);
    el.classList.add('is-in');
    // Depois de entrar, devolve a cada elemento as transições próprias (hover etc.).
    const type = el.dataset.reveal;
    if (el.classList.contains('will-reveal')) setTimeout(() => el.classList.remove('will-reveal'), 1700);
    else if (type === undefined || type === '' || type === 'scale') setTimeout(() => { el.removeAttribute('data-reveal'); el.classList.remove('is-in'); }, 1500);
    if (el.matches('.stats')) $$('.count-up', el).forEach(countUp);
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: .12 }) : null;

function setupReveals(root = document) {
  if (!revealIO) {
    $$('.count-up', root).forEach(n => { n.textContent = n.dataset.to; });
    return;
  }
  $$('[data-reveal="lines"]', root).forEach(splitWords);
  // Elementos irmãos entram em cascata.
  $$('[data-reveal]', root).forEach(el => {
    const sibs = [...el.parentElement.children].filter(s => s.hasAttribute('data-reveal'));
    el.style.setProperty('--rd', `${Math.min(sibs.indexOf(el), 6) * 0.07}s`);
    revealIO.observe(el);
  });
}
function revealCards() {
  if (!revealIO) return;
  $$('.project-card', grid).forEach(card => {
    card.classList.add('will-reveal');
    revealIO.observe(card);
  });
  // Cartões lado a lado entram em sequência.
  let rowTop = null, k = 0;
  $$('.project-card', grid).forEach(card => {
    const t = card.offsetTop;
    k = t === rowTop ? k + 1 : 0; rowTop = t;
    card.style.setProperty('--rd', `${k * 0.12}s`);
  });
}

function countUp(el) {
  const to = +el.dataset.to, from = +(el.dataset.from || 0);
  const dur = 1400, t0 = performance.now();
  const step = t => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Microinterações de ponteiro ---------- */
if (finePointer && !reducedMotion) {
  // Luz do hero acompanha o ponteiro.
  const hero = $('.hero');
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  // Luz e borda dos cartões.
  grid.addEventListener('pointermove', e => {
    const card = e.target.closest('.project-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--cx', `${e.clientX - r.left}px`);
    card.style.setProperty('--cy', `${e.clientY - r.top}px`);
  });

  // Rótulo circular que segue o cursor sobre as capas.
  const label = $('#cursorLabel');
  let lx = -200, ly = -200, tx = -200, ty = -200, raf = null;
  const follow = () => {
    lx += (tx - lx) * .22; ly += (ty - ly) * .22;
    label.style.setProperty('--x', `${lx}px`); label.style.setProperty('--y', `${ly}px`);
    raf = Math.abs(tx - lx) + Math.abs(ty - ly) > .5 ? requestAnimationFrame(follow) : null;
  };
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    const target = e.target.closest?.('[data-cursor]');
    if (target) label.textContent = target.dataset.cursor;
    label.classList.toggle('is-on', !!target);
    if (!raf) raf = requestAnimationFrame(follow);
  }, { passive: true });

  // Botões magnéticos.
  document.addEventListener('pointermove', e => {
    const b = e.target.closest?.('.magnetic');
    $$('.magnetic.is-pulled').forEach(x => { if (x !== b) { x.style.transform = ''; x.classList.remove('is-pulled'); } });
    if (!b) return;
    const r = b.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / r.width;
    const dy = (e.clientY - r.top - r.height / 2) / r.height;
    b.classList.add('is-pulled');
    b.style.transform = `translate(${dx * 10}px, ${dy * 8}px)`;
  });
}

/* ---------- Detalhes ---------- */
const toast = $('#toast');
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2800);
}
$('#copyEmail').addEventListener('click', async e => {
  const btn = e.currentTarget;
  const email = btn.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    showToast('E-mail copiado. Agora é só colar.');
    const chip = $('.copy-chip', btn);
    btn.classList.add('is-copied'); chip.textContent = 'Copiado ✓';
    setTimeout(() => { btn.classList.remove('is-copied'); chip.textContent = 'Copiar'; }, 2600);
  } catch { location.href = `mailto:${email}`; }
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
  if (r.bottom > 0 && r.top < innerHeight) { cb(); return; }
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); cb(); }
  }, { rootMargin: margin });
  io.observe(el);
}
const webglOk = () => 'WebGLRenderingContext' in window;
const hero3D = $('#hero3DContainer');
const statue = $('#statue3DContainer');
const afterLoad = fn => {
  let done = false;
  const run = () => { if (!done) { done = true; fn(); } };
  const go = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1500 });
    setTimeout(run, 1800);
  };
  if (document.readyState === 'complete') go();
  else { addEventListener('load', go, { once: true }); setTimeout(run, 6000); }
};
if (webglOk()) {
  afterLoad(() => whenVisible(hero3D, () => import('./viewer-glasses.js').then(mod => mod.init(hero3D)).catch(showFallback), '0px'));
  whenVisible(statue, () => import('./viewer-statue.js').then(mod => mod.init(statue)).catch(() => {
    $('#statueLoaderText').textContent = 'Não foi possível carregar o modelo 3D neste navegador.';
  }));
} else {
  showFallback();
  $('#statueLoaderText').textContent = 'Seu navegador não oferece WebGL, necessário para o modelo 3D.';
}
function showFallback() { hero3D?.classList.add('is-static'); }

/* ---------- Início ---------- */
const helena = projects.find(p => p.id === 'helena-3d');
if (helena && media['helena-3d']?.render) helena.anchorCover = media['helena-3d'].render;
renderFilters();
renderCards();
applyFilter('all');
setupReveals();
revealCards();
route();
onScroll();
// As fontes mudam a largura dos chips e links: reposiciona os indicadores quando chegarem.
document.fonts?.ready.then(() => { movePill(true); moveNavIndicator(currentNav); });
requestAnimationFrame(() => movePill(true));
