import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

export function initThree(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  //camera
const camera = new THREE.PerspectiveCamera(
    75, 
    width / 
    height, 
    0.1, 
    1000);

const orbit = new OrbitControls(camera, renderer.domElement)
camera.position.set (0,2,5);
orbit.update();
  //camera

  //Geometry
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00})
const box = new THREE.Mesh(boxGeometry,boxMaterial);
scene.add(box);
  //Geometry

    //axes line
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
    //axes line

    //Rotation
function animate(){
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;
        renderer.render(scene,camera);

    }
    //Rotation
renderer.setAnimationLoop(animate);
}
