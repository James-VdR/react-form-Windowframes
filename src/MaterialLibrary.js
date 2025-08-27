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

//---glas---//
export function applyGlassMaterial(mesh, textureIndex = 0, thick = false) {
  if (!mesh) return;

  const loader = new THREE.TextureLoader(); // <-- NEW loader for textures
  const glassTextures = [
    loader.load("/textures/texture_test1.png"), // Default
    loader.load("/textures/texture_test2.png"), // Pattern 1
    loader.load("/textures/placeholder_glass3.png"), // Pattern 2
  ];

  glassTextures.forEach((tex) => {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    map: glassTextures[textureIndex] || glassTextures[0],
    color: 0xffffff,
    metalness: 0,
    roughness: 0.01,
    transmission: 1.0,
    thickness: thick ? 0.06 : 0.01,
    transparent: true,
    opacity: thick ? 0.9 : 1.0,
    ior: 1.0,
    envMapIntensity: thick ? 1.0 : 0.5,
    clearcoat: 0.0,
    reflectivity: 0.1,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  mesh.material = glassMaterial;

  // Optional dynamic thickness
  mesh.setGlassThickness = (t) => {
    glassMaterial.thickness = t;
    const tintFactor = Math.min(t / 0.1, 1);
    glassMaterial.color.setRGB(1 - 0.3 * tintFactor, 1 - 0.3 * tintFactor, 1);
    glassMaterial.envMapIntensity = 0.5 + tintFactor * 0.5;
  };
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
