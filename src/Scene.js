import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

export let scene, camera, controls, renderer, model;

export const verticalParts = [];
export const horizontalParts = [];
export const mainFrameParts = [];

let modelReadyCallback = null;
let boundingBoxHelper = null;

export function registerOnModelReady(callback) {
  modelReadyCallback = callback;
}

export function initThree(container) {
  if (container.firstChild) container.removeChild(container.firstChild);

  const width = container.clientWidth;
  const height = container.clientHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0xa3d69c);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 5, 10);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(light);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: 0.3 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  new RGBELoader().setPath("/models/").load("Background.hdr", (texture) => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envMap = pmrem.fromEquirectangular(texture).texture;
    scene.environment = envMap;
    scene.background = envMap;
    texture.dispose();
    pmrem.dispose();
  });

  loadModel();

renderer.setAnimationLoop(() => {
  if (boundingBoxHelper && model) {
    boundingBoxHelper.update();
  }
  
  renderer.render(scene, camera);
  controls.update();
});
}
function loadModel() {
  const loader = new GLTFLoader();

  // Remove previous model if it exists
  if (model) {
    scene.remove(model);
    verticalParts.length = 0;
    horizontalParts.length = 0;
    mainFrameParts.length = 0;
  }

  loader.load("./models/debug_window.glb", (glb) => {
    model = glb.scene;
    scene.add(model);
    

    groupFrameParts(model);
    centerModel(model);
    frameModel(model);

    if (typeof modelReadyCallback === "function") {
      modelReadyCallback();
      
    }
    // Add Bounding Box Helper
  if (boundingBoxHelper) {
    scene.remove(boundingBoxHelper);
  }
  boundingBoxHelper = new THREE.BoxHelper(model, 0xff0000); // Red bounding box
  scene.add(boundingBoxHelper);
  });
}

function groupFrameParts(model) {
  verticalParts.length = 0;
  horizontalParts.length = 0;
  mainFrameParts.length = 0;

  model.traverse((child) => {
    if (child.isMesh) {
      const name = child.name.toLowerCase();
      console.log("Found Mesh:", name);

      if (name.includes("left") || name.includes("right")) verticalParts.push(child);
      if (name.includes("top") || name.includes("bottom")) horizontalParts.push(child);
      if (["left", "right", "top", "bottom"].some(part => name.includes(part))) {
        mainFrameParts.push(child);
      }
     
    }
  });
}

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
}

function frameModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());
  const distance = size * 1.2;
  camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));
  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();
  
}

export function applyMaterialToMainFrame(material) {
  mainFrameParts.forEach((mesh) => {
    mesh.material = material.clone();
    
  });
}