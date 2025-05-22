import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';

let scene;
let gui;
let camera, controls;
let modelSwitcher = { model: 'Window_Frame.glb' };
let currentModelPath = '/models/Window_Frame.glb';
let scaleParams = { Height: 1, Width: 1, Thickness: 0.35 };
const materialLibrary = {};
const modelOptions = ['Window_Frame.glb', 'Window_Frame_Cross.glb'];

function getZoneNameFromMesh(name) {
  const lname = name.toLowerCase();
  if (lname.includes('outside') && lname.includes('frame')) return 'outside';
  if (lname.includes('frame') && lname.includes('inside')) return 'frameInside';
  if (lname.includes('frame')) return 'frame';
  if (lname.includes('glass')) return 'glass';
  if (lname.includes('inside')) return 'inside';
  if (lname.includes('outside')) return 'outside';
  return 'misc';
}

const zoneBehaviors = {
  frame: { resizeStrategy: 'frame', allowResize: true, allowColorChange: true },
  frameInside: { resizeStrategy: 'frame', allowColorChange: true },
  glass: { resizeStrategy: 'uniform' },
  inside: { allowColorChange: true },
  outside: { resizeStrategy: 'frame', allowColorChange: true },
  misc: { allowColorChange: true },
};

function resizeZoneParts(meshes, scaleParams, strategy) {
  if (strategy === 'frame') resizeFrameParts(meshes, scaleParams);
  else if (strategy === 'uniform') resizeUniformParts(meshes, scaleParams);
}

function loadMaterialLibrary(glbPath = '/models/Materials.glb', onComplete) {
  const loader = new GLTFLoader();
  loader.load(glbPath, (gltf) => {
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.trim();
          if (name && !materialLibrary[name]) materialLibrary[name] = mat.clone();
        });
      }
    });
    if (onComplete) onComplete();
  }, undefined, (err) => {
    console.error('Material load error:', err);
    if (onComplete) onComplete();
  });
}

function applyGlassMaterial(mesh) {
  mesh.material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.5,
    transmission: 0.1,
    thickness: 0.35,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
}

function resizeFrameParts(meshes, scaleParams) {
  meshes.forEach(mesh => {
    const name = mesh.name.toLowerCase();
    if (!mesh.userData.originalScale || !mesh.userData.originalPosition) {
      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalPosition = mesh.position.clone();
    }
    const origScale = mesh.userData.originalScale.clone();
    const origPos = mesh.userData.originalPosition.clone();

    mesh.scale.copy(origScale);
    mesh.position.copy(origPos);

    if (name.includes('left') || name.includes('right') || name.includes('middle_y')) {
      mesh.scale.y = origScale.y * scaleParams.Height;
      mesh.position.x = name.includes('left')
        ? origPos.x - ((scaleParams.Width - 1) * origScale.z)
        : origPos.x + ((scaleParams.Width - 1) * origScale.z);
    }

    if (name.includes('top') || name.includes('bottom') || name.includes('middle_x')) {
      mesh.scale.x = origScale.x * scaleParams.Width;
      const yOffset = (scaleParams.Height - 1.0) * origScale.y * 0.955;
      mesh.position.y = name.includes('top') ? origPos.y + yOffset : origPos.y - yOffset;
      mesh.scale.y = origScale.y;
    }

    mesh.scale.z = origScale.z * scaleParams.Thickness;
  });
}

function resizeUniformParts(meshes, scaleParams) {
  meshes.forEach(mesh => {
    if (!mesh.userData.originalScale || !mesh.userData.originalPosition) {
      mesh.userData.originalScale = mesh.scale.clone();
      mesh.userData.originalPosition = mesh.position.clone();
    }
    const origScale = mesh.userData.originalScale;
    const origPos = mesh.userData.originalPosition;
    mesh.scale.set(
      origScale.x * scaleParams.Width,
      origScale.y * scaleParams.Height,
      origScale.z * scaleParams.Thickness
    );
    mesh.position.copy(origPos);
  });
}

function loadWindowModel(scene, modelPath, scaleParams) {
  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    const oldPivots = scene.children.filter(c => c.type === 'Group');
    oldPivots.forEach(obj => scene.remove(obj));

    const pivotGroup = new THREE.Group();
    pivotGroup.add(model);
    scene.add(pivotGroup);

    controls.target.copy(center);
    controls.update();

    const zones = {};
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.name.toLowerCase().includes('glass')) applyGlassMaterial(child);
        child.userData.originalScale = child.scale.clone();
        child.userData.originalPosition = child.position.clone();

        const zoneName = getZoneNameFromMesh(child.name);

        // Debug log for unknown zone mappings
        if (!zoneBehaviors[zoneName]) {
          console.warn(`Unknown zone name: ${child.name} → mapped to "${zoneName}"`);
        }

        if (!zones[zoneName]) zones[zoneName] = [];
        zones[zoneName].push(child);
      }
    });

    setupDynamicGUI(zones, scaleParams, pivotGroup);
    updateCameraDistance(pivotGroup);
  });
}

function setupDynamicGUI(zones, scaleParams, pivotGroup) {
  const guiWrapper = document.getElementById('gui-wrapper');
  if (gui) gui.destroy();
  gui = new GUI({ width: 250, autoPlace: false });
  guiWrapper.appendChild(gui.domElement);

  const materialNames = Object.keys(materialLibrary);
  if (materialNames.length === 0) return;

  Object.entries(zones).forEach(([zoneName, meshes]) => {
    const config = zoneBehaviors[zoneName] || {};
    const folder = gui.addFolder(`${zoneName.toUpperCase()} Settings`);
    if (config.allowColorChange) {
      const params = { material: materialNames[0] };
      folder.add(params, 'material', materialNames).onChange((selected) => {
        meshes.forEach(mesh => mesh.material = materialLibrary[selected]);
      });
    }
    if (config.allowResize) {
        ['Height', 'Width', 'Thickness'].forEach(param => {
        let min = 1;
        let max = 3;

    if (param === 'Thickness') {
        min = 0.35;
        max = 0.90;
  } else if (param === 'Width') {
        max = 4;
  }

  folder.add(scaleParams, param, min, max)
    .step(0.01)
    .onChange(() => {
      Object.entries(zones).forEach(([zn, zMeshes]) => {
        const strategy = zoneBehaviors[zn]?.resizeStrategy;
        if (strategy) resizeZoneParts(zMeshes, scaleParams, strategy);
      });
      updateCameraDistance(pivotGroup);
    });
});

    }
    folder.open();
  });
}

function updateCameraDistance(objectGroup) {
  const size = new THREE.Vector3();
  new THREE.Box3().setFromObject(objectGroup).getSize(size);
  const center = new THREE.Vector3();
  new THREE.Box3().setFromObject(objectGroup).getCenter(center);
  const desiredDistance = Math.max(size.x, size.y, size.z) * 1.2 + 2;
  const direction = new THREE.Vector3();
  direction.subVectors(camera.position, controls.target).normalize();
  const newPosition = new THREE.Vector3().addVectors(center, direction.multiplyScalar(desiredDistance));
  camera.position.copy(newPosition);
  controls.target.copy(center);
  controls.update();
}

function reloadModel(path) {
  if (gui) {
    gui.destroy();
    gui = null;
  }
  const pivotGroups = scene.children.filter(child => child.type === 'Group');
  pivotGroups.forEach(obj => scene.remove(obj));
  loadWindowModel(scene, path, scaleParams);
}

export function initThree(container, modelPath = '/models/Window_Frame.glb') {
  while (container.firstChild) container.removeChild(container.firstChild);

  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0xa3d69c);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 5, 10);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.screenSpacePanning = true;
  controls.minPolarAngle = 0;
  controls.maxPolarAngle = Math.PI;
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 1);
  spotLight.position.set(90, 200, 390);
  spotLight.castShadow = true;
  scene.add(spotLight);
  scene.add(new THREE.SpotLightHelper(spotLight));

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  ground.receiveShadow = true;
  scene.add(ground);

  const guiWrapper = document.createElement('div');
  guiWrapper.id = 'gui-wrapper';
  guiWrapper.style.position = 'absolute';
  guiWrapper.style.top = '0';
  guiWrapper.style.right = '0';
  guiWrapper.style.display = 'flex';
  guiWrapper.style.flexDirection = 'row';
  document.body.appendChild(guiWrapper);

  const switcherGUI = new GUI({ width: 200, autoPlace: false });
  guiWrapper.appendChild(switcherGUI.domElement);

  const modelFolder = switcherGUI.addFolder('MODEL SWITCHER');
  modelFolder
    .add(modelSwitcher, 'model', modelOptions)
    .name('Select Model')
    .onChange((value) => {
      modelSwitcher.model = value;
      currentModelPath = `/models/${value}`;
      reloadModel(currentModelPath);
    });
  modelFolder.open();

  loadMaterialLibrary('/models/Materials.glb', () => reloadModel(currentModelPath));

  function animate() {
    renderer.render(scene, camera);
    controls.update();
  }
  renderer.setAnimationLoop(animate);

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
