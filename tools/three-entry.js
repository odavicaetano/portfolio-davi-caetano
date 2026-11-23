// Entrada do pacote 3D (gere com: npm run build:vendor). Exporta só o que os visualizadores usam.
export {
  WebGLRenderer, Scene, PerspectiveCamera, PMREMGenerator, ACESFilmicToneMapping, SRGBColorSpace,
  Box3, Vector3, Sphere, CanvasTexture, Mesh, PlaneGeometry, MeshBasicMaterial, MeshStandardMaterial,
  PointsMaterial, Points, DirectionalLight, HemisphereLight, Group,
} from 'three';
export { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
export { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
export { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
