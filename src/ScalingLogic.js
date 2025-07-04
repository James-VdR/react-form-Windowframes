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





export function heightScaling(heightSliderElement, onScaleChange, onBeamMaxChange) {
  heightSliderElement.addEventListener("input", (event) => {
    const newHeight = parseFloat(event.target.value);
    const minHeight = 1000;
    const baseHeight = 2000;
    const baseBeamMax = 750;

    const scaleY = newHeight / baseHeight;

    verticalParts.forEach((mesh) => (mesh.scale.y = scaleY));

    const topFrame = horizontalParts.find(
      (mesh) => mesh.name.toLowerCase() === "top_frame"
    );

    if (topFrame) {
      const normalizedValue = (newHeight - minHeight) / (baseHeight - minHeight);
      topFrame.position.y = normalizedValue;
    }

    glassParts.forEach((mesh) => {
      mesh.scale.y = scaleY * 1.1;
      mesh.position.y = (-0.15 * scaleY) / 2;
    });

    if (typeof onScaleChange === "function") {
      onScaleChange(newHeight);
    }

    if (typeof onBeamMaxChange === "function") {
      const dynamicBeamMax = baseBeamMax + (newHeight - minHeight);
      onBeamMaxChange(dynamicBeamMax);
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

    const normalized = (sliderValue - minMM) / (maxMM - minMM);
    const positionY = minY + normalized * (maxY - minY);

    const horizBeams = moduleParts.filter((mesh) => {
      const name = mesh.name.toLowerCase();
      return (
        name === "horiz_beam1" ||
        name === "horiz_beam2" ||
        name === "horiz_beam3" ||
        name === "horiz_beam4"
      );
    });

    horizBeams.forEach((beam) => {
      beam.position.y = positionY;
    });

    console.log(`Beam(s) Y position updated to: ${positionY}`);

    if (typeof onPositionChange === "function") {
      onPositionChange(sliderValue);
    }
  });
}

export function horizontalBeamPositioningManual(sliderValue) {
  const minMM = 250;
  const maxMM = 1750;
  const minY = -0.5;
  const maxY = 1.0;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const positionY = minY + normalized * (maxY - minY);

  const horizBeams = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return (
      name === "horiz_beam1" ||
      name === "horiz_beam2" ||
      name === "horiz_beam3" ||
      name === "horiz_beam4"
    );
  });

  horizBeams.forEach((beam) => {
    beam.position.y = positionY;
  });

  console.log(`Beam(s) Y position updated to: ${positionY}`);
}
