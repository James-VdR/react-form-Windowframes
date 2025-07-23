import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";
import { scene } from "./Scene";

// Add at the top of the file
export let geoNodeMesh = null;

export function importGeoNodesGLB(position = { x: 0, y: 0, z: 0 }) {
  const loader = new GLTFLoader();
  loader.load("/models/geonodes.glb", (gltf) => {
    const geoNodeModel = gltf.scene;
    geoNodeModel.position.set(position.x, position.x, position.z);
    geoNodeModel.scale.set(1, 1, 1);
    geoNodeModel.name = "GeoTestModel";

    geoNodeModel.traverse((child) => {
      if (child.isMesh && child.userData) {
        const { Width, Height } = child.userData;
        console.log("📦 Geometry Metadata:", { Width, Height });

        // ✅ Store reference globally so we can scale it later
        geoNodeMesh = child;
      }
    });

    scene.add(geoNodeModel);
  });
}
