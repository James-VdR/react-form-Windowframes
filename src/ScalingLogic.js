import { model, horizontalParts, verticalParts,glassParts,moduleParts } from "./Scene.js";

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

    glassParts.forEach((mesh) => {
  mesh.scale.y = scaleY * 1.1;
  mesh.position.y = (-0.15 * scaleY) / 2; // Adjust "1.0" to your actual model's glass height
});



    if (typeof onScaleChange === "function") {
      onScaleChange(newHeight);
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
      rightFrame.position.x = normalizedValue * 1.5 ;

      console.log(`Right frame X position: ${rightFrame.position.x}`);
    }

    glassParts.forEach((mesh) => {
    mesh.scale.z = scaleZ;
  });


    if (typeof onScaleChange === "function") {
      onScaleChange(newWidth);
    }
  });
}


export function horizontalBeamPositioning(sliderElement, onPositionChange) {
  sliderElement.addEventListener("input", (event) => {
    const sliderValue = parseFloat(event.target.value); // 250 - 1750
    const minMM = 250;
    const maxMM = 1750;
    const minY = -0.5;
    const maxY = 1.0;

    // Normalize to 0-1
    const normalized = (sliderValue - minMM) / (maxMM - minMM);
    // Map to -0.5 to 1.0
    const positionY = minY + normalized * (maxY - minY);

    const horizBeam = moduleParts.find(
      (mesh) => mesh.name.toLowerCase() === "horiz_beam1"
    );

    if (horizBeam) {
      horizBeam.position.y = positionY;
      console.log(`Beam Y position: ${positionY}`);
    }

    if (typeof onPositionChange === "function") {
      onPositionChange(sliderValue); // Pass raw mm value to update UI
    }
  });
}
