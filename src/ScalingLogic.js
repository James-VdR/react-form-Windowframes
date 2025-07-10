import { model, horizontalParts, verticalParts,glassParts,moduleParts } from "./Scene.js";

let previousVerticalSliderValue = 500; // Default starting point, same as slider default


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

    //Dynamically scale top_mid1, top_mid2, top_mid3 if they exist
    const dynamicMidParts = moduleParts.filter((mesh) => {
      const name = mesh.name.toLowerCase();
      return name === "bottom_mid1" || name === "bottom_mid2" || name === "bottom_mid3";
    });

    dynamicMidParts.forEach((part) => {
      part.scale.y = scaleY * 2;
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

export function model2VerticalBeamPositioning(sliderElement, onPositionChange) {
  sliderElement.addEventListener("input", (event) => {
    const sliderValue = parseFloat(event.target.value); // 250 - 750
    const minMM = 250;
    const maxMM = 750;
    const minX = -0.25;
    const maxX = 0.25;

    const normalized = (sliderValue - minMM) / (maxMM - minMM);
    const mappedX = minX + normalized * (maxX - minX);

    // Handle mirrored parts
    const mid1Parts = moduleParts.filter((mesh) => {
      const name = mesh.name.toLowerCase();
      return (
        name === "top_mid1" ||
        name === "bottom_mid1" 
      );
    });

    const mid2Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid2" || name === "bottom_mid2";
    });

    mid1Parts.forEach((part) => {
      part.position.x = mappedX;
    });

    mid2Parts.forEach((part) => {
    part.position.x = -mappedX;
    });

    if (typeof onPositionChange === "function") {
      onPositionChange(sliderValue);
    }

    console.log(`Mid parts moved to X: ${mappedX} & ${-mappedX}`);
  });
}

export function model2VerticalBeamPositioningManual(sliderValue, currentWidthMM = 1000) {
  const minMM = 400;
  const maxMM = 600;
  const minX = -0.10;
  const maxX = 0.10;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const mappedX = minX + normalized * (maxX - minX);

  const mid1Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid1" || name === "bottom_mid1";
  });

  const mid2Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid2" || name === "bottom_mid2";
  });

  mid1Parts.forEach((part) => {
    part.position.x = mappedX;
  });

  mid2Parts.forEach((part) => {
    part.position.x = -mappedX;
  });

  // Existing horiz_beam1 logic
  const horizBar1 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam1");

  if (horizBar1) {
    const baseScaleX = 1.0;
    const dynamicScaleX = baseScaleX + mappedX * 2;
    horizBar1.scale.z = dynamicScaleX;

    console.log(`horiz_bar1 scale.z updated to: ${dynamicScaleX}`);
  }

  // New horiz_beam2 logic (assuming horiz_beam2 is correct)
 const horizBeam2 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam2");

if (horizBeam2) {
  const widthGain = currentWidthMM - 1000; // width-based effect (keep this)
  const widthScale = 1.0 + (widthGain * 0.002);
  const widthOffset = 0 - (widthGain * 0.001);

  // NEW: vertical beam influence
  const verticalBeamOffsetMM = sliderValue - 500; // relative to center
  const verticalOffset = verticalBeamOffsetMM * 0.002; // position shift
  const verticalScaleReduction = verticalBeamOffsetMM * 0.002; // scale reduction

  // Final values
  horizBeam2.scale.z = widthScale - verticalScaleReduction;
  horizBeam2.position.x = widthOffset + verticalOffset;

  console.log(`horiz_beam2 scale.z = ${horizBeam2.scale.z}, position.x = ${horizBeam2.position.x}`);
}


  console.log(`Mid parts moved to X: ${mappedX} & ${-mappedX}`);
}



export function model4VerticalBeamPositioning(sliderElement, onPositionChange) {
  sliderElement.addEventListener("input", (event) => {
    const sliderValue = parseFloat(event.target.value); // 250 - 750
    const minMM = 250;
    const maxMM = 750;
    const minX = -0.25;
    const maxX = 0.25;

    const normalized = (sliderValue - minMM) / (maxMM - minMM);
    const mappedX = minX + normalized * (maxX - minX);

    // Handle mirrored parts
    const mid1Parts = moduleParts.filter((mesh) => {
      const name = mesh.name.toLowerCase();
      return (
        name === "top_mid1" ||
        name === "bottom_mid1" 
      );
    });

    const mid3Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid3" || name === "bottom_mid3";
    });

    mid1Parts.forEach((part) => {
      part.position.x = mappedX;
    });

    mid3Parts.forEach((part) => {
    part.position.x = -mappedX;
    });

    if (typeof onPositionChange === "function") {
      onPositionChange(sliderValue);
    }

    console.log(`Mid parts moved to X: ${mappedX} & ${-mappedX}`);
  });
}

export function model4VerticalBeamPositioningManual(sliderValue) {
  const minMM = 250;
  const maxMM = 750;
  const minX = -0.25;
  const maxX = 0.25;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const mappedX = minX + normalized * (maxX - minX);

  const mid1Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return (
      name === "top_mid1" ||
      name === "bottom_mid1"
      
    );
  });

  const mid3Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid3" || name === "bottom_mid3";
  });

  mid1Parts.forEach((part) => {
    part.position.x = mappedX;
  });

  mid3Parts.forEach((part) => {
    part.position.x = -mappedX;
  });

  console.log(`Mid parts moved to X: ${mappedX} & ${-mappedX}`);
}


export function modelVerticalBeamPositioning(sliderElement, onPositionChange) {
  sliderElement.addEventListener("input", (event) => {
    const sliderValue = parseFloat(event.target.value); // 250 - 750
    const minMM = 250;
    const maxMM = 750;
    const minX = -0.25;
    const maxX = 0.25;

    const normalized = (sliderValue - minMM) / (maxMM - minMM);
    const mappedX = minX + normalized * (maxX - minX);

    // Handle mirrored parts
    const mid1Parts = moduleParts.filter((mesh) => {
      const name = mesh.name.toLowerCase();
      return (
        name === "top_mid1" ||
        name === "bottom_mid1" 
      );
    });

    const mid2Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid2" || name === "bottom_mid2";
    });

    mid1Parts.forEach((part) => {
      part.position.x = mappedX;
    });

    mid2Parts.forEach((part) => {
    part.position.x = -mappedX;
    });

    if (typeof onPositionChange === "function") {
      onPositionChange(sliderValue);
    }

    console.log(`Mid parts moved to X: ${mappedX} & ${-mappedX}`);
  });
}

export function model3_1VerticalBeamPositioningManual(sliderValue) {
  const minMM = 250;
  const maxMM = 750;
  const minX = -0.10;
  const maxX = 0.10;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const mappedX = minX + normalized * (maxX - minX);

  const mid1Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid1" || name === "bottom_mid1";
  });

  const mid2Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid2" || name === "bottom_mid2";
  });

  mid1Parts.forEach((part) => {
    part.position.x = mappedX;
  });

  mid2Parts.forEach((part) => {
    if (part.name.toLowerCase() === "top_mid2") {
      part.position.x = -mappedX;
    } else if (part.name.toLowerCase() === "bottom_mid2") {
      // Custom logic: shift based on width
      const currentWidth = window?.currentModelWidth || 1500;
      const widthOffset = (currentWidth - 1500) * 0.001;

      // If you want to keep it additive to mappedX:
      part.position.x = -mappedX + widthOffset;

      console.log(`bottom_mid2 X: -mappedX (${(-mappedX).toFixed(3)}) + widthOffset (${widthOffset.toFixed(3)}) = ${part.position.x.toFixed(3)}`);
    }
  });

  console.log(`Mid parts moved: top_mid2 = ${-mappedX}, bottom_mid2 = adjusted`);
}

export function model3_2VerticalBeamPositioningManual(sliderValue , currentWidthMM = 1000) {
  const minMM = 250;
  const maxMM = 750;
  const minX = -0.10;
  const maxX = 0.10;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const mappedX = minX + normalized * (maxX - minX);

  const currentWidth = window?.currentModelWidth || 1500;
  const widthOffset = (currentWidth - 1500) * 0.001;

  // Move mid1 parts normally
  const mid1Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid1" || name === "bottom_mid1";
  });

  mid1Parts.forEach((part) => {
    part.position.x = mappedX;
  });

  // Move mid2 parts — apply custom logic for bottom_mid2
  const mid2Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid2" || name === "bottom_mid2";
  });

  mid2Parts.forEach((part) => {
    const name = part.name.toLowerCase();
    if (name === "top_mid2") {
      part.position.x = -mappedX;
    } else if (name === "bottom_mid2") {
      part.position.x = -mappedX + widthOffset;
      console.log(`bottom_mid2 X: -mappedX (${(-mappedX).toFixed(3)}) + widthOffset (${widthOffset.toFixed(3)}) = ${part.position.x.toFixed(3)}`);
    }
  });

  const horizBar1 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam1");

  if (horizBar1) {
    const baseScaleX = 1.0;
    const dynamicScaleX = baseScaleX + mappedX * 2;
    horizBar1.scale.z = dynamicScaleX;

    console.log(`horiz_bar1 scale.z updated to: ${dynamicScaleX}`);
  }

const horizBeam3 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam3");

if (horizBeam3) {
  const widthGain = currentWidth - 1500;
  const widthOffset = widthGain * 0.001; // keep width-based shift

  const verticalBeamOffsetMM = sliderValue - 500;

  //  Reverse both scale and position direction
  const verticalScaleGain = verticalBeamOffsetMM * 0.0008;
  const verticalPositionOffset = -verticalBeamOffsetMM * 0.0012;

  const baseScale = 1.0;
  horizBeam3.scale.z = baseScale + verticalScaleGain; // grows as slider ↑
  horizBeam3.position.x = widthOffset + verticalPositionOffset; // moves left as slider ↑

  console.log(
    `horiz_beam3 scale.z = ${horizBeam3.scale.z.toFixed(3)}, position.x = ${horizBeam3.position.x.toFixed(3)}`
  );
}





  console.log(`Mid parts moved: mappedX = ${mappedX.toFixed(3)}, -mappedX = ${(-mappedX).toFixed(3)}`);
}



export function model3_3VerticalBeamPositioningManual(sliderValue, currentWidthMM = 1000) {
 const minMM = 250;
  const maxMM = 750;
  const minX = -0.10;
  const maxX = 0.10;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const mappedX = minX + normalized * (maxX - minX);

  const currentWidth = window?.currentModelWidth || 1500;
  const widthOffset = (currentWidth - 1500) * 0.001;

  // Move mid1 parts normally
  const mid1Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid1" || name === "bottom_mid1";
  });

  mid1Parts.forEach((part) => {
    part.position.x = mappedX;
  });

  // Move mid2 parts — apply custom logic for bottom_mid2
  const mid2Parts = moduleParts.filter((mesh) => {
    const name = mesh.name.toLowerCase();
    return name === "top_mid2" || name === "bottom_mid2";
  });

  mid2Parts.forEach((part) => {
    const name = part.name.toLowerCase();
    if (name === "top_mid2") {
      part.position.x = -mappedX;
    } else if (name === "bottom_mid2") {
      part.position.x = -mappedX + widthOffset;
      console.log(`bottom_mid2 X: -mappedX (${(-mappedX).toFixed(3)}) + widthOffset (${widthOffset.toFixed(3)}) = ${part.position.x.toFixed(3)}`);
    }
  });

  const horizBar1 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam1");

  if (horizBar1) {
    const baseScaleX = 1.0;
    const dynamicScaleX = baseScaleX + mappedX * 2;
    horizBar1.scale.z = dynamicScaleX;

    console.log(`horiz_bar1 scale.z updated to: ${dynamicScaleX}`);
  }
const horizBeam2 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam2");

if (horizBeam2) {
  const widthGain = currentWidth - 1500;
  const widthScale = 1.0 + (widthGain * 0.002);

  // To cancel center-origin scaling visually, shift position in opposite direction
  const positionOffset = -widthGain * 0.001; // shift left when width increases, right when decreases

  horizBeam2.scale.z = widthScale;
  horizBeam2.position.x = positionOffset;

  console.log(
    `horiz_beam2 scale.z = ${horizBeam2.scale.z.toFixed(3)}, position.x = ${horizBeam2.position.x.toFixed(3)}`
  );
}



const horizBeam3 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam3");

if (horizBeam3) {
  const widthGain = currentWidth - 1500;
  const widthOffset = widthGain * 0.001; // keep width-based shift

  const verticalBeamOffsetMM = sliderValue - 500;

  //  Reverse both scale and position direction
  const verticalScaleGain = verticalBeamOffsetMM * 0.0008;
  const verticalPositionOffset = -verticalBeamOffsetMM * 0.0012;

  const baseScale = 1.0;
  horizBeam3.scale.z = baseScale + verticalScaleGain; // grows as slider ↑
  horizBeam3.position.x = widthOffset + verticalPositionOffset; // moves left as slider ↑

  console.log(
    `horiz_beam3 scale.z = ${horizBeam3.scale.z.toFixed(3)}, position.x = ${horizBeam3.position.x.toFixed(3)}`
  );
}





  console.log(`Mid parts moved: mappedX = ${mappedX.toFixed(3)}, -mappedX = ${(-mappedX).toFixed(3)}`);
}

export function model_1_variant2WidthScaling(widthSliderElement, applyBeamScaling, onScaleChange) {
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
      const normalizedValue = (newWidth - minWidth) / (maxWidth - minWidth);
      rightFrame.position.x = normalizedValue * 1.5;
    }

    glassParts.forEach((mesh) => {
      mesh.scale.z = scaleZ;
    });


    if (applyBeamScaling) {
      const horizBeam1 = moduleParts.find(
        (mesh) => mesh.name.toLowerCase() === "horiz_beam1"
      );

      if (horizBeam1) {
        const minScale = 1.0;
        const maxScale = 4.0;
        const normalizedValue = (newWidth - minWidth) / (maxWidth - minWidth);
        horizBeam1.scale.z = minScale + normalizedValue * (maxScale - minScale);
        console.log(`horiz_beam1 Z scale: ${horizBeam1.scale.z}`);
      }
    }

    if (typeof onScaleChange === "function") {
      onScaleChange(newWidth);
    }
  });
}
