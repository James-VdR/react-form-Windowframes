import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
const materialLibrary = {};
/**
 
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


export function applyGlassMaterial(mesh) {
  const glassMaterial = new THREE.MeshPhysicalMaterial({
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
    side: THREE.FrontSide
  });

  mesh.material = glassMaterial;
}
