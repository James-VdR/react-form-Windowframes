import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';

let gui; 
let guiInitialized = false;
 
export function initThree(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer();
  
  //enables shadows
  renderer.shadowMap.enabled = true;
  //enables shadows

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
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFFF,
    side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = -0.5 * Math.PI;
plane.receiveShadow = true;

const sphereGeometry = new THREE.SphereGeometry(4);
const sphereMaterial = new THREE.MeshStandardMaterial({color:0xffea00});
const sphere = new THREE.Mesh(sphereGeometry,sphereMaterial);
scene.add(sphere);
sphere.position.set(-10,10,0);
sphere.castShadow = true;
//Geometry

//lighting

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

//const directionalLight = new THREE.DirectionalLight(0xFFFFFF,2);
//scene.add(directionalLight);
//directionalLight.position.set(-30,50,0);
//directionalLight.castShadow = true;
//directionalLight.shadow.camera.bottom = -14;
//directionalLight.shadow.camera.left = -14;
//directionalLight.shadow.camera.right = 14;
//directionalLight.shadow.camera.top = 14;



//Helpers , visual helping tool.
//const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 5);
//scene.add(directionalLightHelper);

//const directionalLightShadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
//scene.add(directionalLightShadowHelper);
//Helpers , visual helping tool.



//lighting
const spotLight = new THREE.SpotLight(0xFFFFFF,5000);
scene.add(spotLight);
spotLight.position.set(-100, 100, 0);
spotLight.castShadow = true;
spotLight.angle = 0.15;

const spotLightHelper = new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper);
//Dat.GUI

 if (!gui) {
    gui = new dat.GUI(); // Only create once
  }

let options = {
  sphereColor: '#ffea00',
  wireframe: false,
  angle: 0.2,
  penumbra: 0,
  intensity: 5000,
  positionx: 10,
};


if (!guiInitialized) {
  gui.addColor(options, 'sphereColor').onChange((e) => {
    sphere.material.color.set(e);
  });

  gui.add(options, 'wireframe').onChange((e) => {
    sphere.material.wireframe = e;
  });

  gui.add(options, 'angle', 0, 1);
  gui.add(options, 'penumbra', 0, 1);
  gui.add(options, 'intensity', 0, 10000);
  gui.add(options, 'positionx', -1000,1000);

  guiInitialized = true;
}
//Dat.GUI

//Grid Lines
const gridHelper = new THREE.GridHelper(30);
scene.add(gridHelper);
//Gird Lines

    //Rotation
function animate(){
        box.rotation.x += 0.01;
        box.rotation.y += 0.01;

        spotLight.angle = options.angle;
        spotLight.penumbra = options.penumbra;
        spotLight.intensity = options.intensity;
        spotLight.positionx = options.positionx;
        spotLightHelper.update();

        renderer.render(scene,camera);

    }
    //Rotation
renderer.setAnimationLoop(animate);
}
