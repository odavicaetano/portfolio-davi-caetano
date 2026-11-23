// Helena Antipoff: modelo real (helena-antipoff.glb, derivado do OBJ original).
// Modos Sólido, Malha e Pontos usam a mesma geometria verdadeira.
import {
  DirectionalLight, HemisphereLight, MeshStandardMaterial, MeshBasicMaterial, PointsMaterial, Points,
  Vector3, OrbitControls, Box3, Sphere,
} from '../vendor/three-bundle.min.js';
import { createStage, loadGLB, normalize, contactShadow, fitDistance } from './three-common.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

export async function init(container) {
  const loaderEl = document.getElementById('statueLoader');
  const bar = document.getElementById('statueProgress');
  const text = document.getElementById('statueLoaderText');
  const hint = document.getElementById('statueHint');
  text.textContent = 'Carregando o modelo 3D…';

  const { scene, camera, renderer, setFrame, start } = createStage(container, { fov: 32 });
  scene.add(new HemisphereLight(0xdfe4ff, 0x1a1a22, 0.6));
  const key = new DirectionalLight(0xfff1dc, 2.4); key.position.set(3, 5, 4); scene.add(key);
  const rim = new DirectionalLight(0x6366f1, 2.2); rim.position.set(-4, 2, -3); scene.add(rim);
  const kick = new DirectionalLight(0x00f2fe, 0.7); kick.position.set(-3, -1, 3); scene.add(kick);

  const url = new URL('../../assets/models/helena-antipoff/helena-antipoff.glb', import.meta.url).href;
  const gltf = await loadGLB(url, e => {
    if (e.lengthComputable) {
      const p = Math.round(e.loaded / e.total * 100);
      bar.style.width = p + '%';
      text.textContent = `Carregando o modelo 3D… ${p}%`;
    }
  });
  const root = gltf.scene;
  let mesh;
  root.traverse(o => { if (o.isMesh && !mesh) mesh = o; });
  const { size } = normalize(root, 2.4);
  scene.add(root);
  const shadow = contactShadow(size.x * 1.6, size.z * 1.6, 0.7);
  shadow.position.y = -size.y / 2 - 0.01;
  scene.add(shadow);

  // Materiais dos três modos.
  const solid = new MeshStandardMaterial({ color: 0x7d5f45, metalness: 0.6, roughness: 0.4, envMapIntensity: 0.9 });
  const wire = new MeshBasicMaterial({ color: 0x00f2fe, wireframe: true, transparent: true, opacity: 0.35 });
  const pts = new Points(mesh.geometry, new PointsMaterial({ color: 0xa5b4fc, size: 0.006, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false }));
  pts.visible = false;
  mesh.parent.add(pts);
  pts.position.copy(mesh.position); pts.quaternion.copy(mesh.quaternion); pts.scale.copy(mesh.scale);
  mesh.material = solid;

  // Câmera e controles.
  const box = new Box3().setFromObject(root);
  const sphere = box.getBoundingSphere(new Sphere());
  const target = new Vector3(0, 0, 0);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 1.2;
  controls.minPolarAngle = 0.25;
  controls.maxPolarAngle = Math.PI / 2 + 0.15;
  const home = () => {
    const d = fitDistance(camera, sphere.radius, 1.05);
    controls.minDistance = d * 0.35;
    controls.maxDistance = d * 1.8;
    camera.position.set(0.25 * d, 0.12 * d, d);
    controls.target.copy(target);
    controls.update();
  };
  home();
  let restUntil = 0;
  controls.addEventListener('start', () => { controls.autoRotate = false; hint.classList.add('is-hidden'); });
  controls.addEventListener('end', () => { restUntil = performance.now() + 3000; });

  document.getElementById('statueReset').addEventListener('click', () => { home(); restUntil = 0; start(); });
  document.querySelectorAll('[data-mode]').forEach(btn => btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-mode]').forEach(b => {
      const on = b === btn;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
    mesh.visible = mode !== 'points';
    pts.visible = mode === 'points';
    mesh.material = mode === 'wireframe' ? wire : solid;
    shadow.visible = mode === 'solid';
    start();
  }));

  setFrame(t => {
    if (!reduced && !controls.autoRotate && restUntil && t > restUntil) controls.autoRotate = true;
    controls.update();
  });
  loaderEl.hidden = true;
}


