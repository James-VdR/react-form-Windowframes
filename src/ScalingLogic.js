

// instead we export is as a function so it can be called after the scene is loaded. window.loadedModel is global in Scene and we use it in here to scale the model.

export function Scaling(sliderElement) {
  sliderElement.addEventListener('input', (event) => {
    const scale = parseFloat(event.target.value) / 1000;
    if (window.loadedModel) {
      window.loadedModel.scale.set(scale, scale, scale);
    }
  });
}
