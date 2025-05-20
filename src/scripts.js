import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';

let gui;
let camera, controls;
const materialLibrary = {};
/*const expectedMaterialNames = [
  'White', 'Creme', 'Licht Ivoor', 'Wijnrood', 'Dennengroen',
  'Monumentengroen', 'Staalblauw', 'Golden Oak', 'Mahonie',
  'Zilvergrijs', 'Basaltgrijs', 'Kwartsgrijs',
  'Antracietgrijs', 'Zwartgrijs', 'Zwart'
];
*/

function loadMaterialLibrary(glbPath = '/models/Materials.glb', onComplete) {
  const loader = new GLTFLoader();

  loader.load(
    glbPath,
    (gltf) => {
      try {
        console.log('[Material GLB]', gltf);

        // Safe access to gltf.scene
        const root = gltf.scene;
        if (!root || typeof root.traverse !== 'function') {
          console.warn('No valid .scene to traverse in material GLB.');
          if (onComplete) onComplete();
          return;
        }

        let materialCount = 0;

        root.traverse((child) => {
          if (child.isMesh && child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat) => {
              const name = mat.name?.trim();
              console.log(`➡️ Found material: "${name}"`);
              if (name && !materialLibrary[name]) {
                materialLibrary[name] = mat.clone();
                materialCount++;
              }
            });
          }
        });

        console.log(`Loaded ${materialCount} materials:`, Object.keys(materialLibrary));
        if (onComplete) onComplete();
      } catch (error) {
        console.error('Error during material library parsing:', error);
        if (onComplete) onComplete();
      }
    },
    undefined,
    (error) => {
      console.error('Failed to load material library:', error);
      if (onComplete) onComplete();
    }
  );
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

function loadWindowModel(scene, modelPath, scaleParams) {
  const loader = new GLTFLoader();

  loader.load(
    modelPath,
    (gltf) => {
      const model = gltf.scene;
      if (!model) {
        console.error('No scene in window model GLTF:', gltf);
        return;
      }

      model.scale.set(scaleParams.Height, scaleParams.Width, scaleParams.Thickness);

      const box = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      box.getCenter(center);
      model.position.sub(center);

      const pivotGroup = new THREE.Group();
      pivotGroup.add(model);
      scene.add(pivotGroup);

// controls target center of object.
controls.target.copy(center);
controls.update();


    const zones = {};

model.traverse((child) => {
  if (child.isMesh && child.material) {
    const name = child.name?.toLowerCase();

    // Dynamic zone assignment based on name
   if (name.includes('glass')) {
      applyGlassMaterial(child);
      return;
   }

    const zoneName =  name.includes('window_frame_inside') ? 'frameInside' :
                      name.includes('inside') ? 'inside' :
                      name.includes('outside') ? 'outside' :
                      name.includes('frame') ? 'frame' :
                      name.includes('glass') ? 'glass':
                      'misc';

    if (!zones[zoneName]) zones[zoneName] = [];
    zones[zoneName].push(child);
    console.log('Mesh name:', name);
  }
});



      setupDynamicGUI(zones, scaleParams, pivotGroup);
      updateCameraDistance(pivotGroup);
    },
    undefined,
    (error) => {
      console.error('Failed to load window model:', error);
    }
  );
}

function setupDynamicGUI(zones, scaleParams, pivotGroup) {
 if (gui) {
    gui.destroy(); // Destroys and cleans the old GUI
  }
  gui = new GUI(); // New GUI instance

  const materialNames = Object.keys(materialLibrary);
  if (materialNames.length === 0) {
    console.warn('No materials found to show in GUI.');
    return;
  }

  const zoneConfig = {
    inside: { allowColorChange: true },
    outside: { allowColorChange: true },
    frame: { allowColorChange: true, allowResize: true },
    frameInside: { allowColorChange: true },
    glass: {allowColorChange: true},
    misc: { allowColorChange: true }
  };

  Object.entries(zones).forEach(([zoneName, meshes]) => {
    if (!meshes || meshes.length === 0) return;

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
      folder.add(scaleParams, 'Height', 1, 3).onChange(v => {
        pivotGroup.scale.y = v;
        updateCameraDistance(pivotGroup);
      });
      folder.add(scaleParams, 'Width', 1, 4).onChange(v => {
        pivotGroup.scale.x = v;
        updateCameraDistance(pivotGroup);
      });
      folder.add(scaleParams, 'Thickness', 0.35, 0.90).onChange(v => {
        pivotGroup.scale.z = v;
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

  // Get current direction vector from camera to target
  const direction = new THREE.Vector3();
  direction.subVectors(camera.position, controls.target).normalize();

  // New camera position = target + direction * desiredDistance
  const newPosition = new THREE.Vector3().addVectors(center, direction.multiplyScalar(desiredDistance));
  camera.position.copy(newPosition);

  controls.target.copy(center);
  controls.update();
}


export function initThree(container, modelPath = '/models/Window_Frame.glb') {
  //  Remove any existing canvas elements to prevent duplicates
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  // Optional: force style again (just in case)
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  renderer.domElement.style.touchAction = 'none';

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
  const spotHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLight, spotHelper);

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  ground.receiveShadow = true;
  scene.add(ground);

  const scaleParams = { Height: 1, Width: 1, Thickness: 0.35 };

  loadMaterialLibrary('/models/Materials.glb', () => {
    loadWindowModel(scene, modelPath, scaleParams);
  });

  function animate() {
    spotHelper.update();
    renderer.render(scene, camera);
    controls.update();
  }

  renderer.setAnimationLoop(animate);
  renderer.setClearColor(0xa3d69c);

  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

