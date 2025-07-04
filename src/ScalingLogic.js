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

export function model2VerticalBeamPositioningManual(sliderValue) {
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

  
  const horizBar1 = moduleParts.find((mesh) => mesh.name.toLowerCase() === "horiz_beam1");

  if (horizBar1) {
    const baseScaleX = 1.0; // You can adjust this base scale if needed
    const dynamicScaleX = baseScaleX + mappedX * 2; // Multiply to make the effect more noticeable if needed
    horizBar1.scale.z = dynamicScaleX;

    console.log(`horiz_bar1 scale.x updated to: ${dynamicScaleX}`);
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

export function modelVerticalBeamPositioningManual(sliderValue) {
  const minMM = 250;
  const maxMM = 750;
  const minX = -0.10;
  const maxX = 0.10;

  const normalized = (sliderValue - minMM) / (maxMM - minMM);
  const mappedX = minX + normalized * (maxX - minX);

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

  console.log(`Mid parts moved to X: ${mappedX} & ${-mappedX}`);
}

