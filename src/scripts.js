import * as THREE from 'three';

export function initThree(container) {
  const width = container.clientWidth;
  const height = container.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 5;

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();
}
