// Hero: os óculos do autor (oculos.glb, convertido do OBJ original com a textura original).
// Rotação lenta automática, arraste horizontal para girar (a rolagem vertical da página continua livre)
// e um "aceno" ao tocar duas vezes.
import { DirectionalLight, Group, SRGBColorSpace } from '../vendor/three-bundle.min.js';
import { createStage, loadGLB, normalize, contactShadow, fitDistance } from './three-common.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function init(container) {
  const { scene, camera, setFrame } = createStage(container, { fov: 30 });
  const key = new DirectionalLight(0xffffff, 2.2); key.position.set(2, 3, 4); scene.add(key);
  const rim = new DirectionalLight(0x8b8ff8, 2.5); rim.position.set(-3, 1, -3); scene.add(rim);
  const fill = new DirectionalLight(0x00f2fe, 0.8); fill.position.set(-2, -1, 3); scene.add(fill);

  const gltf = await loadGLB(new URL('../../assets/models/oculos/oculos.glb', import.meta.url).href);
  const model = gltf.scene;
  model.traverse(o => {
    if (o.isMesh && o.material) {
      if (o.material.map) o.material.map.colorSpace = SRGBColorSpace;
      o.material.envMapIntensity = 2.2;
    }
  });
  const { size } = normalize(model, 2);
  const rig = new Group();   // gira o objeto
  const hop = new Group();   // animação do aceno
  rig.add(model); hop.add(rig); scene.add(hop);
  const shadow = contactShadow(size.x * 1.1, size.z * 1.6 + 0.4, 0.6);
  shadow.position.y = -size.y / 2 - 0.25;
  scene.add(shadow);

  const r = Math.hypot(size.x, size.y, size.z) / 2;
  // Enquadra pela caixa real dos óculos: em palcos largos, eles ocupam a largura disponível
  // sem cortar a rotação nem o "aceno"; em palcos quadrados o resultado é o mesmo de antes.
  const place = () => {
    const vF = camera.fov * Math.PI / 180;
    const hF = 2 * Math.atan(Math.tan(vF / 2) * camera.aspect);
    const rh = Math.hypot(size.x, size.z) / 2;
    const rv = size.y / 2 + 0.35;
    const d = Math.max(rh * 1.05 / Math.tan(hF / 2), rv * 1.25 / Math.tan(vF / 2), fitDistance(camera, r, 1.12) * 0.55) + rh * 0.35;
    camera.position.set(0, 0.35, d); camera.lookAt(0, -0.22, 0);
  };
  place();
  new ResizeObserver(place).observe(container);

  // Interação: arraste com ponteiro.
  let dragging = false, lastX = 0, lastY = 0, velocity = 0, tiltTarget = 0, idleUntil = 0;
  rig.rotation.y = -0.6;
  const el = container;
  el.style.touchAction = 'pan-y';
  el.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; el.setPointerCapture?.(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    rig.rotation.y += dx * 0.01;
    velocity = dx * 0.01;
    if (e.pointerType === 'mouse') tiltTarget = Math.max(-0.5, Math.min(0.5, tiltTarget + dy * 0.006));
  });
  const end = () => { if (dragging) { dragging = false; idleUntil = performance.now() + 1800; } };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
  el.addEventListener('pointerleave', end);

  // Aceno: pulinho com meia volta (duplo clique ou toque duplo).
  let waveStart = -1;
  const wave = () => { if (waveStart < 0) waveStart = performance.now(); };
  el.addEventListener('dblclick', wave);
  let lastTap = 0;
  el.addEventListener('pointerup', e => {
    if (e.pointerType !== 'touch') return;
    const now = performance.now();
    if (now - lastTap < 320) wave();
    lastTap = now;
  });
  // Teclado: o contêiner recebe foco e responde às setas.
  el.tabIndex = 0;
  el.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { rig.rotation.y -= 0.25; idleUntil = performance.now() + 1800; }
    if (e.key === 'ArrowRight') { rig.rotation.y += 0.25; idleUntil = performance.now() + 1800; }
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wave(); }
  });

  let last = performance.now();
  setFrame(t => {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (!dragging) {
      rig.rotation.y += velocity; velocity *= 0.92;
      if (!reduced && t > idleUntil) rig.rotation.y += dt * 0.35;
      tiltTarget *= 0.97;
    }
    rig.rotation.x += (tiltTarget - rig.rotation.x) * 0.1;
    if (waveStart >= 0) {
      const k = (t - waveStart) / 900;
      if (k >= 1 || reduced) { hop.position.y = 0; hop.rotation.z = 0; hop.rotation.y = 0; waveStart = -1; }
      else {
        hop.position.y = Math.sin(k * Math.PI) * 0.35;
        hop.rotation.y = easeInOut(k) * Math.PI * 2;
        hop.rotation.z = Math.sin(k * Math.PI * 2) * 0.12;
      }
      shadow.material.opacity = 1 - hop.position.y * 1.2;
    } else if (!reduced) {
      hop.position.y = Math.sin(t / 1400) * 0.03; // flutuação leve
    }
  });
  container.classList.add('is-ready');
}

const easeInOut = k => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);



