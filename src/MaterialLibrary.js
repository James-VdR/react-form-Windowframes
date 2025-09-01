import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {  glassParts,mainFrameParts,insideFrameParts  } from './Scene';
const materialLibrary = {};

//---------------------------
/**
 * 
 * 
 
Loads materials from a specified GLB file and stores them in the materialLibrary.
@param {string} glbPath - Path to the GLB file containing materials.
@param {function} onComplete - Callback function to execute once materials are loaded.*/
export function loadMaterialLibrary(glbPath = '/models/Materials.glb', onComplete) {
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




const MATERIAL_NAME_MAP = {
  'White': 'White',
  'Cream': 'Creme',
  'Ivory': 'Licht Ivoor',
  'WineRed': 'Wijnrood',
  'PineGreen': 'Dennengroen',
  'MonumentGreen': 'Monumentengroen',
  'BlueSteel': 'Staalblauw',
  'Golden Oak': 'Golden Oak',
  'Mahogany': 'Mahonie',
  'SilverGrey': 'Zilvergrijs',
  'BasaltGrey': 'Basaltgrijs',
  'QuartzGrey': 'Kwartsgrijs',
  'Anthracite': 'Antracietgrijs',
  'BlackGrey': 'Zwartgrijs',
  'Black': 'Zwart'
};

export function getMaterialColorOptions() {
  return Object.entries(materialLibrary).map(([name, material]) => ({
    name: name,
    ral: name.replace(/\s/g, ""), // or a real RAL mapping
    hex: `#${material.color.getHexString()}`,
    material: material,
  }));
}

const glassMaterials = [];

// Default glass (no pattern)
glassMaterials.push(new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.01,
    transmission: 1.0,
    thickness: 0.01,
    transparent: true,
    opacity: 1.0,
    ior: 1.0,
    envMapIntensity: 0.5,
    clearcoat: 0.0,
    reflectivity: 0.1,
    depthWrite: false,
    side: THREE.FrontSide,
}));

// Pattern 1
const pattern1Texture = createDiagonalLineTexture('#5f8193ff', 5, 1000, 60, '#bc3e3eff');
glassMaterials.push(new THREE.MeshPhysicalMaterial({
    map: pattern1Texture,
    color: 0xffffff,
    metalness: 0,
    roughness: 0.01,
    transmission: 1.0,
    thickness: 0.01,
    transparent: true,
    opacity: 1.0,
    ior: 1.0,
    envMapIntensity: 0.5,
    clearcoat: 0.0,
    reflectivity: 0.1,
    depthWrite: false,
    side: THREE.FrontSide,
}));

// Pattern 2
const pattern2Texture = createCrissCrossTexture('#5f8193ff', 10, 1000, 40, '#a0c4ff');
glassMaterials.push(new THREE.MeshPhysicalMaterial({
    map: pattern2Texture,
    color: 0xffffff,
    metalness: 0,
    roughness: 0.01,
    transmission: 1.0,
    thickness: 0.01,
    transparent: true,
    opacity: 1.0,
    ior: 1.0,
    envMapIntensity: 0.5,
    clearcoat: 0.0,
    reflectivity: 0.1,
    depthWrite: false,
    side: THREE.FrontSide,
}));
//---glas---//

function createDiagonalLineTexture(lineColor = '#5f8193ff', lineThickness = 2, size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = 'rgba(147, 212, 222, 0.46)'; // Transparent background
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;

    // Draw diagonal lines across the square
    for (let i = -size; i < size; i += 20) { // spacing between lines
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4); // Can adjust repetition
    return texture;
}

function createCrissCrossTexture(lineColor = '#5f8193ff', lineThickness = 5, size = 1000, spacing = 20, backgroundColor = '#ffffff') {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineThickness;

    // Draw first set of diagonal lines (\)
    for (let i = -size; i < size; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + size, size);
        ctx.stroke();
    }

    // Draw second set of diagonal lines (/)
    for (let i = 0; i < 2 * size; i += spacing) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i - size, size);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    return texture;
}

// Updated glass material function
export function applyGlassMaterial(index = 0) {
    if (!glassParts || glassParts.length === 0) return;

    // Get the material from the array, fallback to default
    const material = glassMaterials[index] || glassMaterials[0];

    glassParts.forEach((mesh) => {
        mesh.material = material;
        mesh.material.needsUpdate = true; // make sure Three.js refreshes the material
    });
}

export function resetMaterials() {
  
  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 1,
  });

  mainFrameParts.forEach((mesh) => {
    mesh.material = defaultMaterial.clone();
  });

  insideFrameParts.forEach((mesh) => {
    mesh.material = defaultMaterial.clone();
  });

  glassParts.forEach((mesh) => {
    mesh.material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.01,
      transmission: 1.0,
      thickness: 0.01,
      transparent: true,
      opacity: 1.0,
      ior: 1.0,
      envMapIntensity: 0.5,
      clearcoat: 0.0,
      reflectivity: 0.1,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  });

  console.log('Materials reset to default.');
}
