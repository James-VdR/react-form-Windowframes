import * as THREE from 'three';
// Get the container element
const container = document.querySelector('.main-content');

// Create the renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
const width = container.clientWidth;
const height = container.clientHeight;
renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas to the container
container.appendChild(renderer.domElement);

// Create a scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.z = 5;

// Add an axes helper
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// Render the scene
renderer.render(scene, camera);