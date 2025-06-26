import {camera, controls, model, frameModel} from './Scene.js'


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
export function heightScaling(heightSliderElement, onScaleChange, verticalGroup){
  heightSliderElement.addEventListener('input', (event) => {
    const heightScale = parseFloat(event.target.value) / 1000;

    if(verticalGroup){
      verticalGroup.scale.y = heightScale;

      console.log(heightScale);

      if(typeof onScaleChange === 'function'){
        onScaleChange(heightScale);
      }
    }
  })
}

export function widthScaling(widthSliderElement, onScaleChange, horizontalGroup){
  widthSliderElement.addEventListener('input', (event) => {
    const widthScale = parseFloat(event.target.value) / 1000;

    if(horizontalGroup){
      horizontalGroup.scale.x = widthScale;

      if(typeof onScaleChange === 'function'){
        onScaleChange(widthScale);
      }
      console.log(widthScale);
    }
  })
}