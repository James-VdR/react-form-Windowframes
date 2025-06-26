import {camera, controls, model, frameModel} from './Scene.js'


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
