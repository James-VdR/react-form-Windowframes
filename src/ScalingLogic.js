import {model, horizontalParts, verticalParts} from './Scene.js'


//this is uniform scaling only
export function Scaling(sliderElement, onScaleChange) {
  sliderElement.addEventListener('input', (event) => {
    const scale = parseFloat(event.target.value) / 1000;
    
    if (model) {
      
      model.scale.set(scale, scale, scale);
      //frameModel(camera, controls, model); //this was for centering the camera, but keeping it in makes any change in scale unnoticable :(

      if(typeof onScaleChange === 'function'){
        onScaleChange(scale);
      }
    }
  });
}

//sketch for height and width scaling
export function heightScaling(heightSliderElement, onScaleChange) {
  heightSliderElement.addEventListener('input', (event) => {
    const scaleZ = parseFloat(event.target.value) / 1000;
    verticalParts.forEach(mesh => mesh.scale.z = scaleZ);

       const topFrame = horizontalParts.find(mesh => mesh.name.toLowerCase() === "top_frame");
    if (topFrame) {
      // Example logic: move top_frame along X based on scale
      topFrame.position.y = scaleZ - 2.5;  // Adjust 500 based on your scene units
    }

    if (typeof onScaleChange === 'function') {
      onScaleChange(scaleZ);
    }
  });
}

export function widthScaling(widthSliderElement, onScaleChange) {
  widthSliderElement.addEventListener('input', (event) => {
    const scaleX = parseFloat(event.target.value) / 1000;
    horizontalParts.forEach(mesh => mesh.scale.z = scaleX);

    const rightframe = verticalParts.find(mesh => mesh.name.toLowerCase() === "right_frame");
    if (rightframe) {
      rightframe.position.x = scaleX  - 2.5 ;
    }

    if (typeof onScaleChange === 'function') {
      onScaleChange(scaleX);
    }
  });
}