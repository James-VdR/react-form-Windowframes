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
    45, 
    width / 
    height, 
    0.1, 
    1000);

        //Rotate around object
        const orbit = new OrbitControls(camera, renderer.domElement)
        camera.position.set (-10,30,30);
        orbit.update();
        //Rotate around object

  //camera

  //Geometry
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00})
const box = new THREE.Mesh(boxGeometry,boxMaterial);
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(30,30);
const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xFFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;

const sphereGeometry = new THREE.SphereGeometry(4);
const sphereMaterial = new THREE.MeshBasicMaterial(0x00ff00);
const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
scene.add(sphere);
//Geometry

//Grid Lines
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);
//Gird Lines

    //Rotation
function animate(){
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;
        renderer.render(scene,camera);

    }
    //Rotation
renderer.setAnimationLoop(animate);
}
