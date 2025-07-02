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
  verticalParts,
  horizontalParts,
  registerOnModelReady,
  applyMaterialsToInsideFrame,
} from "./Scene";
import { heightScaling, widthScaling } from "./ScalingLogic";
import { applyModel1Scaling } from "./model_1.js";
import { applyModel4Scaling } from "./model_4.js";

function App() {

  const mountRef = useRef(null);
  const heightSliderRef = useRef();
  const widthSliderRef = useRef();

  const [heightScaleValue, setHeightScaleValue] = useState(100);
  const [widthScaleValue, setWidthScaleValue] = useState(50);

  const [materialsLoaded, setMaterialsLoaded] = useState(false);
  const [colorOptions, setColorOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);

  const [selectedModel, setSelectedModel] = useState(null);

   /*useEffect(() => {
    if (!selectedModel) return;

    switch (selectedModel) {
      case "model_1":
        import("./model_1.js").then((module) => {
          module.applyModel1Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 500;
          setHeightScaleValue(1000);
          setWidthScaleValue(500);
        });
        break;
      case "model_2":
        import("./model_2.js").then((module) => {
          module.applyModel2Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 1000;
          setHeightScaleValue(1000);
          setWidthScaleValue(1000);
        });
        break;
      case "model_3":
        import("./model_3.js").then((module) => {
          module.applyModel3Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 1500;
          setHeightScaleValue(1000);
          setWidthScaleValue(1500);
        });
        break;
      case "model_4":
        import("./model_4.js").then((module) => {
          module.applyModel4Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 2000;
          setHeightScaleValue(1000);
          setWidthScaleValue(2000);
        });
        break;
      default:
        break;
    }
  }, [selectedModel]); */

  // Load material library ONCE when component mounts
  useEffect(() => {
    loadMaterialLibrary("/models/Materials.glb", () => {
      const options = getMaterialColorOptions();
      setColorOptions(options);
      setMaterialsLoaded(true);
    });
  }, []);

  // Initialize Three.js scene ONCE when component mounts
  /*useEffect(() => {
    if (mountRef.current) {
      initThree(mountRef.current);
    }

    registerOnModelReady(() => {
      if (heightSliderRef.current) {
        heightScaling(
          heightSliderRef.current,
          setHeightScaleValue,
          verticalParts
        );
      }
      if (widthSliderRef.current) {
        widthScaling(
          widthSliderRef.current,
          setWidthScaleValue,
          horizontalParts
        );
      }
    });
  }, []); // Empty dependency array prevents re-runs*/
  
useEffect(() => {
  if (!selectedModel || !mountRef.current) return;

  initThree(mountRef.current);

  registerOnModelReady(() => {
    switch (selectedModel) {
      case "model_1":
        import("./model_1.js").then((module) => {
          module.applyModel1Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 500;
          setHeightScaleValue(1000);
          setWidthScaleValue(500);
        });
        break;
      case "model_2":
        import("./model_2.js").then((module) => {
          module.applyModel2Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 1000;
          setHeightScaleValue(1000);
          setWidthScaleValue(1000);
        });
        break;
      case "model_3":
        import("./model_3.js").then((module) => {
          module.applyModel3Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 1500;
          setHeightScaleValue(1000);
          setWidthScaleValue(1500);
        });
        break;
      case "model_4":
        import("./model_4.js").then((module) => {
          module.applyModel4Scaling();
          resetMaterials();
          if (heightSliderRef.current) heightSliderRef.current.value = 1000;
          if (widthSliderRef.current) widthSliderRef.current.value = 2000;
          setHeightScaleValue(1000);
          setWidthScaleValue(2000);
        });
        break;
      default:
        break;
    }

    // Hook up sliders
    if (heightSliderRef.current) {
      heightScaling(
        heightSliderRef.current,
        setHeightScaleValue,
        verticalParts
      );
    }
    if (widthSliderRef.current) {
      widthScaling(
        widthSliderRef.current,
        setWidthScaleValue,
        horizontalParts
      );
    }
  });
}, [selectedModel]);

  // Selection page JSX
  if (!selectedModel) {
    return (
      <div className="container-class">
        <h1>Select a Model</h1>
        <div className="model-container" onClick={() => setSelectedModel("model_1")}>
          Model A
        </div>
        <div className="model-container" onClick={() => setSelectedModel("model_2")}>
          Model B
        </div>
        <div className="model-container" onClick={() => setSelectedModel("model_3")}>
          Model C
        </div>
        <div className="model-container" onClick={() => setSelectedModel("model_4")}>
          Model D
        </div>
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

  return (
    <div className="container">
      <div className="sidebar">
        <img src={logo} alt="Logo" className="bottom-image" />
        <h1>{selectedModel.replace("_", " ").toUpperCase()}</h1>
        <button onClick={() => setSelectedModel(null)}>Back to selection</button>
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

        <button
          onClick={() => {
            import("./model_1.js").then((module) => {
              module.applyModel1Scaling();
              resetMaterials();

              if (heightSliderRef.current) {
                heightSliderRef.current.value = 1000;
              }
              if (widthSliderRef.current) {
                widthSliderRef.current.value = 500;
              }
              setHeightScaleValue(1000);
              setWidthScaleValue(500);
            });
          }}
        >
          Load Model 1
        </button>

        <button
          onClick={() => {
            import("./model_2.js").then((module) => {
              module.applyModel2Scaling();
              resetMaterials();

              if (heightSliderRef.current) {
                heightSliderRef.current.value = 1000;
              }
              if (widthSliderRef.current) {
                widthSliderRef.current.value = 1000;
              }
              setHeightScaleValue(1000);
              setWidthScaleValue(1000);
            });
          }}
        >
          Load Model 2
        </button>

        <button
          onClick={() => {
            import("./model_3.js").then((module) => {
              module.applyModel3Scaling();
              resetMaterials();

              if (heightSliderRef.current) {
                heightSliderRef.current.value = 1000;
              }
              if (widthSliderRef.current) {
                widthSliderRef.current.value = 1500;
              }
              setHeightScaleValue(1000);
              setWidthScaleValue(1500);
            });
          }}
        >
          Load Model 3
        </button>

        <button
          onClick={() => {
            import("./model_4.js").then((module) => {
              module.applyModel4Scaling();
              resetMaterials();

              if (heightSliderRef.current) {
                heightSliderRef.current.value = 1000;
              }
              if (widthSliderRef.current) {
                widthSliderRef.current.value = 2000;
              }
              setHeightScaleValue(1000);
              setWidthScaleValue(2000);
            });
          }}
        >
          {" "}
          Load Model 4
        </button>

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
