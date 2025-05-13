import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

import pandabaas from './Images/PandaBaas.jpg';
import bedrijfslogo from './Images/reuzenpandalogo.jpg';

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

//Lighting

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);


        // Cone Lighting (spotlight)
            const spotLight = new THREE.SpotLight(0xFFFFFF,5000);
            scene.add(spotLight);
            spotLight.position.set(-100, 100, 0);
            spotLight.castShadow = true;
            spotLight.angle = 0.15;
        // Cone Lighting (spotlight)

        //SpotLight Helper (draws helping line to visualize the angle of the spotline)
        const spotLightHelper = new THREE.SpotLightHelper(spotLight);
        scene.add(spotLightHelper);
        //SpotLight Helper (draws helping line to visualize the angle of the spotline)

            //Fog
                scene.fog = new THREE.Fog(0xFFFFFF, 0, 250);
            //Fog
//Lighting
            //Background Color
                renderer.setClearColor(0xA3D69C)
            //Background Color

    /*------------------------------------------------------------------------------------------------------------


            //Background (with Image JPG) 
        
        //Loads Textures
        const textureLoader = new THREE.TextureLoader();
        //Loads Textures

        // This line wil allow you to set a image as a background but it will look 2d
        
        scene.background = textureLoader.load(pandabaas);
        
        // This line wil allow you to set a image as a background but it will look 2d

        
        // set each side of the 3D Cube background a diffrent JPG
        
          const cubeTextureLoader = new THREE.CubeTextureLoader();
          scene.background = cubeTextureLoader.load([
                       
              JPG,
              JPG,
              JPG,
              JPG,
              JPG,
              JPG

        //    ]);

                Background (with Image JPG)

    ------------------------------------------------------------------------------------------------------------*/

//Lighting

//Dat.GUI

 if (!gui) {
    gui = new GUI(); // Only create once
  }

let options = {
  sphereColor: '#ffea00',
  wireframe: false,
  angle: 0.2,
  penumbra: 0,
  intensity: 5000,
  sphereX: -10,
  sphereY: 10,
  sphereZ: 0
};


if (!guiInitialized) {
  gui.addColor(options, 'sphereColor').onChange((e) => {
    sphere.material.color.set(e);
  });

  gui.add(options, 'wireframe').onChange((e) => {
    sphere.material.wireframe = e;
  });

  gui.add(options, 'angle', 0, 1); // angle of light (activate helper too see);
  gui.add(options, 'penumbra', 0, 1); // Blur;
  gui.add(options, 'intensity', 0, 10000); // Intensity of light;
  gui.add(options, 'sphereX', -30, 30).step(0.01).name ('Sphere X');
  gui.add(options, 'sphereY', -30 ,30).step(0.01).name ('Sphere Y');
  gui.add(options, 'sphereZ', -30, 30).step(0.01).name ('Sphere Z');


  guiInitialized = true;
}
//lil.GUI




//Grid Lines
    const gridHelper = new THREE.GridHelper(30);
    scene.add(gridHelper);
//Gird Lines
    
        //Animations (lets you see your changes in real time)
            function animate(){
        

            spotLight.angle = options.angle;
            spotLight.penumbra = options.penumbra;
            spotLight.intensity = options.intensity;
            spotLight.positionx = options.positionx;
            spotLightHelper.update();

            sphere.position.set(options.sphereX, options.sphereY, options.sphereZ);

            renderer.render(scene,camera);

                                }

            renderer.setAnimationLoop(animate);
        //Animations (lets you see your changes in real time)
    
    //When opening the dev console the window would not size back this function fixes that
    window.addEventListener('resize', function(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //When opening the dev console the window would not size back this function fixes that

})
}
