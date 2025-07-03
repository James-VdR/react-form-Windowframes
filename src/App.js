import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  loadMaterialLibrary,
  getMaterialColorOptions,
  resetMaterials,
} from "./MaterialLibrary.js";
import { ColorSelectorGroup } from "./ColorSelectorGroup.js";
import logo from "./Images/reuzenpandalogo.jpg";
import {
  initThree,
  applyMaterialToMainFrame,
  registerOnModelReady,
  applyMaterialsToInsideFrame,
  applyMaterialsToModuleFrame,
} from "./Scene";
import { heightScaling, widthScaling } from "./ScalingLogic";

  const variantsWithBeam = new Set([
            "model_1_variant2",
            "model_2_variant2",
            "model_2_variant3",
            "model_2_variant4",
            "model_2_variant5",
            "model_3_variant2",
            "model_3_variant3",
            "model_4_variant1",
            // Add any others that include a beam
          ]);
          
function App() {
  const mountRef = useRef(null);
  const heightSliderRef = useRef();
  const widthSliderRef = useRef();

  const [heightScaleValue, setHeightScaleValue] = useState(1);
  const [widthScaleValue, setWidthScaleValue] = useState(5);

  const [materialsLoaded, setMaterialsLoaded] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedBaseModel, setSelectedBaseModel] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null); // Final variant used for loading

  
  // Load material library ONCE when component mounts
  useEffect(() => {
    loadMaterialLibrary("/models/Materials.glb", () => {
      const options = getMaterialColorOptions();
      setColorOptions(options);
      setMaterialsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!selectedModel || !mountRef.current) return;

    initThree(mountRef.current);

    registerOnModelReady(() => {
      if (selectedModel.includes("model_1")) {
        import("./Models/model_1.js").then((module) => {
          if (selectedModel.endsWith("variant1")) {
            module.applyModel1_1Scaling();
          } else {
            module.applyModel1_2Scaling(); // Assume you add this
          }
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 500;
          setHeightScaleValue(1000);
          setWidthScaleValue(500);
        });
      }
      if (selectedModel.includes("model_2")) {
        import("./Models/model_2.js").then((module) => {
          const variantMap = {
            model_2_variant1: module.applyModel2_1Scaling,
            model_2_variant2: module.applyModel2_2Scaling,
            model_2_variant3: module.applyModel2_3Scaling,
            model_2_variant4: module.applyModel2_4Scaling,
            model_2_variant5: module.applyModel2_5Scaling,
          };

          

          const applyVariant = variantMap[selectedModel];
          if (applyVariant) {
            applyVariant();
          } else {
            console.warn("Unknown variant:", selectedModel);
          }
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 1000;
          setHeightScaleValue(1000);
          setWidthScaleValue(1000);
        });
      }
      if (selectedModel.includes("model_3")) {
        import("./Models/model_3.js").then((module) => {
          const variantMap = {
            model_3_variant1: module.applyModel3_1Scaling,
            model_3_variant2: module.applyModel3_2Scaling,
            model_3_variant3: module.applyModel3_3Scaling,
          };

          const applyVariant = variantMap[selectedModel];
          if (applyVariant) {
            applyVariant();
          } else {
            console.warn("Unknown variant:", selectedModel);
          }
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 1500;
          setHeightScaleValue(1000);
          setWidthScaleValue(1500);
        });
      }
      if (selectedModel.includes("model_4")) {
        import("./Models/model_4.js").then((module) => {
          if (selectedModel.endsWith("variant1")) {
            module.applyModel4Scaling();
          } else {
          }
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 2000;
          setHeightScaleValue(1000);
          setWidthScaleValue(2000);
        });
      }

      // Repeat for other models...
      if (heightSliderRef.current) {
        heightScaling(heightSliderRef.current, setHeightScaleValue);
        setHeightScaleValue(parseFloat(heightSliderRef.current.value));
      }
      if (widthSliderRef.current) {
        widthScaling(widthSliderRef.current, setWidthScaleValue);
        setWidthScaleValue(parseFloat(widthSliderRef.current.value));
      }
    });
  }, [selectedModel]);
  // Selection page JSX
  if (!selectedBaseModel && !selectedModel) {
    return (
      <div className="container-class">
        <h1>Select a Model</h1>
        <div
          className="model-container"
          onClick={() => setSelectedBaseModel("model_1")}
        >
          Model A
        </div>
        <div
          className="model-container"
          onClick={() => setSelectedBaseModel("model_2")}
        >
          Model B
        </div>
        <div
          className="model-container"
          onClick={() => setSelectedBaseModel("model_3")}
        >
          Model C
        </div>
        <div
          className="model-container"
          onClick={() => setSelectedBaseModel("model_4")}
        >
          Model D
        </div>
      </div>
    );
  }

  const variantCounts = {
    model_1: 2,
    model_2: 5,
    model_3: 3,
    model_4: 1,
  };

  // If base model is selected but variant isn't
  if (selectedBaseModel && !selectedModel) {
    const variantCount = variantCounts[selectedBaseModel] || 1;

    return (
      <div className="container-class">
        <h1>
          Select a Variant for{" "}
          {selectedBaseModel.replace("_", " ").toUpperCase()}
        </h1>

        {[...Array(variantCount)].map((_, i) => {
          const variantNumber = i + 1;
          return (
            <div
              key={variantNumber}
              className="model-container"
              onClick={() =>
                setSelectedModel(`${selectedBaseModel}_variant${variantNumber}`)
              }
            >
              Variant {variantNumber}
            </div>
          );
        })}

        <button onClick={() => setSelectedBaseModel(null)}>Back</button>
      </div>
    );
  }

  function handleMainFrameColorSelect(color) {
    setSelectedColor(color);
    if (color.material) {
      applyMaterialToMainFrame(color.material);
    }
    console.log("Applying material:", color.name);
  }
  function handleInsideFrameColorSelect(color) {
    setSelectedColor(color);
    if (color.material) {
      applyMaterialsToInsideFrame(color.material);
    }
    console.log("Applying material:", color.name);
  }
  function handleModuleFrameColorSelect(color) {
    setSelectedColor(color);
    if (color.material) {
      applyMaterialsToModuleFrame(color.material);
    }
    console.log("Applying material:", color.name);
  }

  return (
    <div className="container">
      <div className="sidebar">
        <img src={logo} alt="Logo" className="bottom-image" />
        <h1>{selectedModel.replace("_", " ").toUpperCase()}</h1>
        <button
          onClick={() => {
            setSelectedModel(null);
            setSelectedBaseModel(null);
          }}
        >
          Back to selection
        </button>
        <div className="heightSlider">
          <p>Height</p>
          <input
            type="range"
            min="1000"
            max="2000"
            defaultValue="1000"
            ref={heightSliderRef}
          />

          <p id="heightScaleValue">height: {heightScaleValue.toFixed(0)}mm</p>
        </div>

        <div className="widthSlider">
          <p>Width</p>
          <input
            type="range"
            min="500"
            max="2000"
            defaultValue="500"
            ref={widthSliderRef}
          />
          <p id="widthScaleValue">width: {widthScaleValue.toFixed(0)}mm</p>
        </div>

      {variantsWithBeam.has(selectedModel) && (
        <div className="beamSlider">
          <p>Beam</p>
          <input
            type="range"
            min="250"
            max="1750"
            defaultValue="750"
            ref={widthSliderRef}
          />
          <p id="widthScaleValue">
            Beam position: {widthScaleValue.toFixed(0)}mm
          </p>
        </div>
      )}
        {materialsLoaded ? (
          <ColorSelectorGroup
            title="Frame Color"
            colors={colorOptions}
            selected={selectedColor}
            onSelect={handleMainFrameColorSelect}
          />
        ) : (
          <p>Loading materials...</p>
        )}

        {materialsLoaded ? (
          <ColorSelectorGroup
            title="insideFrame Color"
            colors={colorOptions}
            selected={selectedColor}
            onSelect={handleInsideFrameColorSelect}
          />
        ) : (
          <p>Loading materials...</p>
        )}

        {materialsLoaded ? (
          <ColorSelectorGroup
            title="insideFrame Color"
            colors={colorOptions}
            selected={selectedColor}
            onSelect={handleModuleFrameColorSelect}
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
        {/* 3D scene renders here */}
      </main>
    </div>
  );
}

export default App;
