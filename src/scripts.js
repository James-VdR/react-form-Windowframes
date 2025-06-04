import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';

let pivotGroup
let scene;
let gui;
let camera, controls;
let modelSwitcher = { model: 'Window_Frame.glb' };
let currentModelPath = '/models/Window_Frame.glb';
let scaleParams = { Height: 1, Width: 1, Thickness: 1 };
let dimensionHelpers = [];
let zones = {}; // holds the grouped mesh zones for resizing and material assignment
let modularParams = {
  enabledHeight: false,
  enabledWidth: false,
  ModuleHeight: 1.15,
  ModuleWidth: 0.88
};


const materialLibrary = {};
const modelOptions = ['Window_Frame.glb', 'Window_Frame_Cross.glb', 'Window_Frame_Kofig.glb'];



function applyModularStacking() {
  if (!pivotGroup) {
    console.warn('[ModularStacking] No pivotGroup found.');
    return;
  }

  // Remove previous clones
  const toRemove = [];
  pivotGroup.traverse(child => {
    if (child.userData.isModularClone) {
      toRemove.push(child);
    }
  });
  toRemove.forEach(child => pivotGroup.remove(child));

    // Remove previous dimension helpers
  dimensionHelpers.forEach(obj => pivotGroup.remove(obj));
  dimensionHelpers = [];


  // --- HEIGHT STACKING ---
  const baseMeshY = findMeshByName('outside_frame_middle_x');
  if (modularParams.enabledHeight) {
    if (baseMeshY) {
      stackClones(baseMeshY, 'y', modularParams.ModuleHeight);
      baseMeshY.visible = false;
    } else {
      console.warn('Base mesh for height stacking not found.');
    }
  } else {
    if (baseMeshY) baseMeshY.visible = true; //  Make mesh visible again
  }

  // --- WIDTH STACKING ---
  const baseMeshX = findMeshByName('outside_frame_middle_y');
  const leftRef = findMeshByName('left_frame');
  if (modularParams.enabledWidth) {
    if (baseMeshX && leftRef) {
      stackClonesWidth(baseMeshX, modularParams.ModuleWidth, leftRef);
      baseMeshX.visible = false;
    } else {
      console.warn('Base mesh for width stacking not found.');
    }
  } else {
    if (baseMeshX) baseMeshX.visible = true; // Make mesh visible again
  }

  // === Dimension Lines ===
const rightFrame = findMeshByName('right_frame');
const bottomFrame = findMeshByName('bottom_frame');

if (rightFrame && bottomFrame) {
  const boxRight = new THREE.Box3().setFromObject(rightFrame);
  const boxBottom = new THREE.Box3().setFromObject(bottomFrame);

  const zOffset = 0.1;
  const yOffset = 0.18; //make the line larger

  const rightTop = new THREE.Vector3(boxRight.max.x + zOffset, yOffset + boxRight.max.y,  0);
  const rightBottom = new THREE.Vector3(boxRight.max.x + zOffset,  boxRight.min.y - yOffset,  0);

  const bottomLeft = new THREE.Vector3(boxBottom.min.x, boxBottom.min.y - zOffset, 0);
  const bottomRight = new THREE.Vector3(boxBottom.max.x, boxBottom.min.y - zOffset, 0);

  const heightLine = createDimensionLine(rightBottom, rightTop);
  const widthLine = createDimensionLine(bottomLeft, bottomRight);

  
  const rawHeight = (boxRight.max.y - boxRight.min.y);
  const rawWidth = (boxBottom.max.x - boxBottom.min.x);

  // Assume raw scale of 1.0 means 2000mm width and ~1912mm height
  // Use actual raw height at scale 1.0 and scale 3.0 to calibrate
    const baseHeight = 1.911; // actual height in world units at scale 1.0 = ~1000mm
    const unitToMM = 1000 / baseHeight; // how many mm per 1 unit of height

    const heightMM = (rawHeight * unitToMM).toFixed(0) + ' mm';


    const widthMM = (500 + ((rawWidth - 1.0) * 1000) / 2).toFixed(0) + ' mm';
  // Normalize scale: assume 1.0 = 1000mm, actual model is ~2000mm → divide by 2



  // Midpoints of each dimension line
  const heightMid = new THREE.Vector3().addVectors(rightTop, rightBottom).multiplyScalar(0.5);
  const widthMid = new THREE.Vector3().addVectors(bottomLeft, bottomRight).multiplyScalar(0.5);

  // Adjusted label positions
  const heightLabelPos = heightMid.clone().add(new THREE.Vector3(1, 0, 0.1));   // right of center
  const widthLabelPos = widthMid.clone().add(new THREE.Vector3(0.5, -0.2, 0.1));   // under the line

  // Create labels
  const heightLabel = createTextLabel(heightMM, heightLabelPos);
  const widthLabel = createTextLabel(widthMM, widthLabelPos);


  

  dimensionHelpers.push(heightLine, widthLine, heightLabel, widthLabel);
  pivotGroup.add(...dimensionHelpers);

  if (rightFrame && bottomFrame) {
  console.log('[Dimension Labels] Creating dimension labels'); //  Confirm block runs
  }
  
}


  updateCameraDistance(pivotGroup);
}
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
  glass: { resizeStrategy: 'uniform', allowColorChange: true },
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
    console.log('[Material Library Loaded]', Object.keys(materialLibrary));

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

    const origScale = mesh.userData.originalScale;
    const origPos = mesh.userData.originalPosition;

    mesh.scale.copy(origScale);
    mesh.position.copy(origPos);

    const deltaHeight = scaleParams.Height - 1.0;

    // Compensation to pull Left/Right down a bit on scale up
    const correctionOffset = -deltaHeight * 0.20; // 

    if (name.includes('left') || name.includes('right') || name.includes('middle_y')) {
      mesh.scale.y = origScale.y * scaleParams.Height;

      // Shift DOWN slightly to compensate scaling gap
      mesh.position.y = origPos.y + correctionOffset;

      if (name.includes('right')) {
        const deltaWidth = scaleParams.Width - 1.0;
        const correctionOffsetX = deltaWidth * 1; // same logic as height
        mesh.position.x = origPos.x + deltaWidth * origScale.z + correctionOffsetX;
      }

    }

    if (name.includes('top') || name.includes('middle_x')) {
  mesh.scale.x = origScale.x * scaleParams.Width;

  const correctionOffset = deltaHeight * 0.90;
  mesh.position.y = origPos.y + deltaHeight * origScale.y + correctionOffset;
}


    if (name.includes('bottom')) {
      mesh.scale.x = origScale.x * scaleParams.Width;
      mesh.position.y = origPos.y;
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

    const deltaHeight = scaleParams.Height - 1.0;
    const deltaWidth = scaleParams.Width - 1.0;

    const correctionOffsetY = -deltaHeight * 0.20;
    const correctionOffsetX = -deltaWidth * 0.11;

    // Slightly over-scale width to close the gap on the right
    const widthCorrectionFactor = 1 + (deltaWidth * 0.03); // tune this

    mesh.scale.set(
      origScale.x * scaleParams.Width * widthCorrectionFactor,
      origScale.y * scaleParams.Height,
      origScale.z * scaleParams.Thickness
    );

    mesh.position.set(
      origPos.x + correctionOffsetX,
      origPos.y + correctionOffsetY,
      origPos.z
    );
  });
}



function loadWindowModel(scene, modelPath, scaleParams) {
  console.log('[loadWindowModel] Attempting to load model from:', modelPath);

  const loader = new GLTFLoader();
  loader.load(modelPath, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = new THREE.Vector3();
    box.getCenter(center);
    model.position.sub(center);

    const oldPivots = scene.children.filter(c => c.type === 'Group');
    oldPivots.forEach(obj => scene.remove(obj));

    pivotGroup = new THREE.Group();
    pivotGroup.add(model);
    scene.add(pivotGroup);

    controls.target.copy(center);
    controls.update();

   
    model.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.name.toLowerCase().includes('glass')) applyGlassMaterial(child);
        child.userData.originalScale = child.scale.clone();
        child.userData.originalPosition = child.position.clone();

        const zoneName = getZoneNameFromMesh(child.name);
        console.log('[Mesh Found]', child.name);

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
    showDimensionLines(); // ← Show lines immediately

    
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
    meshes.forEach(mesh => {
      mesh.material = materialLibrary[selected];
    });

    // Update modular clones if the OUTSIDE material is changed
    if (zoneName === 'outside') {
      pivotGroup.traverse(child => {
        if (child.userData.isModularClone) {
          child.material = materialLibrary[selected].clone();
        }
      });
    }
  });
}


    if (config.allowResize) {
      ['Height', 'Width', 'Thickness'].forEach(param => {
        let min = 1, max = 2.999;

        if (param === 'Thickness') {
          min = 1;
          max = 1;
        } else if (param === 'Width') {
          max = 4;
        }

        folder.add(scaleParams, param, min, max)
          .step(0.001)
          .onChange(() => {
  Object.entries(zones).forEach(([zn, zMeshes]) => {
    const strategy = zoneBehaviors[zn]?.resizeStrategy;
    if (strategy) resizeZoneParts(zMeshes, scaleParams, strategy);
  });

  // REAPPLY CLONES AFTER RESIZE
  applyModularStacking();



  

  updateCameraDistance(pivotGroup);
});

      });
    }

    folder.open();
  });

  // -----------------------------
  // MODULAR STACKING CONTROLS
  // -----------------------------
 

const modularFolder = gui.addFolder('MODULARISE');

// Height stacking controls
  modularFolder
  .add(modularParams, 'enabledHeight')
  .name('Enable Height Stacking')
  .onChange(applyModularStacking);

  modularFolder
  .add(modularParams, 'ModuleHeight', 0.25, 1.2)
  .step(0.001)
  .name('Module Height')
  .onChange(applyModularStacking);

// Width stacking controls
  modularFolder
  .add(modularParams, 'enabledWidth')
  .name('Enable Width Stacking')
  .onChange(applyModularStacking);

  modularFolder
  .add(modularParams, 'ModuleWidth', 0.25, 3.8)
  .step(0.001)
  .name('Module Width')
  .onChange(applyModularStacking);

  modularFolder.open();

}

  function findMeshByName(partialName) {
  let found = null;
  pivotGroup.traverse(child => {
    if (child.isMesh && child.name.toLowerCase().includes(partialName.toLowerCase())) {
      found = child;
    }
  });
  
  return found;
  
}

function createDimensionLine(start, end) {
  const material = new THREE.LineBasicMaterial({ color: 0x000000 });
  const points = [start, end];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.Line(geometry, material);
}

function createTextLabel(text, position) {
  console.log('[createTextLabel] Called with position:', position); //  Log every call

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;

  const context = canvas.getContext('2d');
  context.font = 'bold 48px Arial';
  context.fillStyle = 'black';
  context.fillText(text, 10, 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false });
  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(1.2, 0.5, 0.5);
  sprite.position.copy(position);

  console.log('[createTextLabel] Sprite position:', sprite.position); //  Always logs

  return sprite;
}




function stackClones(original, axis, moduleSize, originReference = null) {
  const boundingBox = new THREE.Box3().setFromObject(pivotGroup);
  const size = boundingBox.getSize(new THREE.Vector3());
  const totalLength = axis === 'x' ? size.x : size.y;
  const count = Math.floor(totalLength / moduleSize);

 let lastPosition;

// Use Left_Frame as geometric origin if provided
if (axis === 'x' && originReference) {
  const originPos = new THREE.Vector3();
  originReference.getWorldPosition(originPos);
  pivotGroup.worldToLocal(originPos);

  // Shift slightly forward to center like height stacking (optional tweak)
  lastPosition = originPos.x + moduleSize * 0.5;
} else {
  lastPosition = original.position[axis];
}


// Add offset to start clones slightly inward (for width stacking)
// Offset entire clone row so it centers relative to original
if (axis === 'x') {
  lastPosition -= (count * moduleSize) / 2;
}



  for (let i = 1; i <= count; i++) {
    const clone = original.clone();
    clone.name = `${original.name}_Clone_${axis.toUpperCase()}_${i}`;
    clone.userData.isModularClone = true;

    clone.geometry = clone.geometry.clone();
    clone.material = Array.isArray(clone.material)
      ? clone.material.map(m => m.clone())
      : clone.material.clone();

    const worldPos = new THREE.Vector3();
    original.getWorldPosition(worldPos);
    pivotGroup.worldToLocal(worldPos);

    // Flip stacking direction for Width (X-axis)
    const direction = (axis === 'x') ? -1 : -1;
    worldPos[axis] = lastPosition + moduleSize * direction;

    clone.position.copy(worldPos);

    clone.visible = true;
    pivotGroup.add(clone);

    lastPosition = worldPos[axis];
  }
}

function stackClonesWidth(original, moduleSize, originReference = null) {
  const boundingBox = new THREE.Box3().setFromObject(pivotGroup);
  const size = boundingBox.getSize(new THREE.Vector3());
  const count = Math.floor(size.x / moduleSize);

  if (!originReference) {
    console.warn('[stackClonesWidth] No origin reference (left_frame) provided.');
    return;
  }

  // Get geometric origin from left_frame
  const originPos = new THREE.Vector3();
  originReference.getWorldPosition(originPos);
  pivotGroup.worldToLocal(originPos);

  let startX = originPos.x - 0.88;; // Start exactly at left_frame

  for (let i = 0; i < count; i++) {
    const clone = original.clone();
    clone.name = `${original.name}_Clone_X_${i}`;
    clone.userData.isModularClone = true;

    clone.geometry = clone.geometry.clone();
    clone.material = Array.isArray(clone.material)
      ? clone.material.map(m => m.clone())
      : clone.material.clone();

    const worldPos = new THREE.Vector3();
    original.getWorldPosition(worldPos);
    pivotGroup.worldToLocal(worldPos);

    // Align clone rightward with precise step
    worldPos.x = startX + i * moduleSize;

    clone.position.copy(worldPos);
    clone.visible = true;
    pivotGroup.add(clone);
  }
}


function showDimensionLines() {
  if (!pivotGroup) return;

  // Remove old lines if they exist
  dimensionHelpers.forEach(obj => pivotGroup.remove(obj));
  dimensionHelpers = [];

  const rightFrame = findMeshByName('right_frame');
  const bottomFrame = findMeshByName('bottom_frame');

  if (!rightFrame || !bottomFrame) return;

  const boxRight = new THREE.Box3().setFromObject(rightFrame);
  const boxBottom = new THREE.Box3().setFromObject(bottomFrame);

  const zOffset = 0.1;
  const yOffset = 0.18;

  const rightTop = new THREE.Vector3(boxRight.max.x + zOffset, boxRight.max.y + yOffset, 0);
  const rightBottom = new THREE.Vector3(boxRight.max.x + zOffset, boxRight.min.y - yOffset, 0);

  const bottomLeft = new THREE.Vector3(boxBottom.min.x, boxBottom.min.y - zOffset, 0);
  const bottomRight = new THREE.Vector3(boxBottom.max.x, boxBottom.min.y - zOffset, 0);

  const heightLine = createDimensionLine(rightBottom, rightTop);
  const widthLine = createDimensionLine(bottomLeft, bottomRight);

  const rawHeight = boxRight.max.y - boxRight.min.y;
  const rawWidth = boxBottom.max.x - boxBottom.min.x;

  const baseHeight = 1.911;
  const unitToMM = 1000 / baseHeight;

  const heightMM = (rawHeight * unitToMM).toFixed(0) + ' mm';
  const widthMM = (500 + ((rawWidth - 1.0) * 1000) / 2).toFixed(0) + ' mm';

  const heightMid = new THREE.Vector3().addVectors(rightTop, rightBottom).multiplyScalar(0.5);
  const widthMid = new THREE.Vector3().addVectors(bottomLeft, bottomRight).multiplyScalar(0.5);

  const heightLabelPos = heightMid.clone().add(new THREE.Vector3(0.60, 0, 0.1));
  const widthLabelPos = widthMid.clone().add(new THREE.Vector3(0.5, -0.2, 0.1));

  const heightLabel = createTextLabel(heightMM, heightLabelPos);
  const widthLabel = createTextLabel(widthMM, widthLabelPos);

  dimensionHelpers.push(heightLine, widthLine, heightLabel, widthLabel);
  pivotGroup.add(...dimensionHelpers);
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
function safeUpdateCameraDistance(group) {
  if (!group || !group.children || group.children.length === 0) {
    console.warn('[safeUpdateCameraDistance] Skipped – group not ready');
    return;
  }
  updateCameraDistance(group);
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
  return new Promise((resolve) => {
    while (container.firstChild) container.removeChild(container.firstChild);

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    renderer.setClearColor(0xfffffff);

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

   let guiWrapper = document.getElementById('gui-wrapper');
if (!guiWrapper) {
  guiWrapper = document.createElement('div');
  guiWrapper.id = 'gui-wrapper';
  guiWrapper.style.position = 'absolute';
  guiWrapper.style.top = '0';
  guiWrapper.style.right = '0';
  guiWrapper.style.display = 'flex';
  guiWrapper.style.flexDirection = 'row';
  document.body.appendChild(guiWrapper);
} else {
  guiWrapper.innerHTML = ''; // clear previous GUI contents
  guiWrapper.style.display = 'flex'; // ensure visible only if re-enabled
}


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

    currentModelPath = modelPath;

    loadMaterialLibrary('/models/Materials.glb', () => {
      reloadModel(currentModelPath);

      let controlAPI = {
        setHeight: (val) => {
          scaleParams.Height = val;
          Object.entries(zoneBehaviors).forEach(([zn, config]) => {
            const strategy = config?.resizeStrategy;
            if (strategy && zones[zn]) {
              resizeZoneParts(zones[zn], scaleParams, strategy);
            }
          });
          applyModularStacking();
          safeUpdateCameraDistance(pivotGroup);
        },
        setWidth: (val) => {
          scaleParams.Width = val;
          Object.entries(zoneBehaviors).forEach(([zn, config]) => {
            const strategy = config?.resizeStrategy;
            if (strategy && zones[zn]) {
              resizeZoneParts(zones[zn], scaleParams, strategy);
            }
          });
          applyModularStacking();
          safeUpdateCameraDistance(pivotGroup);
        },
        setModularSizes: (w, h) => {
          modularParams.ModuleWidth = w;
          modularParams.ModuleHeight = h;
          applyModularStacking();
        },
        setModularEnabled: (widthEnabled, heightEnabled) => {
          modularParams.enabledWidth = widthEnabled;
          modularParams.enabledHeight = heightEnabled;
          applyModularStacking();
        },
        setMaterialForZone: (zoneName, matName) => {
  if (!materialLibrary[matName] || !zones[zoneName]) return;

  zones[zoneName].forEach(mesh => {
    const clonedMat = materialLibrary[matName].clone();
    clonedMat.needsUpdate = true; // <-- ADD THIS LINE
    mesh.material = clonedMat;
  });

  if (zoneName === 'outside') {
    pivotGroup.traverse(child => {
      if (child.userData.isModularClone) {
        const clonedMat = materialLibrary[matName].clone();
        clonedMat.needsUpdate = true; // <-- ADD THIS TOO
        child.material = clonedMat;
      }
    });
  }

},
        hideGUI: () => {
          const wrapper = document.getElementById('gui-wrapper');
          if (wrapper) wrapper.style.display = 'none'; 
    }

      };

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

      resolve(controlAPI); 
    });
  });
}
