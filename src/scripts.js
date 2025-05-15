import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


let gui;
let guiInitialized = false;

export function initThree(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;
  const renderer = new THREE.WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  const orbit = new OrbitControls(camera, renderer.domElement);
  camera.position.set(0, 0, 50);
  orbit.update();

  // Geometry
    const loader= new GLTFLoader();

    loader.load( '/models/Window_Frame.glb',
        function (gltf){
            const windowFrameBasicModel = gltf.scene;

            windowFrameBasicModel.rotation.x = Math.PI / 2;

            windowFrameBasicModel.scale.set(4,4,4);

          windowFrameBasicModel.traverse((child) => {
  if (child.isMesh) {
    if (child.name === 'Glass') {
      child.material.transparent = true;  // Enable transparency
      child.material.opacity = 0.3;       // Set opacity (0 = fully transparent, 1 = opaque)
      child.material.depthWrite = false;  // Optional, helps with rendering order of transparent objects
      child.castShadow = false;            // Glass usually doesn’t cast shadow
      child.receiveShadow = true;
    }
    else if (child.name === 'Window_Frame') {
      child.castShadow = true;
      child.receiveShadow = true;
    }

    
  }
});
            
        scene.add(windowFrameBasicModel);
        
        animate();
        
    },
    undefined,
    function(error){
        console.error(error);
    }
    );

  const planeGeometry = new THREE.PlaneGeometry(1200, 1200);
  const planeMaterial = new THREE.ShadowMaterial({
    opacity:0.5
    
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  scene.add(plane);
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow = true;
  plane.position.set(0,-5,0);
  

// Creating a basic frame.

/*
  function createBasicFrame(widthMM, heightMM, thickness, depth) {
  const windowFrame = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const frameThickness = thickness;
  const frameDepth = depth;

  
  const bottom = new THREE.Mesh(
    new THREE.BoxGeometry(widthMM, frameThickness, frameDepth),
    material
  );
  bottom.position.set(0, frameThickness / 2, 0);
  bottom.castShadow = true;
  windowFrame.add(bottom);

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(widthMM, frameThickness, frameDepth),
    material
  );
  top.position.set(0, heightMM - frameThickness / 2, 0); // 
  top.castShadow = true;
  windowFrame.add(top);

  const left = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, heightMM - 2 * frameThickness, frameDepth),
    material
  );
  left.position.set(
    -widthMM / 2 + frameThickness / 2,
    (heightMM - 2 * frameThickness) / 2 + frameThickness,
    0
  );
  left.castShadow = true;
  windowFrame.add(left);

  const right = new THREE.Mesh(
    new THREE.BoxGeometry(frameThickness, heightMM - 2 * frameThickness, frameDepth),
    material
  );
  right.position.set(
    widthMM / 2 - frameThickness / 2,
    (heightMM - 2 * frameThickness) / 2 + frameThickness,
    0
  );
  right.castShadow = true;
  windowFrame.add(right);

  return windowFrame;
}

// Creating a basic frame.


  let frameOptions = {
    widthMM: 15,
    heightMM: 15,
    thicknessMM: 0.5,
    depthMM: 0.5
  };


  let framePos = new THREE.Vector3(0, -5, 0);
 

  let frame = createBasicFrame(
    frameOptions.widthMM,
    frameOptions.heightMM,
    frameOptions.thicknessMM,
    frameOptions.depthMM
  );
  frame.position.copy(framePos);
  scene.add(frame);

  
  function updateWindowFrameFromOptions(options, oldFrame, scene, positionVec3) {
    scene.remove(oldFrame);
    const newFrame = createBasicFrame(
      options.widthMM,
      options.heightMM,
      options.thicknessMM,
      options.depthMM
    );
    newFrame.position.copy(positionVec3);
    scene.add(newFrame);
    return newFrame;
  }
*/
  // Lighting
  const ambientLight = new THREE.AmbientLight(0x404040,1000);
  scene.add(ambientLight);

  const spotLight = new THREE.SpotLight(0xffffff, 5000);
  spotLight.position.set(90, 200, 390);
  spotLight.castShadow = true;
  spotLight.angle = 0.15;
  scene.add(spotLight);

  const spotLightHelper = new THREE.SpotLightHelper(spotLight);
  scene.add(spotLightHelper);
  const sunGeometry = new THREE.SphereGeometry(2, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffffee });
  const sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.copy(spotLight.position);
  scene.add(sun);


  renderer.setClearColor(0xa3d69c);

  // GUI
  if (!gui) {
    gui = new GUI();
  }

  let lightingOptions = {
    
    angle: 0.2,
    penumbra: 0,
    intensity: 5000,
  };

  if (!guiInitialized) {
    
    /*
    const frameFolder = gui.addFolder('Frame1');
    frameFolder.add(frameOptions, 'widthMM', 10, 100).step(0.001).name('Width').onChange(() => {
      frame = updateWindowFrameFromOptions(frameOptions, frame, scene, framePos);
    });
    frameFolder.add(frameOptions, 'heightMM', 10, 100).step(0.001).name('Height').onChange(() => {
      frame = updateWindowFrameFromOptions(frameOptions, frame, scene, framePos);
    });
    frameFolder.add(frameOptions, 'thicknessMM', 0.1, 4).step(0.001).name('Thickness').onChange(() => {
      frame = updateWindowFrameFromOptions(frameOptions, frame, scene, framePos);
    });
     frameFolder.add(frameOptions, 'depthMM', 0.1, 4).step(0.001).name('Depth').onChange(() => {
      frame = updateWindowFrameFromOptions(frameOptions, frame, scene, framePos);
    });
    */
   

    const lightingFolder = gui.addFolder('Lighting');
    lightingFolder.add(lightingOptions, 'angle', 0, 1);
    lightingFolder.add(lightingOptions, 'penumbra', 0, 1);
    lightingFolder.add(lightingOptions, 'intensity', 0, 10000);
    lightingFolder.close();

    guiInitialized = true;
  }
 
  /*
  const gridHelper = new THREE.GridHelper(30);
  scene.add(gridHelper);
  */
  function animate() {
    spotLight.angle = lightingOptions.angle;
    spotLight.penumbra = lightingOptions.penumbra;
    spotLight.intensity = lightingOptions.intensity;

    
    spotLightHelper.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    

    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

