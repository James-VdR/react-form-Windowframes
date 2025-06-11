import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'lil-gui';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';


let pivotGroup; // Group containing the loaded 3D model, allowing for easy manipulation
let scene; // The Three.js scene where all objects are placed
let gui; // Lil-GUI instance for interactive controls
let camera, controls; // Three.js camera and OrbitControls for navigation
let modelSwitcher = { model: 'Window_Frame.glb' }; // Object to control which GLB model is loaded
let currentModelPath = '/models/Window_Frame.glb'; // Path to the currently loaded model
let scaleParams = { Height: 1, Width: 1, Thickness: 1 }; // Parameters for scaling the window model
let dimensionHelpers = []; // Array to hold 3D objects representing dimension lines and labels
let zones = {}; // holds the grouped mesh zones for resizing and material assignment
let modularParams = {
    enabledHeight: false, // Flag to enable/disable height modular stacking
    enabledWidth: false, // Flag to enable/disable width modular stacking
    ModuleHeight: 1.15, // Default height of a modular section
    ModuleWidth: 0.88 // Default width of a modular section
};


const materialLibrary = {}; // Stores loaded materials from the 'Materials.glb' file
const modelOptions = ['Window_Frame.glb', 'Window_Frame_Cross.glb', 'Window_Frame_Kofig.glb']; // Available window models

let controlAPI; // Declare controlAPI in a higher scope


/**
 * Applies modular stacking to the window model based on enabled parameters.
 * It removes previous clones and dimension helpers, then creates new stacked clones
 * for height and width, and updates dimension lines and camera distance.
 */
function applyModularStacking() {
    if (!pivotGroup) {
        console.warn('[ModularStacking] No pivotGroup found.');
        return;
    }

    // Remove previously generated modular clones from the scene
    const toRemove = [];
    pivotGroup.traverse(child => {
        if (child.userData.isModularClone) {
            toRemove.push(child);
        }
    });
    toRemove.forEach(child => pivotGroup.remove(child));

    // Remove previous dimension helpers (lines and text labels)
    dimensionHelpers.forEach(obj => pivotGroup.remove(obj));
    dimensionHelpers = [];


    // --- HEIGHT STACKING ---
    // Find the base mesh for height stacking (e.g., a central vertical frame piece)
    const baseMeshY = findMeshByName('outside_frame_middle_x');
    if (modularParams.enabledHeight) {
        if (baseMeshY) {
            // Stack clones along the Y-axis (height)
            stackClones(baseMeshY, 'y', modularParams.ModuleHeight);
            baseMeshY.visible = false; // Hide the original base mesh when clones are active
        } else {
            console.warn('Base mesh for height stacking not found.');
        }
    } else {
        if (baseMeshY) baseMeshY.visible = true; // Make the original mesh visible again if stacking is disabled
    }

    // --- WIDTH STACKING ---
    // Find the base mesh for width stacking (e.g., a central horizontal frame piece)
    const baseMeshX = findMeshByName('outside_frame_middle_y');
    const leftRef = findMeshByName('left_frame'); // Reference point for width stacking
    if (modularParams.enabledWidth) {
        if (baseMeshX && leftRef) {
            // Stack clones along the X-axis (width)
            stackClonesWidth(baseMeshX, modularParams.ModuleWidth, leftRef);
            baseMeshX.visible = false; // Hide the original base mesh when clones are active
        } else {
            console.warn('Base mesh for width stacking not found.');
        }
    } else {
        if (baseMeshX) baseMeshX.visible = true; // Make the original mesh visible again if stacking is disabled
    }

    // === Dimension Lines ===
    // Find specific frame meshes to calculate dimensions
    const rightFrame = findMeshByName('right_frame');
    const bottomFrame = findMeshByName('bottom_frame');

    if (rightFrame && bottomFrame) {
        // Get bounding boxes of the reference frames
        const boxRight = new THREE.Box3().setFromObject(rightFrame);
        const boxBottom = new THREE.Box3().setFromObject(bottomFrame);

        // Define offsets for placing dimension lines outside the model
        const zOffset = 0.1;
        const yOffset = 0.18;

        // Calculate start and end points for height dimension line
        const rightTop = new THREE.Vector3(boxRight.max.x + zOffset, yOffset + boxRight.max.y, 0);
        const rightBottom = new THREE.Vector3(boxRight.max.x + zOffset, boxRight.min.y - yOffset, 0);

        // Calculate start and end points for width dimension line
        const bottomLeft = new THREE.Vector3(boxBottom.min.x, boxBottom.min.y - zOffset, 0);
        const bottomRight = new THREE.Vector3(boxBottom.max.x, boxBottom.min.y - zOffset, 0);

        // Create the actual 3D lines
        const heightLine = createDimensionLine(rightBottom, rightTop);
        const widthLine = createDimensionLine(bottomLeft, bottomRight);

        // Calculate raw height and width from bounding boxes
        const rawHeight = (boxRight.max.y - boxRight.min.y);
        const rawWidth = (boxBottom.max.x - boxBottom.min.x);

        // Calibrate units to real-world millimeters (adjust these values based on your model's scale)
        const baseHeight = 1.911; // Actual height in world units at scale 1.0 (e.g., if 1 unit = 1 meter, this is 1.911 meters)
        const unitToMM = 1000 / baseHeight; // Conversion factor: how many mm per 1 unit of height

        const heightMM = (rawHeight * unitToMM).toFixed(0) + ' mm'; // Convert raw height to mm
        // The width calculation seems specific to your model, adjusting for a base width of 500mm at scale 1.0
        const widthMM = (500 + ((rawWidth - 1.0) * 1000) / 2).toFixed(0) + ' mm';

        // Calculate midpoints for placing labels
        const heightMid = new THREE.Vector3().addVectors(rightTop, rightBottom).multiplyScalar(0.5);
        const widthMid = new THREE.Vector3().addVectors(bottomLeft, bottomRight).multiplyScalar(0.5);

        // Adjust label positions relative to the dimension lines
        const heightLabelPos = heightMid.clone().add(new THREE.Vector3(1, 0, 0.1));   // Right of center
        const widthLabelPos = widthMid.clone().add(new THREE.Vector3(0.5, -0.2, 0.1));   // Under the line

        // Create text labels as 3D sprites
        const heightLabel = createTextLabel(heightMM, heightLabelPos);
        const widthLabel = createTextLabel(widthMM, widthLabelPos);

        // Add all dimension helper objects to the array and then to the pivot group
        dimensionHelpers.push(heightLine, widthLine, heightLabel, widthLabel);
        pivotGroup.add(...dimensionHelpers);

        if (rightFrame && bottomFrame) {
            console.log('[Dimension Labels] Creating dimension labels'); // Confirm block runs
        }

    }

    // Adjust camera distance to fit the potentially resized/stacked model
    updateCameraDistance(pivotGroup);
}

/**
 * Determines the logical "zone" name for a given mesh based on its name.
 * This helps in grouping meshes for applying specific behaviors (e.g., resizing, material).
 * @param {string} name - The name of the mesh.
 * @returns {string} The identified zone name (e.g., 'frame', 'glass', 'outside').
 */
function getZoneNameFromMesh(name) {
    const lname = name.toLowerCase();
    if (lname.includes('outside') && lname.includes('frame')) return 'outside';
    if (lname.includes('frame') && lname.includes('inside')) return 'frameInside';
    if (lname.includes('frame')) return 'frame';
    if (lname.includes('glass')) return 'glass';
    if (lname.includes('inside')) return 'inside';
    if (lname.includes('outside')) return 'outside';
    return 'misc'; // Default for unrecognized names
}

// Defines behaviors for different zones, including resize strategies and material change allowance
const zoneBehaviors = {
    frame: { resizeStrategy: 'frame', allowResize: true, allowColorChange: true },
    frameInside: { resizeStrategy: 'frame', allowColorChange: true },
    glass: { resizeStrategy: 'uniform', allowColorChange: true },
    inside: { allowColorChange: true },
    outside: { resizeStrategy: 'frame', allowColorChange: true },
    misc: { allowColorChange: true },
};

/**
 * Resizes a group of meshes based on a specified strategy.
 * @param {Array<THREE.Mesh>} meshes - Array of meshes to resize.
 * @param {object} scaleParams - Object containing Height, Width, Thickness scale factors.
 * @param {string} strategy - The resizing strategy ('frame' or 'uniform').
 */
function resizeZoneParts(meshes, scaleParams, strategy) {
    if (strategy === 'frame') resizeFrameParts(meshes, scaleParams);
    else if (strategy === 'uniform') resizeUniformParts(meshes, scaleParams);
}

/**
 * Loads materials from a specified GLB file and stores them in the materialLibrary.
 * @param {string} glbPath - Path to the GLB file containing materials.
 * @param {function} onComplete - Callback function to execute once materials are loaded.
 */
function loadMaterialLibrary(glbPath = '/models/Materials.glb', onComplete) {
    const loader = new GLTFLoader();
    loader.load(glbPath, (gltf) => {
        gltf.scene.traverse((child) => {
            if (child.isMesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                    const name = mat.name?.trim();
                    if (name && !materialLibrary[name]) {
                        materialLibrary[name] = mat.clone(); // Store a clone to avoid modifying original materials
                    }
                });
            }
        });
        if (onComplete) onComplete();
        console.log('[Material Library Loaded]', Object.keys(materialLibrary));
    }, undefined, (err) => {
        console.error('Material load error:', err);
        if (onComplete) onComplete();
    });
}

/**
 * Applies a default glass material to a given mesh.
 * This is a basic MeshPhysicalMaterial for transparency and reflections.
 * @param {THREE.Mesh} mesh - The mesh to apply the glass material to.
 */
function applyGlassMaterial(mesh) {
    mesh.material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.05, // Lower roughness for more clear reflections
        transmission: 0.9, // Higher transmission for clear glass
        thickness: 0.1,    // Thinner glass for more realistic refraction
        transparent: true,
        opacity: 1.0,      // Full opacity with transmission for PBR glass
        ior: 1.5,          // Index of refraction for glass
        envMapIntensity: 1, // Intensity of environment map influence
        side: THREE.DoubleSide, // Render both front and back faces
    });
}

/**
 * Resizes frame parts of the model, adjusting scale and position to maintain structural integrity.
 * This is a custom resizing logic tailored to the window frame geometry.
 * @param {Array<THREE.Mesh>} meshes - Array of meshes belonging to the 'frame' zone.
 * @param {object} scaleParams - Object containing Height, Width, Thickness scale factors.
 */
function resizeFrameParts(meshes, scaleParams) {
    meshes.forEach(mesh => {
        const name = mesh.name.toLowerCase();

        // Store original scale and position on the first run
        if (!mesh.userData.originalScale || !mesh.userData.originalPosition) {
            mesh.userData.originalScale = mesh.scale.clone();
            mesh.userData.originalPosition = mesh.position.clone();
        }

        const origScale = mesh.userData.originalScale;
        const origPos = mesh.userData.originalPosition;

        // Reset to original state before applying new scale, to prevent cumulative errors
        mesh.scale.copy(origScale);
        mesh.position.copy(origPos);

        const deltaHeight = scaleParams.Height - 1.0; // Change in height from original scale (1.0)

        // Compensation to adjust position slightly when scaling up/down to prevent gaps
        const correctionOffset = -deltaHeight * 0.20;

        // Apply scaling and position adjustments based on mesh name
        if (name.includes('left') || name.includes('right') || name.includes('middle_y')) {
            mesh.scale.y = origScale.y * scaleParams.Height; // Scale vertically

            // Shift DOWN slightly to compensate scaling gap
            mesh.position.y = origPos.y + correctionOffset;

            // Specific adjustments for horizontal position for middle Y-axis pieces
            const widthOffsetFactorR = 1.30;
            const widthOffsetFactorL = 0.67;
            if (name.includes('outside_frame_middle_yl')) {
                mesh.position.x = origPos.x + (scaleParams.Width - 1.0) * widthOffsetFactorL;
            }
            if (name.includes('outside_frame_middle_yr')) {
                mesh.position.x = origPos.x + (scaleParams.Width - 1.0) * widthOffsetFactorR;
            }

            if (name.includes('right')) {
                const deltaWidth = scaleParams.Width - 1.0;
                const correctionOffsetX = deltaWidth * 1;
                mesh.position.x = origPos.x + deltaWidth * origScale.z + correctionOffsetX;
            }
        }

        if (name.includes('top') || name.includes('middle_x')) {
            mesh.scale.x = origScale.x * scaleParams.Width; // Scale horizontally

            const correctionOffset = deltaHeight * 0.90;
            mesh.position.y = origPos.y + deltaHeight * origScale.y + correctionOffset;
        }


        if (name.includes('bottom')) {
            mesh.scale.x = origScale.x * scaleParams.Width; // Scale horizontally
            mesh.position.y = origPos.y; // Keep Y position fixed
        }

        // Apply thickness scaling to all parts
        mesh.scale.z = origScale.z * scaleParams.Thickness;
    });
}

/**
 * Resizes parts of the model uniformly, typically for internal components like glass.
 * @param {Array<THREE.Mesh>} meshes - Array of meshes to resize.
 * @param {object} scaleParams - Object containing Height, Width, Thickness scale factors.
 */
function resizeUniformParts(meshes, scaleParams) {
    meshes.forEach(mesh => {
        // Store original scale and position
        if (!mesh.userData.originalScale || !mesh.userData.originalPosition) {
            mesh.userData.originalScale = mesh.scale.clone();
            mesh.userData.originalPosition = mesh.position.clone();
        }

        const origScale = mesh.userData.originalScale;
        const origPos = mesh.userData.originalPosition;

        const deltaHeight = scaleParams.Height - 1.0;
        const deltaWidth = scaleParams.Width - 1.0;

        // Position correction factors for uniform scaling
        const correctionOffsetY = -deltaHeight * 0.20;
        const correctionOffsetX = -deltaWidth * 0.11;

        // Slightly over-scale width to close the gap on the right (fudge factor)
        const widthCorrectionFactor = 1 + (deltaWidth * 0.03);

        // Apply new scale values
        mesh.scale.set(
            origScale.x * scaleParams.Width * widthCorrectionFactor,
            origScale.y * scaleParams.Height,
            origScale.z * scaleParams.Thickness
        );

        // Apply new position values
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
        // Calculate bounding box and center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        // Remove any existing pivot groups (previous models) from the scene
        const oldPivots = scene.children.filter(c => c.type === 'Group');
        oldPivots.forEach(obj => scene.remove(obj));

        pivotGroup = new THREE.Group();
        pivotGroup.add(model);
        scene.add(pivotGroup);

        controls.target.copy(center);
        controls.update();

        // Traverse the loaded model to identify and group meshes by zone
        model.traverse((child) => {
            if (child.isMesh && child.material) {
                // Ensure model meshes cast shadows
                child.castShadow = true;

                if (child.name.toLowerCase().includes('glass')) applyGlassMaterial(child); // Apply glass material to glass parts
                // Store original scale and position for later resizing calculations
                child.userData.originalScale = child.scale.clone();
                child.userData.originalPosition = child.position.clone();

                const zoneName = getZoneNameFromMesh(child.name); // Get the zone name for the mesh
                console.log('[Mesh Found]', child.name);

                // Debug log for unknown zone mappings
                if (!zoneBehaviors[zoneName]) {
                    console.warn(`Unknown zone name: ${child.name} → mapped to "${zoneName}"`);
                }

                // Add mesh to its corresponding zone array
                if (!zones[zoneName]) zones[zoneName] = [];
                zones[zoneName].push(child);
            }
        });

        // Debugging: Log sizes of specific target meshes
        const targetNames = [
            'Outside_Frame_Middle_XL',
            'Outside_Frame_Middle_YL',
            'Outside_Frame_Middle_XR',
            'Outside_Frame_Middle_YR'
        ];

        targetNames.forEach(name => {
            const mesh = findMeshByName(name);
            if (mesh) {
                const box = new THREE.Box3().setFromObject(mesh);
                const size = box.getSize(new THREE.Vector3());
                console.log(`[Mesh Size] ${name}:`, size);
            } else {
                console.warn(`[Mesh Not Found] ${name}`);
            }
        });

        // Set up the Lil-GUI for dynamic controls
        setupDynamicGUI(zones, scaleParams, pivotGroup);
        // Update camera distance to frame the new model
        updateCameraDistance(pivotGroup);
        showDimensionLines(); // Show dimension lines immediately after model load


    });
}

function setupDynamicGUI(zones, scaleParams, pivotGroup) {
    const guiWrapper = document.getElementById('gui-wrapper');
    if (gui) gui.destroy(); // Destroy previous GUI instance if it exists
    gui = new GUI({ width: 250, autoPlace: false }); // Create new GUI instance
    guiWrapper.appendChild(gui.domElement); // Append GUI to the wrapper div

    const materialNames = Object.keys(materialLibrary);
    if (materialNames.length === 0) {
        console.warn('No materials loaded into the material library. GUI might be limited.');
        return;
    }

    // Iterate through each zone and create GUI controls
    Object.entries(zones).forEach(([zoneName, meshes]) => {
        const config = zoneBehaviors[zoneName] || {}; // Get behavior config for the zone
        const folder = gui.addFolder(`${zoneName.toUpperCase()} Settings`); // Create a folder for each zone

        // Material selection control
        if (config.allowColorChange) {
            const params = { material: materialNames[0] }; // Default to the first material
            folder.add(params, 'material', materialNames).name('Material').onChange((selected) => {
                meshes.forEach(mesh => {
                    // Apply the selected material to all meshes in the zone
                    mesh.material = materialLibrary[selected].clone(); // Use a clone to prevent shared material issues
                });

                // If the 'outside' zone material is changed, update modular clones as well
                if (zoneName === 'outside') {
                    pivotGroup.traverse(child => {
                        if (child.userData.isModularClone) {
                            child.material = materialLibrary[selected].clone();
                        }
                    });
                }
            });
        }

        // Resizing controls (Height, Width, Thickness)
        if (config.allowResize) {
            ['Height', 'Width', 'Thickness'].forEach(param => {
                let min = 1, max = 2.999;

                if (param === 'Thickness') {
                    min = 1; // Thickness might have a fixed range
                    max = 1;
                } else if (param === 'Width') {
                    max = 4; // Width can have a larger range
                }

                folder.add(scaleParams, param, min, max)
                    .step(0.001) // Allow fine-grained adjustments
                    .onChange(() => {
                        // When a scale parameter changes, re-resize all zones
                        Object.entries(zones).forEach(([zn, zMeshes]) => {
                            const strategy = zoneBehaviors[zn]?.resizeStrategy;
                            if (strategy) resizeZoneParts(zMeshes, scaleParams, strategy);
                        });

                        // Reapply modular clones after resizing to ensure they adapt
                        applyModularStacking();

                        // Update camera distance to fit the resized model
                        updateCameraDistance(pivotGroup);
                    });
            });
        }

        folder.open(); // Open the folder by default
    });

    // -----------------------------
    // MODULAR STACKING CONTROLS
    // -----------------------------
    const modularFolder = gui.addFolder('MODULARISE');

    // Height stacking controls
    modularFolder
        .add(modularParams, 'enabledHeight')
        .name('Enable Height Stacking')
        .onChange(applyModularStacking); // Reapply stacking when enabled/disabled

    modularFolder
        .add(modularParams, 'ModuleHeight', 0.25, 1.2)
        .step(0.001)
        .name('Module Height')
        .onChange(applyModularStacking); // Reapply stacking when module height changes

    // Width stacking controls
    modularFolder
        .add(modularParams, 'enabledWidth')
        .name('Enable Width Stacking')
        .onChange(applyModularStacking); // Reapply stacking when enabled/disabled

    modularFolder
        .add(modularParams, 'ModuleWidth', 0.25, 3.8)
        .step(0.001)
        .name('Module Width')
        .onChange(applyModularStacking); // Reapply stacking when module width changes

    modularFolder.open(); // Open the modular folder by default

    // -----------------------------
    // ADDITIONAL CUSTOM CONTROLS (for specific mesh adjustments)
    // -----------------------------
    const customAdjustmentsFolder = gui.addFolder('Custom Adjustments');

    // Controls for horizontal offsets of middle bars
    customAdjustmentsFolder.add({ value: 0 }, 'value', -1.0, 1.0)
        .name('Left Horiz Offset')
        .onChange((value) => controlAPI.setLeftHorizontalOffset(value));

    customAdjustmentsFolder.add({ value: 0 }, 'value', -1.0, 1.0)
        .name('Right Horiz Offset')
        .onChange((value) => controlAPI.setRightHorizontalOffset(value));

    // Controls for vertical offsets of middle bars
    customAdjustmentsFolder.add({ value: 0 }, 'value', -0.15, 0.50)
        .name('Left Vert Offset')
        .onChange((value) => controlAPI.setLeftVerticalOffset(value));

    customAdjustmentsFolder.add({ value: 0 }, 'value', -0.50, 0.15)
        .name('Right Vert Offset')
        .onChange((value) => controlAPI.setRightVerticalOffset(value));

    customAdjustmentsFolder.open();
}

/**
 * Finds a mesh within the pivot group by a partial name (case-insensitive).
 * @param {string} partialName - Part of the name to search for.
 * @returns {THREE.Mesh|null} The found mesh or null if not found.
 */
function findMeshByName(partialName) {
    let found = null;
    pivotGroup.traverse(child => {
        if (child.isMesh && child.name.toLowerCase().includes(partialName.toLowerCase())) {
            found = child;
        }
    });
    return found;
}

/**
 * Creates a Three.js Line object for dimension visualization.
 * @param {THREE.Vector3} start - Start point of the line.
 * @param {THREE.Vector3} end - End point of the line.
 * @returns {THREE.Line} The created line object.
 */
function createDimensionLine(start, end) {
    const material = new THREE.LineBasicMaterial({ color: 0x000000 }); // Black line
    const points = [start, end];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geometry, material);
}

/**
 * Creates a 3D text label using a CanvasTexture and a Sprite.
 * @param {string} text - The text content for the label.
 * @param {THREE.Vector3} position - The 3D position of the label.
 * @returns {THREE.Sprite} The created sprite object.
 */
function createTextLabel(text, position) {
    console.log('[createTextLabel] Called with position:', position);

    const canvas = document.createElement('canvas');
    canvas.width = 512; // Canvas dimensions
    canvas.height = 128;

    const context = canvas.getContext('2d');
    context.font = 'bold 48px Arial'; // Font style and size
    context.fillStyle = 'black'; // Text color
    context.fillText(text, 10, 80); // Draw text on canvas

    const texture = new THREE.CanvasTexture(canvas); // Create texture from canvas
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: false }); // Material for the sprite
    const sprite = new THREE.Sprite(spriteMaterial); // Create the sprite
    sprite.scale.set(1.2, 0.5, 0.5); // Adjust sprite scale to control text size in 3D
    sprite.position.copy(position); // Set sprite position

    console.log('[createTextLabel] Sprite position:', sprite.position);

    return sprite;
}

/**
 * Stacks clones of an original mesh along a specified axis.
 * Used for modular height stacking.
 * @param {THREE.Mesh} original - The original mesh to clone.
 * @param {'x'|'y'|'z'} axis - The axis along which to stack ('x', 'y', or 'z').
 * @param {number} moduleSize - The size of each module (distance between clones).
 * @param {THREE.Object3D} [originReference=null] - An optional reference object for positioning.
 */
function stackClones(original, axis, moduleSize, originReference = null) {
    const boundingBox = new THREE.Box3().setFromObject(pivotGroup);
    const size = boundingBox.getSize(new THREE.Vector3());
    const totalLength = axis === 'x' ? size.x : size.y; // Total length based on axis
    const count = Math.floor(totalLength / moduleSize); // Number of modules that fit

    let lastPosition;

    // Use Left_Frame as geometric origin if provided
    if (axis === 'x' && originReference) {
        const originPos = new THREE.Vector3();
        originReference.getWorldPosition(originPos);
        pivotGroup.worldToLocal(originPos);
        lastPosition = originPos.x + moduleSize * 0.5;
    } else {
        lastPosition = original.position[axis];
    }


    // Add offset to start clones slightly inward (for width stacking)
    if (axis === 'x') {
        lastPosition -= (count * moduleSize) / 2;
    }



    for (let i = 1; i <= count; i++) {
        const clone = original.clone(); // Create a clone of the original mesh
        clone.name = `${original.name}_Clone_${axis.toUpperCase()}_${i}`;
        clone.userData.isModularClone = true; // Mark as a modular clone

        clone.geometry = clone.geometry.clone(); // Clone geometry and material to make them independent
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

        lastPosition = worldPos[axis]; // Update last position for the next clone
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
        const clone = original.clone(); // Create a clone
        clone.name = `${original.name}_Clone_X_${i}`;
        clone.userData.isModularClone = true; // Mark as modular clone

        clone.geometry = clone.geometry.clone(); // Clone geometry and material
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

// initThree function is now exported as a module function again
export function initThree(container, modelPath = '/models/Window_Frame.glb') {
    return new Promise((resolve) => {
        // Clear any existing content in the container
        while (container.firstChild) container.removeChild(container.firstChild);

        const width = container.clientWidth;
        const height = container.clientHeight;

        // Initialize WebGLRenderer
        const renderer = new THREE.WebGLRenderer({ antialias: true }); // Antialiasing for smoother edges
        renderer.shadowMap.enabled = true; // Enable shadow mapping
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        renderer.setClearColor(0xfffffff); // Set background color to white

        // --- Realistic Rendering Enhancements ---
        // Enable tone mapping for better handling of high dynamic range lighting
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        // Increased exposure for brighter overall scene
        renderer.toneMappingExposure = 3; // Adjusted from 1.0 to 1.8 for brighter output
        renderer.outputColorSpace = THREE.SRGBColorSpace; // Corrected as per your fix

        // Initialize Scene
        scene = new THREE.Scene();
        // Set a default clear color if environment map isn't loaded or fully opaque
        scene.background = new THREE.Color(0xf0f0f0);


        // Load HDR environment map for realistic global illumination and reflections
        const pmremGenerator = new THREE.PMREMGenerator(renderer); // Helper for pre-filtering environment maps
        pmremGenerator.compileEquirectangularShader(); // Compile the shader for efficiency

        new RGBELoader()
            .setPath('/models/') // Set the path to your HDRI file
            .load('Background.hdr', (texture) => { // Replace 'venice_sunset_1k.hdr' with your HDRI filename
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;
                scene.environment = envMap; // Apply the environment map to the scene for reflections and general lighting
                scene.background = envMap;  // Set the environment map as the scene background
                texture.dispose(); // Dispose of the original texture as it's no longer needed
                pmremGenerator.dispose();
            }, undefined, (error) => {
                console.error('An error occurred loading the HDRI:', error);
                // Fallback to a solid background color if HDRI fails to load
                scene.environment = null;
                scene.background = new THREE.Color(0xf0f0f0);
            });


        // Initialize Camera (Depth of Field is not applied by default with PerspectiveCamera alone)
        camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        camera.position.set(0, 5, 10); // Initial camera position

        // Initialize OrbitControls for camera interaction
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Enable damping for smooth camera movement
        controls.dampingFactor = 0.05;
        controls.enableZoom = true;
        controls.enablePan = true;
        controls.screenSpacePanning = true;
        controls.minPolarAngle = 0; // Prevent camera from going below the ground
        controls.maxPolarAngle = Math.PI; // Allow camera to look directly up
        controls.update();

        // Add Ambient Light (uniform lighting from all directions)
        // Increased intensity for brighter ambient lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Adjusted from 0.5 to 1.2
        scene.add(ambientLight);

        // Add Spot Light (directional light with a cone shape, good for highlighting)
        // Increased intensity for stronger directional lighting and shadows
        const spotLight = new THREE.SpotLight(0xffffff, 1.5); // Adjusted from 0.5 to 1.5
        spotLight.position.set(90, 200, 390); // Position of the spot light
        spotLight.castShadow = true; // Enable shadow casting for this light
        spotLight.shadow.mapSize.width = 1024; // Increase shadow map resolution for better quality
        spotLight.shadow.mapSize.height = 1024;
        spotLight.shadow.bias = -0.0001; // Small bias to prevent shadow acne
        scene.add(spotLight);

        // Add a ground plane for shadows
        const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(1200, 1200),
            new THREE.ShadowMaterial({ opacity: 0.3 }) // Transparent material that receives shadows
        );
        ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        ground.position.y = -5; // Position below the model
        ground.receiveShadow = true; // Ground receives shadows
        scene.add(ground);

        // Setup GUI wrapper div
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
            guiWrapper.innerHTML = ''; // Clear previous GUI contents if re-initializing
            guiWrapper.style.display = 'flex'; // Ensure it's visible
        }

        // Create a separate GUI for model switching
        const switcherGUI = new GUI({ width: 200, autoPlace: false });
        guiWrapper.appendChild(switcherGUI.domElement);

        const modelFolder = switcherGUI.addFolder('MODEL SWITCHER');
        modelFolder
            .add(modelSwitcher, 'model', modelOptions)
            .name('Select Model')
            .onChange((value) => {
                modelSwitcher.model = value;
                currentModelPath = `/models/${value}`; // Update current model path
                reloadModel(currentModelPath); // Reload the model
            });
        modelFolder.open();

        currentModelPath = modelPath; // Set initial model path

        // Load material library first, then load the window model
        loadMaterialLibrary('/models/Materials.glb', () => {
            reloadModel(currentModelPath); // Load the initial window model

            // Define a control API that can be exposed to external scripts
            controlAPI = { // Assign to the globally declared controlAPI
                setHeight: (val) => {
                    scaleParams.Height = val;
                    // Apply resize to all relevant zones
                    Object.entries(zoneBehaviors).forEach(([zn, config]) => {
                        const strategy = config?.resizeStrategy;
                        if (strategy && zones[zn]) {
                            resizeZoneParts(zones[zn], scaleParams, strategy);
                        }
                    });
                    applyModularStacking(); // Reapply stacking after height change
                    safeUpdateCameraDistance(pivotGroup); // Update camera
                },
                setWidth: (val) => {
                    scaleParams.Width = val;
                    // Apply resize to all relevant zones
                    Object.entries(zoneBehaviors).forEach(([zn, config]) => {
                        const strategy = config?.resizeStrategy;
                        if (strategy && zones[zn]) {
                            resizeZoneParts(zones[zn], scaleParams, strategy);
                        }
                    });
                    applyModularStacking(); // Reapply stacking after width change
                    safeUpdateCameraDistance(pivotGroup); // Update camera
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
                        clonedMat.needsUpdate = true;
                        mesh.material = clonedMat;
                    });

                    if (zoneName === 'outside') {
                        pivotGroup.traverse(child => {
                            if (child.userData.isModularClone) {
                                const clonedMat = materialLibrary[matName].clone();
                                clonedMat.needsUpdate = true;
                                child.material = clonedMat;
                            }
                        });
                    }
                },
                setLeftHorizontalOffset: (value) => {
                    if (!pivotGroup) return;

                    const barMesh = findMeshByName('Outside_Frame_Middle_XL');
                    const topFrame = findMeshByName('top_frame');

                    if (barMesh && topFrame) {
                        const box = new THREE.Box3().setFromObject(topFrame);
                        const topY = box.getCenter(new THREE.Vector3()).y;

                        const fudgeOffset = -1.05;

                        barMesh.position.y = topY - value + fudgeOffset;
                    }
                },
                setRightHorizontalOffset: (value) => {
                    if (!pivotGroup) return;

                    const barMesh = findMeshByName('Outside_Frame_Middle_XR');
                    const topFrame = findMeshByName('top_frame');

                    if (barMesh && topFrame) {
                        const box = new THREE.Box3().setFromObject(topFrame);
                        const topY = box.getCenter(new THREE.Vector3()).y;

                        const fudgeOffset = -1.05;

                        barMesh.position.y = topY - value + fudgeOffset;
                    }
                },
                setLeftVerticalOffset: (value) => {
                    if (!pivotGroup) return;

                    const verticalMesh = findMeshByName('Outside_Frame_Middle_YL');
                    const horizontalMesh = findMeshByName('Outside_Frame_Middle_XL');

                    if (
                        verticalMesh &&
                        horizontalMesh &&
                        verticalMesh.userData.originalPosition &&
                        horizontalMesh.userData.originalScale &&
                        horizontalMesh.userData.originalPosition
                    ) {
                        const clamped = Math.max(-0.15, Math.min(0.50, value));
                        verticalMesh.position.x = verticalMesh.userData.originalPosition.x + clamped;

                        const deltaX = clamped;
                        const origScale = horizontalMesh.userData.originalScale.clone();

                        // Only apply fudge when expanding past 0
                        const fudge = deltaX > 0.001 ? 0.1 : 0;

                        // Apply clean scaling in X with conditional fudge
                        horizontalMesh.scale.set(
                            origScale.x + deltaX + fudge,
                            origScale.y,
                            origScale.z
                        );
                    }
                },
                setRightVerticalOffset: (value) => {
                    if (!pivotGroup) return;

                    const verticalMesh = findMeshByName('Outside_Frame_Middle_YR');
                    const horizontalMesh = findMeshByName('Outside_Frame_Middle_XR');
                    const rightFrame = findMeshByName('right_frame');

                    if (
                        verticalMesh &&
                        horizontalMesh &&
                        verticalMesh.userData.originalPosition &&
                        horizontalMesh.userData.originalPosition &&
                        horizontalMesh.userData.originalScale &&
                        rightFrame
                    ) {
                        const clamped = Math.max(-0.50, Math.min(0.15, value));
                        const origScale = horizontalMesh.userData.originalScale.clone();

                        // Get world-space right edge of the frame
                        const box = new THREE.Box3().setFromObject(rightFrame);
                        const rightEdgeX = box.max.x;

                        // Convert to local space
                        const rightEdgeWorld = new THREE.Vector3(rightEdgeX, 0, 0);
                        pivotGroup.worldToLocal(rightEdgeWorld);

                        // Manual tweak offset (tune this freely)
                        const offsetTweak = -1;

                        // Adjust vertical bar position with manual tweak
                        verticalMesh.position.x = rightEdgeWorld.x + clamped + offsetTweak;

                        if (clamped < 0) {
                            const fudgePositionLeft = -0.035;
                            horizontalMesh.position.x = rightEdgeWorld.x + clamped + offsetTweak + fudgePositionLeft;

                            const stretch = -clamped * 0.25;
                            const fudgeStretch = 0.015;

                            horizontalMesh.scale.set(
                                origScale.x + stretch + fudgeStretch,
                                origScale.y,
                                origScale.z
                            );
                        } else if (clamped > 0) {
                            const shrink = clamped * 1;
                            const shift = shrink * 1.15;
                            const fudgeShrink = 0.001;

                            horizontalMesh.position.x = rightEdgeWorld.x + clamped + offsetTweak + shift;

                            horizontalMesh.scale.set(
                                Math.max(origScale.x - shrink + fudgeShrink, 0.02),
                                origScale.y,
                                origScale.z
                            );
                        } else {
                            horizontalMesh.position.x = rightEdgeWorld.x + offsetTweak;
                            horizontalMesh.scale.copy(origScale);
                        }
                    }
                },
                getScene: () => scene,
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