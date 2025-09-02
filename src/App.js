import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  loadMaterialLibrary,
  getMaterialColorOptions,
  resetMaterials,
  applyGlassMaterial,
} from "./MaterialLibrary.js";
import { ColorSelectorGroup } from "./ColorSelectorGroup.js";

import {
  initThree,
  applyMaterialToMainFrame,
  registerOnModelReady,
  applyMaterialsToInsideFrame,
  applyMaterialsToModuleFrame,
  applyMaterialsToHatchFrame,
  detectVerticalBeams,
  getVerticalBeams,
  spawnWindowAddon,
  hatchFrameParts,
  glassParts,
} from "./Scene";
import { 
  heightScaling, 
  widthScaling,
  horizontalBeamPositioning,
  defaultHorizontalBeamPositioningManual,
  model_2_variant2BeamPositioningManual,
  modelVerticalBeamPositioning,
  model3_1VerticalBeamPositioningManual,
  model3_2VerticalBeamPositioningManual,
  model3_3VerticalBeamPositioningManual,
  model_1_variant2WidthScaling,
  model2VerticalBeamPositioningManual,
  model2VerticalBeamPositioning,
  model4VerticalBeamPositioning,
  model4VerticalBeamPositioningManual,
  widthScaling_mod_1_1,
  heightScaling_mod_1_1,
  heightScaling_mod_1_2,
  widthScaling_mod_1_2,
} from "./ScalingLogic";

const variantsWithHorizontalBeam = new Set([
  "model_1_variant2",
  "model_2_variant2",
  "model_2_variant3",
  "model_2_variant4",
  "model_2_variant5",
  "model_3_variant2",
  "model_3_variant3",
  "model_4_variant1",
]);



const verticalBeamPositioningFunctions = {
model_2_variant1:model2VerticalBeamPositioningManual,
model_2_variant2:model2VerticalBeamPositioningManual,
model_2_variant3:model2VerticalBeamPositioningManual,
model_2_variant4:model2VerticalBeamPositioningManual,
model_2_variant5:model2VerticalBeamPositioningManual,
model_3_variant1:model3_1VerticalBeamPositioningManual,
model_3_variant2:model3_2VerticalBeamPositioningManual,
model_3_variant3:model3_3VerticalBeamPositioningManual,
model_4_variant1: model4VerticalBeamPositioningManual,
};


function App() {
  const mountRef = useRef(null);
  const heightSliderRef = useRef();
  const widthSliderRef = useRef();
  const horizontalBeamSliderRef = useRef();

  const [hatchVisible, setHatchVisible] = useState(false);

  const [selectedOption, setSelectedOption] = useState("");
  const[dimensionsLocked, setDimensionsLocked] = useState(false);
  const [heightScaleValue, setHeightScaleValue] = useState(1);
  const [widthScaleValue, setWidthScaleValue] = useState(5);
  const [horizontalBeamValue, setHorizontalBeamValue] = useState(750);
  const [horizontalBeamMax, setHorizontalBeamMax] = useState(750);
  const [verticalBeamSliderValue, setVerticalBeamSliderValue] = useState(500); // default 500
  const [verticalBeamMax, setVerticalBeamMax] = useState(600); // 600 is initial max for 1000MM width

  const [materialsLoaded, setMaterialsLoaded] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedBaseModel, setSelectedBaseModel] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null); // Final variant used for loading

  //this has to do with vertical beam
  const [,setVerticalBeamPositions] = useState([]);

  const handleWidthChange = (newWidth) => {
  setWidthScaleValue(newWidth);
  window.currentModelWidth = newWidth;

  const minWidth = 500;
  const baseVerticalMax = 600;
  const dynamicVerticalMax = baseVerticalMax + (newWidth - 1000);

  setVerticalBeamMax(dynamicVerticalMax);

setVerticalBeamSliderValue((prevValue) => {
  const clamped = Math.min(prevValue, dynamicVerticalMax);

  if (verticalBeamPositioningFunctions[selectedModel]) {
    // Pass current width for models that require it
    if (selectedModel.startsWith("model_2")) {
      verticalBeamPositioningFunctions[selectedModel](clamped, newWidth);
    } else {
      verticalBeamPositioningFunctions[selectedModel](clamped);
    }
  }

  return clamped;
});

};




  // Load material library ONCE when component mounts
  useEffect(() => {
    loadMaterialLibrary("/models/Materials.glb", () => {
      const options = getMaterialColorOptions();
      setColorOptions(options);
      setMaterialsLoaded(true);
    });
  }, []);



  useEffect(() => {
  if (!selectedModel) return;
  window.selectedModel = selectedModel; // ✅ Make it globally accessible
}, [selectedModel]);    

useEffect(() => {
  if (!dimensionsLocked) return;

  const hatchShouldBeVisible = selectedOption === "onder";
  setHatchVisible(hatchShouldBeVisible);

  hatchFrameParts.forEach((mesh) => {
    mesh.visible = hatchShouldBeVisible;
  });
}, [selectedOption, dimensionsLocked]);



  useEffect(() => {
    if (!selectedModel || !mountRef.current) return;

    initThree(mountRef.current);

registerOnModelReady(() => {
  const hatchShouldBeVisible = selectedOption === "onder" && dimensionsLocked;

  // Set state and apply visibility correctly at model load
  setHatchVisible(hatchShouldBeVisible);
  hatchFrameParts.forEach((mesh) => {
    mesh.visible = hatchShouldBeVisible;
  });

      if (selectedModel.includes("model_1")) {
    import("./Models/model_1.js").then((module) => {
 
  if (selectedModel === "model_1_variant1") {
    module.applyModel1_1Scaling();
     
    widthScaling(widthSliderRef.current, handleWidthChange);
    widthScaling_mod_1_1(widthSliderRef.current, handleWidthChange);
    heightScaling_mod_1_1(heightSliderRef.current, setHeightScaleValue, (beamMax) => setHorizontalBeamMax(beamMax));
    
  } 
  else if (selectedModel === "model_1_variant2") {
    module.applyModel1_2Scaling();
    model_1_variant2WidthScaling(widthSliderRef.current, true, );
    widthScaling_mod_1_1(widthSliderRef.current);
    heightScaling_mod_1_1(horizontalBeamSliderRef.current, );
  }

  resetMaterials();

  if (heightSliderRef.current) heightSliderRef.current.value = 1000;
  if (widthSliderRef.current) widthSliderRef.current.value = 500;
  setHeightScaleValue(1000);
  setWidthScaleValue(500);
        });
        
        }
          if (horizontalBeamSliderRef.current) {
          horizontalBeamPositioning(horizontalBeamSliderRef.current, setHorizontalBeamValue);
          setHorizontalBeamValue(parseFloat(horizontalBeamSliderRef.current.value));
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
  heightScaling(
    heightSliderRef.current,
    setHeightScaleValue,
    (dynamicBeamMax) => {
      setHorizontalBeamMax(dynamicBeamMax);

      setHorizontalBeamValue((prevValue) => {
        const newValue = prevValue > dynamicBeamMax ? dynamicBeamMax : prevValue;

        // Update actual beam position to reflect the clamped value
    if (selectedModel === "model_2_variant2") {
  model_2_variant2BeamPositioningManual(newValue);
} else {
  defaultHorizontalBeamPositioningManual(newValue);
}


        return newValue;
      });
    }
  );

  setHeightScaleValue(parseFloat(heightSliderRef.current.value));
}


widthScaling(widthSliderRef.current, (newWidth) => {
  setWidthScaleValue(newWidth);
  window.currentModelWidth = newWidth;

  // Generic dynamic vertical max adjustment, applies to all models
  const minWidth = 500;
  const baseVerticalMax = 600; // Max at 1000 width
  const dynamicVerticalMax = baseVerticalMax + (newWidth - 1000); 

  setVerticalBeamMax(dynamicVerticalMax);

setVerticalBeamSliderValue((prevValue) => {
  const clamped = Math.min(prevValue, dynamicVerticalMax);

  if (verticalBeamPositioningFunctions[selectedModel]) {
    // Pass current width for models that require it
    if (selectedModel.startsWith("model_2")) {
      verticalBeamPositioningFunctions[selectedModel](clamped, newWidth);
    } else {
      verticalBeamPositioningFunctions[selectedModel](clamped);
    }
  }

  return clamped;
});

});
// 🔽 Add this just before detectVerticalBeams()
if (selectedModel === "model_1_variant1" || selectedModel === "model_1_variant2") {
  spawnWindowAddon({ x: -1.022, y: -0.50, z: 0 }); // adjust position to fit frame, and find the reguired variables.
}


      detectVerticalBeams(window.scene);
      const beams = getVerticalBeams();
      const initialPositions = beams.map((beam) => beam.position.x);
      setVerticalBeamPositions(initialPositions);
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

   function handleHatchFrameColorSelect(color) {
    setSelectedColor(color);
    if (color.material) {
      applyMaterialsToHatchFrame(color.material);
    }
    console.log("Applying material:", color.name);
  }

//GLASS GLASS GLASS GLASS GLASS
  function applyGlassMaterialToScene(index) {
  glassParts.forEach(mesh => applyGlassMaterial(mesh, index));
}

// Set the glass thickness for all glass meshes
function setGlassThicknessToScene(value) {
  glassParts.forEach(mesh => {
    if (mesh.setGlassThickness) {
      mesh.setGlassThickness(value);
    }
  });
}

  return (
    <div className="container">
      <div className="sidebar">
      
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
            disabled={dimensionsLocked}
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
            disabled={dimensionsLocked}
          />
          <p id="widthScaleValue">width: {widthScaleValue.toFixed(0)}mm</p>
        </div>
       

{variantsWithHorizontalBeam.has(selectedModel) && (
  <div className="horizontalBeamSlider">
    <p>Beam</p>
    <input
      type="range"
      min="250"
      max={horizontalBeamMax}
      value={horizontalBeamValue}
      disabled={dimensionsLocked}
      onChange={(e) => {
        const newValue = parseFloat(e.target.value);
        setHorizontalBeamValue(newValue);
        
       if (selectedModel === "model_2_variant2") {
  model_2_variant2BeamPositioningManual(newValue);
} else {
  defaultHorizontalBeamPositioningManual(newValue);
}

      }}
      ref={horizontalBeamSliderRef}
    />
    <p>horizontal Beam position: {horizontalBeamValue.toFixed(0)}mm</p>
  </div>
)}


{verticalBeamPositioningFunctions[selectedModel] && (
  <div className="verticalBeamSlider">
    <p>Vertical Beam</p>
<input
  type="range"
  min="400"
  max={verticalBeamMax}
  value={verticalBeamSliderValue}
  disabled={dimensionsLocked}
  onInput={(e) => {
    const newValue = parseFloat(e.target.value);
    setVerticalBeamSliderValue(newValue);

    if (verticalBeamPositioningFunctions[selectedModel]) {
      if (selectedModel.startsWith("model_2")) {
        verticalBeamPositioningFunctions[selectedModel](newValue, widthScaleValue);
      } else {
        verticalBeamPositioningFunctions[selectedModel](newValue);
      }
    }
  }}
/>

    <p>Vertical Beam position: {verticalBeamSliderValue}mm</p>
  </div>
)}
<button
  style={{
    backgroundColor: dimensionsLocked ? "#4CAF50" : "#2196F3",
    color: "white",
    padding: "8px 16px",
    border: "none",
    borderRadius: "4px",
    marginTop: "10px",
    cursor: "pointer",
  }}
  onClick={() => {
  setDimensionsLocked(true);

  
}}

>
  {dimensionsLocked ? "✅ Confirmed" : "Confirm Selection"}
</button>

<div style={{ marginTop: "20px" }}>
  <label htmlFor="actionDropdown">Draai Kiepraam Selectie .1:</label>
  <select
    id="actionDropdown"
    disabled={!dimensionsLocked}
    value={selectedOption}
    onChange={(e) => setSelectedOption(e.target.value)}
    style={{
      marginLeft: "10px",
      padding: "5px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      backgroundColor: dimensionsLocked ? "white" : "#f0f0f0",
      color: dimensionsLocked ? "black" : "#999",
    }}
  >
    <option value="">Vast raam</option>
    <option value="onder">Kiepraam, scharnier onder</option>
    <option value="links">Draai-kiep raam, scharnier links-onder</option>
    <option value="rechts">Draai-kiep raam, scharnier rechts-onder</option>
  </select>
</div>

{materialsLoaded && (
  <div className="glassControls">
    <p>Glass Type</p>
    <button id="glassOptions" onClick={() => applyGlassMaterial(0)}>Standaard glas</button>
    <button id="glassOptions" onClick={() => applyGlassMaterial(1)}>Dubbelzijdig gelaagd</button>
    <button id="glassOptions" onClick={() => applyGlassMaterial(2)}>Binnenzijde gelaagd</button>

    <p>type combinatie glass</p>
    <button id="glassOptions" onClick={() => ("Thin Glass")}>HR++</button>
<button id="glassOptions" onClick={() => ("Thick Glass")}>HR+++</button>
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
            title="ModuleFrame Color"
            colors={colorOptions}
            selected={selectedColor}
            onSelect={handleModuleFrameColorSelect}
          />
        ) : (
          <p>Loading materials...</p>
        )}

            {materialsLoaded ? (
          <ColorSelectorGroup
            title="HatchFrame Color"
            colors={colorOptions}
            selected={selectedColor}
            onSelect={handleHatchFrameColorSelect}
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
