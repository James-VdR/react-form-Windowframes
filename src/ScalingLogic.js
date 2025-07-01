import { model, horizontalParts, verticalParts } from "./Scene.js";

//this is uniform scaling only
export function Scaling(sliderElement, onScaleChange) {
  sliderElement.addEventListener("input", (event) => {
    const scale = parseFloat(event.target.value) / 1000;

    if (model) {
      model.scale.set(scale, scale, scale);
      //frameModel(camera, controls, model); //this was for centering the camera, but keeping it in makes any change in scale unnoticable :(
      if (typeof onScaleChange === "function") {
        onScaleChange(scale);
      }
    }
  });
}





export function heightScaling(heightSliderElement, onScaleChange) {
  heightSliderElement.addEventListener("input", (event) => {
    const newHeight = parseFloat(event.target.value);
    const minHeight = 1000;
    const maxHeight = 2000;
    const baseHeight = 2000;
    
    const scaleY = newHeight / baseHeight;

    verticalParts.forEach((mesh) => (mesh.scale.y = scaleY));

    const topFrame = horizontalParts.find(
      (mesh) => mesh.name.toLowerCase() === "top_frame"
    );
    
    if (topFrame) {
      // Normalize slider value between 0 and 1
      const normalizedValue = (newHeight - minHeight) / (maxHeight - minHeight);
      topFrame.position.y = normalizedValue;

      console.log(`Top frame Y position: ${topFrame.position.y}`);
    }

    if (typeof onScaleChange === "function") {
      onScaleChange(scaleY);
    }
  });
}


export function widthScaling(widthSliderElement, onScaleChange) {
  widthSliderElement.addEventListener("input", (event) => {
    const newWidth = parseFloat(event.target.value);
    const minWidth = 500;
    const maxWidth = 2000;
    const baseWidth = 2000;
    
    const scaleZ = newWidth / baseWidth;

    horizontalParts.forEach((mesh) => (mesh.scale.z = scaleZ));

    const rightFrame = verticalParts.find(
      (mesh) => mesh.name.toLowerCase() === "right_frame"
    );

    if (rightFrame) {
      // Normalize slider value between 0 and 1
      const normalizedValue = (newWidth - minWidth) / (maxWidth - minWidth);
      // Map to range 0 to 1.5
      rightFrame.position.x = normalizedValue * 1.5;

      console.log(`Right frame X position: ${rightFrame.position.x}`);
    }

    if (typeof onScaleChange === "function") {
      onScaleChange(scaleZ);
    }
  });
}

