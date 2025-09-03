import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { applyGlassMaterial } from "./MaterialLibrary";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SSAOPass } from 'three/examples/jsm/postprocessing/SSAOPass.js';

export let scene, camera, controls, renderer, model, composer;

export const verticalParts = [];
export const horizontalParts = [];
export const moduleParts = [];
export const mainFrameParts = [];
export const insideFrameParts = [];
export const hatchFrameParts = [];
export const glassParts = [];
export const hatchParts = [];
export let verticalBeams = [];

let modelReadyCallback = null;
let boundingBoxHelper = null;
let currentHDRI = "Background.hdr";

//------------------------------------------
// EXPORTABLE FUNCTIONS
//------------------------------------------
export function detectVerticalBeams(sceneParam) {
    verticalBeams = [];
    sceneParam.traverse(child => {
        if (child.isMesh) {
            const name = child.name.toLowerCase();
            if (name.includes("mid1") || name.includes("mid2") || name.includes("mid3")) {
                verticalBeams.push(child);
            }
        }
    });
    verticalBeams.sort((a, b) => a.name.localeCompare(b.name));
}

export function getVerticalBeams() {
    return verticalBeams;
}

export function spawnWindowAddon(position = { x: 0, y: 0, z: 0 }) {
    const loader = new GLTFLoader();
    loader.load('/models/hatch.glb', (gltf) => {
        const windowModel = gltf.scene;
        windowModel.position.set(position.x, position.y, position.z);
        scene.add(windowModel);

        windowModel.traverse(child => {
            if (child.isMesh && child.name.toLowerCase().includes("hatch")) {
                hatchFrameParts.push(child);
            }
        });

        console.log("Add-on window spawned at", position);
    });
}

export function registerOnModelReady(callback) {
    modelReadyCallback = callback;
}

export function loadHDRI(hdriName) {
    if (!renderer) return console.warn("Renderer not initialized yet!");
    const pmrem = new THREE.PMREMGenerator(renderer);
    new RGBELoader().setPath("/models/").load(hdriName, (texture) => {
        const envMap = pmrem.fromEquirectangular(texture).texture;
        scene.environment = envMap;
        scene.background = envMap;
        texture.dispose();
        pmrem.dispose();
        currentHDRI = hdriName;
        console.log(`🌄 HDRI switched to: ${hdriName}`);
    });
}

export function initThree(container) {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.physicallyCorrectLights = true;
    renderer.outputEncoding = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    renderer.setClearColor(0xa3d69c);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lights
    const sunLight = new THREE.DirectionalLight(0xffffff, 3);
    sunLight.position.set(5, 10, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 2; // softens edges
    scene.add(sunLight);

    const fillLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.5);
    fillLight.intensity = 0.2; // lower = shadows darker
    scene.add(fillLight);

    // Composer & Passes
    composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const ssaoPass = new SSAOPass(scene, camera, width, height);
    ssaoPass.kernelRadius = 16;
    ssaoPass.minDistance = 0.005;
    ssaoPass.maxDistance = 0.1;
    composer.addPass(ssaoPass);

    const bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.15, 0.5, 0.9);
    composer.addPass(bloomPass);

    // Ground
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), new THREE.ShadowMaterial({ opacity: 0.3 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // HDRI & Model
    loadHDRI(currentHDRI);
    loadModel();

    // Resize
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
    });

    // Animation loop
    renderer.setAnimationLoop(() => {
        if (boundingBoxHelper && model) boundingBoxHelper.update();
        composer.render();
        controls.update();
    });
}

//------------------------------------------
// PRIVATE FUNCTIONS
//------------------------------------------
function loadModel() {
    const loader = new GLTFLoader();
    if (model) scene.remove(model);

    loader.load("./models/Tester.glb", (glb) => {
        model = glb.scene;
        scene.add(model);
        groupFrameParts(model);
        centerModel(model);
        frameModel(model);

        if (typeof modelReadyCallback === "function") modelReadyCallback();

        if (boundingBoxHelper) scene.remove(boundingBoxHelper);
        boundingBoxHelper = new THREE.BoxHelper(model, 0xff0000);
        scene.add(boundingBoxHelper);
    });
}

function groupFrameParts(model) {
    verticalParts.length = 0;
    horizontalParts.length = 0;
    mainFrameParts.length = 0;
    insideFrameParts.length = 0;
    hatchFrameParts.length = 0;

    model.traverse(child => {
        if (!child.isMesh) return;
        const name = child.name.toLowerCase();

        if (name.includes("left_frame") || name.includes("right_frame")) verticalParts.push(child);
        if (name.includes("top_frame") || name.includes("bottom_frame")) horizontalParts.push(child);
        if (name.includes("glass")) {
            glassParts.push(child);
            applyGlassMaterial(child);
        }
        if (["left_frame","right_frame","top_frame","bottom_frame"].some(p=>name.includes(p))) mainFrameParts.push(child);
        if (["left_inside","right_inside","top_inside","bottom_inside"].some(p=>name.includes(p))) insideFrameParts.push(child);
        if (["top_hatch","right_hatch","left_hatch","bottom_hatch"].some(p=>name.includes(p))) hatchFrameParts.push(child);
        if (["horiz_beam1","horiz_beam2","horiz_beam3","horiz_beam4","top_mid1","bottom_mid1","top_mid2","bottom_mid2","top_mid3","bottom_mid3"].some(p=>name.includes(p))) moduleParts.push(child);
    });
}

function centerModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
}

function frameModel(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());
    const distance = size * 1.2;
    camera.position.copy(center.clone().add(new THREE.Vector3(0, 0, distance)));
    camera.lookAt(center);
    controls.target.copy(center);
    controls.update();
}

export function applyMaterialToMainFrame(material) {
    mainFrameParts.forEach(mesh => mesh.material = material.clone());
}

export function applyMaterialsToInsideFrame(material) {
    insideFrameParts.forEach(mesh => mesh.material = material.clone());
}

export function applyMaterialsToModuleFrame(material) {
    moduleParts.forEach(mesh => mesh.material = material.clone());
}

export function applyMaterialsToHatchFrame(material) {
    hatchFrameParts.forEach(mesh => mesh.material = material.clone());
}