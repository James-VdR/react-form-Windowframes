import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import { initThree } from "./Scene.js";

import logo from "./Images/reuzenpandalogo.jpg";

function App() {
  const mountRef = useRef(null);

  // Optional: State to hold which model you want to load
  const [modelPath] = useState("/models/Window_Frame.glb");

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
          <input type="range" min="1000" max="3000" defaultValue="1000" id="scaleSlider"></input>
          <input type="text" placeholder="Height" id="value-field"></input>
        </div>


        <div class="Slider">
          <p>Width</p>
          <input type="range" min="1000" max="3000" defaultValue="1000"></input>
          <input type="text" placeholder="Width" id="value-field"></input>
        </div>
        <div class="Slider">
          <p>Width</p>
          <input type="color"></input>
        </div>
        
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
