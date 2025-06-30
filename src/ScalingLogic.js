import {camera, controls, model, frameModel, horizontalParts, verticalParts} from './Scene.js'
import { groupFrameParts } from './Scene.js';

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
    const scaleX = parseFloat(event.target.value) / 1000;
    verticalParts.forEach(mesh => mesh.scale.z = scaleX);

    if (typeof onScaleChange === 'function') {
      onScaleChange(scaleX);
    }
  });
}

export function widthScaling(widthSliderElement, onScaleChange) {
  widthSliderElement.addEventListener('input', (event) => {
    const scaleX = parseFloat(event.target.value) / 1000;
    horizontalParts.forEach(mesh => mesh.scale.z = scaleX);

    if (typeof onScaleChange === 'function') {
      onScaleChange(scaleX);
    }
  });
}