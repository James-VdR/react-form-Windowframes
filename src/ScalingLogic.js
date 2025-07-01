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

let originalTopFrameY = null;
let originalScaleZ = null;

export function heightScaling(heightSliderElement, onScaleChange) {
  heightSliderElement.addEventListener('input', (event) => {
    const scaleZ = parseFloat(event.target.value) / 1000;

    verticalParts.forEach(mesh => mesh.scale.z = scaleZ);

    const topFrame = horizontalParts.find(mesh => mesh.name.toLowerCase() === "top_frame");
    if (topFrame) {
      if (originalTopFrameY === null) {
        originalTopFrameY = topFrame.position.y;
      }
      if (originalScaleZ === null) {
        originalScaleZ = scaleZ;
      }

      const scaleDifference = scaleZ - originalScaleZ;
      topFrame.position.y = originalTopFrameY + scaleDifference * 2.0;
    }

    if (typeof onScaleChange === 'function') {
      onScaleChange(scaleZ);
    }
  });
}

let originalRightFrameX = null;
let originalScaleX = null;

export function widthScaling(widthSliderElement, onScaleChange) {
  widthSliderElement.addEventListener('input', (event) => {
    const scaleX = parseFloat(event.target.value) / 1000;
    
    horizontalParts.forEach(mesh => mesh.scale.z = scaleX);

    const rightFrame = verticalParts.find(mesh => mesh.name.toLowerCase() === "right_frame");
    if (rightFrame) {
      if (originalRightFrameX === null) {
        originalRightFrameX = rightFrame.position.x;
      }
      if (originalScaleX === null) {
        originalScaleX = scaleX;
      }

      const scaleDifference = scaleX - originalScaleX;
      rightFrame.position.x = originalRightFrameX + scaleDifference * 2.0;
      console.log(rightFrame.position.x);
    }

    if (typeof onScaleChange === 'function') {
      onScaleChange(scaleX);
    }
  });
}
