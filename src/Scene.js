import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import "./ScalingLogic";
import { loadMaterialLibrary } from './MaterialLibrary';
import { applyGlassMaterial } from './MaterialLibrary';

 export let scene, camera, controls, renderer, model;

 let targetMesh = null;

 
  function centerModel(model){
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3()); 
    model.position.sub(center);
  }

  
  export function frameModel(camera, controls, model){
    const box = new THREE.Box3().setFromObject(model); 
    const size = box.getSize(new THREE.Vector3()).length(); 
    const center = box.getCenter(new THREE.Vector3());

    const distance = size * 1.2; 
    const direction = new THREE.Vector3(0,0,1); 
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance))); 

    camera.lookAt(center);

    if(controls){
      controls.target.copy(center);
      controls.update(); 
    }
  }

const loader = new GLTFLoader();
let mainFrameParts = [];
loader.load('./models/debug_window.glb', function(glb) {
  model = glb.scene;
  scene.add(model);

  // Traverse to find your target mesh
  model.traverse((child) => {
    if (child.isMesh) {
      const name = child.name.toLowerCase();

      if(
        name.includes("top") ||
        name.includes("bottom") ||
        name.includes("left") ||
        name.includes("right")
      ){
        mainFrameParts.push(child);
      }
    }
  });

  centerModel(model);   
  frameModel(camera, controls, model);

  window.loadedModel = glb.scene;
});

export function applyMaterialToMainFrame(material){
  if(mainFrameParts.length === 0){
    console.warn("cant find your damn frame parts");
    return;
  }

  mainFrameParts.forEach((mesh) =>{
    mesh.material = material.clone();
  });
}


export function initThree(container) {
  while (container.firstChild) container.removeChild(container.firstChild);

  const width = container.clientWidth;
  const height = container.clientHeight;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);
  renderer.setClearColor(0xa3d69c);

  //initializes everything
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

  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(1200, 1200),
    new THREE.ShadowMaterial({ opacity: 0.3 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -5;
  ground.receiveShadow = true;
  scene.add(ground);

  function animate() {
    renderer.render(scene, camera);
    controls.update();
  }
  renderer.setAnimationLoop(animate);
}
  export function applyMaterial(material){
    if(targetMesh){
      targetMesh.material = material.clone();
    }else{
      console.warn("target mesh not found reeee tard");
    }
  }
