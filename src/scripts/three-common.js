// Base comum dos visualizadores: renderizador com pixel ratio limitado, ajuste de tamanho,
// pausa fora da tela e utilidades de enquadramento.
import {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace,
  Box3, Vector3, Sphere, CanvasTexture, Mesh, PlaneGeometry, MeshBasicMaterial,
  RoomEnvironment, GLTFLoader, MeshoptDecoder,
} from '../vendor/three-bundle.min.js';

export function createStage(container, { fov = 35 } = {}) {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const camera = new PerspectiveCamera(fov, 1, 0.01, 100);

  let visible = true, frame = null, onFrame = () => {};
  const resize = () => {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container);
  resize();

  const loop = t => {
    frame = null;
    if (!visible || document.hidden) return;
    onFrame(t);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  };
  const start = () => { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(loop); };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }).observe(container);
  document.addEventListener('visibilitychange', start);

  return { renderer, scene, camera, setFrame: fn => { onFrame = fn; start(); }, start };
}

export function loadGLB(url, onProgress) {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return new Promise((resolve, reject) => loader.load(url, resolve, onProgress, reject));
}

/** Centraliza o objeto na origem e o escala para que a maior dimensão valha `size`. */
export function normalize(object, size = 2) {
  const box = new Box3().setFromObject(object);
  const dim = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const s = size / Math.max(dim.x, dim.y, dim.z);
  object.scale.setScalar(s);
  object.position.copy(center).multiplyScalar(-s);
  return { size: dim.multiplyScalar(s) };
}

/** Distância de câmera para enquadrar uma esfera de raio r. */
export function fitDistance(camera, r, margin = 1.15) {
  const vFov = camera.fov * Math.PI / 180;
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  return margin * r / Math.sin(Math.min(vFov, hFov) / 2);
}

/** Sombra de contato suave (gradiente radial num plano). */
export function contactShadow(width, depth, opacity = 0.55) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, `rgba(0,0,0,${opacity})`);
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const mesh = new Mesh(new PlaneGeometry(width, depth), new MeshBasicMaterial({ map: new CanvasTexture(c), transparent: true, depthWrite: false }));
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export { Box3, Sphere, Vector3 };


