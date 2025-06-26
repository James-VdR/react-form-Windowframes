import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import { Scaling } from "./ScalingLogic.js";
import { initThree, applyMaterial} from "./Scene.js";
import { loadMaterialLibrary, getMaterialColorOptions } from "./MaterialLibrary.js";
import { ColorSelectorGroup } from "./ColorSelectorGroup.js";
import logo from "./Images/reuzenpandalogo.jpg";
import { applyMaterialToMainFrame } from "./Scene.js";


function App() {
  const mountRef = useRef(null);
  const sliderRef = useRef();
  // Optional: State to hold which model you want to load
  const [modelPath] = useState("/models/Window_Frame.glb");
  const [scaleValue, setScaleValue] = useState(1);

  //materials and such and colorOptions are loaded.
  const [materialsLoaded, setMaterialsLoaded] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  //const material = new THREE.MeshBasicMaterial({selectedColor});

  //const mesh = new THREE.Mesh(box, material);


  useEffect(() => {
    loadMaterialLibrary("/models/Materials.glb", () => {
      const options = getMaterialColorOptions();
      setColorOptions(options);
      setMaterialsLoaded(true);
    });
  }, []);

  function handleColorSelect(color) {
    setSelectedColor(color);
    if(color.material){
      applyMaterialToMainFrame(color.material); // will apply the color.
    }
    console.log("Applying material:", color.name);
  }

  //wasnt aware a slider ref was added, made it work though
  //basically uses the scaling function in scalingLogic.js and calls it in the function useEffect
  useEffect(() => {
    if (sliderRef.current) {
      Scaling(sliderRef.current, (scale) => {
        setScaleValue(scale);
      });
    }
  }, []);

  useEffect(() => {
    if (mountRef.current) {
      // Pass the mount DOM element AND the model path you want to load
      initThree(mountRef.current, modelPath);
    }
  }, [modelPath]); // Re-run if modelPath changes, reloads scene with new model

  return (
    <div className="container">
      <div class="sidebar">
        <img src={logo} alt="Logo" className="bottom-image" />
        <h1>model 1</h1>

        <div class="Slider">
          <p>Height</p>
          <input
            type="range"
            min="1000"
            max="3000"
            defaultValue="1000"
            ref={sliderRef}
          ></input>
          <p id="scaleValue">Scale: {scaleValue.toFixed(2)}</p>
        </div>

        <div className="Slider">
          <p>Width</p>
          <input type="color" />
        </div>
``
        {materialsLoaded ? (
          <ColorSelectorGroup
            title="Frame Color"
            colors={colorOptions}
            selected={selectedColor}
            onSelect={handleColorSelect}
          />
        ) : (
          <p>Loading materials...</p>
        )}
      </div>
      <main
        className="main-content"
        ref={mountRef}
        style={{ width: "100%", height: "100vh" }}
      >
        {/* The 3D scene will render inside this element */}
      </main>
    </div>
  );
}

export default App;
