import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let gui;
let guiInitialized = false;
let resizeFolderCreated = false;

export function initThree(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // CAMERA & CONTROLS
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(0, 5, 10);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  controls.target.set(0, 0, 0);
  controls.update();

  // GUI Controls
  const scaleParams = {
    Height: 1,
    Width: 1,
    Thickness: 0.35,
  };

  // LOAD MODEL
  const loader = new GLTFLoader();
  loader.load('/models/Window_Frame.glb', function (gltf) {
    const model = gltf.scene;
    model.scale.set(scaleParams.Height, scaleParams.Width, scaleParams.Thickness);

    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center); // center it around origin

    const windowFrameMeshes = [];
    
    const materialLibrary = {
    Wood: null,
    Metal: null,
};
    
   model.traverse((child) => {
  if (child.isMesh && child.material) {
    console.log('Mesh:', child.name, 'Material:', child.material.name);

    const matName = child.material.name.toLowerCase();

    if (child.name === 'Cube' || child.name === 'Cube_1') {
      windowFrameMeshes.push(child);

      if (matName.includes('wood') && !materialLibrary.Wood) {
        materialLibrary.Wood = child.material.clone();
        console.log('Stored Wood Material');
      } else if (matName.includes('metal') && !materialLibrary.Metal) {
        materialLibrary.Metal = child.material.clone();
        console.log('Stored Metal Material');
      }
    }

    if (child.name.toLowerCase().includes('glass')) {
      glassMeshEdit(child);
    }
  }
});



    function glassMeshEdit(mesh) {
  mesh.material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.5,
    transmission: 0.1,       // Enables transparency
    thickness: 1,        // Thickness of the glass
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide, //Both sides are rendered.
    
  });
}

    // Group to scale
    const pivotGroup = new THREE.Group();
    pivotGroup.add(model);
    scene.add(pivotGroup);

    // Compute dynamic camera distance based on object size and direction
    function updateCameraDistance() {
      const size = new THREE.Vector3();
      new THREE.Box3().setFromObject(pivotGroup).getSize(size);

      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction);

      // Move camera backward proportional to bounding box in view direction
      const distance = Math.max(size.x, size.y, size.z) * 1.2 + 2;

      const newPos = direction.clone().multiplyScalar(-distance);
      camera.position.copy(newPos);
      controls.target.set(0, 0, 0);
      controls.update();
    }

    // Initial position
    updateCameraDistance();
console.log('Found materials:', {
  Wood: materialLibrary.Wood,
  Metal: materialLibrary.Metal,
});
    // GUI Folder
if (!resizeFolderCreated) {
  if (!gui) gui = new GUI();

  const scaleFolder = gui.addFolder('Resize Window Frame');

  scaleFolder.add(scaleParams, 'Height', 1, 3).onChange(v => {
    pivotGroup.scale.y = v;
    updateCameraDistance();
  });
  scaleFolder.add(scaleParams, 'Width', 1, 4).onChange(v => {
    pivotGroup.scale.x = v;
    updateCameraDistance();
  });
  scaleFolder.add(scaleParams, 'Thickness', 0.35, 0.90).onChange(v => {
    pivotGroup.scale.z = v;
    updateCameraDistance();
  });

if (windowFrameMeshes.length && materialLibrary.Wood && materialLibrary.Metal) {
  const materialOptions = {
    Material: 'Metal',
  };

  scaleFolder
    .add(materialOptions, 'Material', ['Wood', 'Metal'])
    .onChange((value) => {
      windowFrameMeshes.forEach(mesh => {
        mesh.material = materialLibrary[value];
      });
    });
}


  scaleFolder.open();
  resizeFolderCreated = true;
}


    animate();
  });

  // LIGHTING
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 2000);
  spotLight.position.set(90, 200, 390);
  spotLight.castShadow = true;
  scene.add(spotLight);
  const spotHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotHelper);

  // GROUND
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  ground.receiveShadow = true;
  scene.add(ground);

  // GUI Setup
  if (!gui) gui = new GUI();
  if (!guiInitialized) {
    const lightingFolder = gui.addFolder('Lighting');
    lightingFolder.add(spotLight, 'angle', 0, 1);
    lightingFolder.add(spotLight, 'penumbra', 0, 1);
    lightingFolder.add(spotLight, 'intensity', 0, 5000);
    lightingFolder.close();

    guiInitialized = true;
  }

  // RENDER LOOP
  function animate() {
    spotHelper.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
  renderer.setClearColor(0xa3d69c);

  // Responsive
  window.addEventListener('resize', () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
