import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';

let gui;
let camera, controls;
const materialLibrary = {};

function loadMaterialLibrary(glbPath = '/models/Materials.glb', onComplete) {
  const loader = new GLTFLoader();

  loader.load(glbPath, (gltf) => {
    const root = gltf.scene;
    if (!root || typeof root.traverse !== 'function') {
      console.warn('Invalid .scene in material GLB.');
      if (onComplete) onComplete();
      return;
    }

    root.traverse((child) => {
      if (child.isMesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          const name = mat.name?.trim();
          if (name && !materialLibrary[name]) {
            materialLibrary[name] = mat.clone();
          }
        });
      }
    });

    if (onComplete) onComplete();
  }, undefined, (error) => {
    console.error('Material load error:', error);
    if (onComplete) onComplete();
  });
}

function applyGlassMaterial(mesh) {
  mesh.material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.5,
    transmission: 0.1,
    thickness: 1,
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

    if (name.includes('left') || name.includes('right')) {
      mesh.scale.y = origScale.y * scaleParams.Height;
      mesh.position.x = name.includes('left')
        ? origPos.x - ((scaleParams.Width - 1) * origScale.z)
        : origPos.x + ((scaleParams.Width - 1) * origScale.z);
    }

   if (name.includes('top') || name.includes('bottom')) {
  mesh.scale.x = origScale.x * scaleParams.Width;

  // Scale only position in Y by half the height delta
  const yOffset = (scaleParams.Height - 1.0) * origScale.y * 0.955;

  mesh.position.y = name.includes('top')
    ? origPos.y + yOffset
    : origPos.y - yOffset;

  mesh.scale.y = origScale.y; // maintain original thickness
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

    const newScale = new THREE.Vector3(
      origScale.x * scaleParams.Width,
      origScale.y * scaleParams.Height,
      origScale.z * scaleParams.Thickness
    );

    const newPos = new THREE.Vector3(
      origPos.x, // Keep original X position (avoid drifting)
      origPos.y, // Same here for Y
      origPos.z  // Same here for Z
    );

    mesh.scale.copy(newScale);
    mesh.position.copy(newPos);
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

    const pivotGroup = new THREE.Group();
    pivotGroup.add(model);
    scene.add(pivotGroup);

    controls.target.copy(center);
    controls.update();

    const zones = {};
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        const name = child.name?.toLowerCase();
        if (name.includes('glass')) {
          applyGlassMaterial(child);
        }

        child.userData.originalScale = child.scale.clone();
        child.userData.originalPosition = child.position.clone();

        const zoneName = name.includes('window_frame_inside') ? 'frameInside' :
                         name.includes('inside') ? 'inside' :
                         name.includes('outside') ? 'outside' :
                         name.includes('frame') ? 'frame' :
                         name.includes('glass')? 'glass':
                         'misc';

        if (!zones[zoneName]) zones[zoneName] = [];
        zones[zoneName].push(child);
      }
    });

    setupDynamicGUI(zones, scaleParams, pivotGroup);
    updateCameraDistance(pivotGroup);
  });
}

function setupDynamicGUI(zones, scaleParams, pivotGroup) {
  if (gui) gui.destroy();
  gui = new GUI();

  const materialNames = Object.keys(materialLibrary);
  if (materialNames.length === 0) return;

  const zoneConfig = {
    inside: { allowColorChange: true },
    outside: { allowColorChange: true },
    frame: { allowColorChange: true, allowResize: true },
    frameInside: { allowColorChange: true, },
    glass: {},
    misc: {}
  };

  Object.entries(zones).forEach(([zoneName, meshes]) => {
    if (!meshes.length) return;

    const config = zoneConfig[zoneName] || {};
    const folder = gui.addFolder(`${zoneName.toUpperCase()} Settings`);

    if (config.allowColorChange) {
      const params = { material: materialNames[0] };
      folder.add(params, 'material', materialNames).onChange((selected) => {
        meshes.forEach((mesh) => {
          mesh.material = materialLibrary[selected];
        });
      });
    }

    if (config.allowResize) {
      folder.add(scaleParams, 'Height', 1, 3).step(0.01).onChange(() => {
        resizeFrameParts(zones.frame, scaleParams);
        resizeFrameParts(zones.frameInside || [], scaleParams);
        resizeUniformParts(zones.glass || [], scaleParams);
        updateCameraDistance(pivotGroup);
      });
      folder.add(scaleParams, 'Width', 1, 4).step(0.01).onChange(() => {
        resizeFrameParts(zones.frame, scaleParams);
        resizeFrameParts(zones.frameInside || [], scaleParams);
        resizeUniformParts(zones.glass || [], scaleParams);
        updateCameraDistance(pivotGroup);
      });
      folder.add(scaleParams, 'Thickness', 0.35, 1).step(0.01).onChange(() => {
        resizeFrameParts(zones.frame, scaleParams);
        resizeFrameParts(zones.frameInside || [], scaleParams);
        resizeUniformParts(zones.glass || [], scaleParams);
        updateCameraDistance(pivotGroup);
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

export function initThree(container, modelPath = '/models/Window_Frame.glb') {
  while (container.firstChild) container.removeChild(container.firstChild);

  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0xa3d69c);

  const scene = new THREE.Scene();
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

  const scaleParams = { Height: 1, Width: 1, Thickness: 1 };
  loadMaterialLibrary('/models/Materials.glb', () => {
    loadWindowModel(scene, modelPath, scaleParams);
  });

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
