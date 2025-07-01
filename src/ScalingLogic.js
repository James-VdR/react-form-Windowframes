import { model, horizontalParts, verticalParts } from "./Scene.js";

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

let originalTopFrameY = null;

export function heightScaling(heightSliderElement, onScaleChange) {
  heightSliderElement.addEventListener("input", (event) => {
    const newHeight = parseFloat(event.target.value);
    const baseHeight = 1000;
    const scaleY = newHeight / baseHeight;

    verticalParts.forEach((mesh) => (mesh.scale.y = scaleY));

    const topFrame = horizontalParts.find(
      (mesh) => mesh.name.toLowerCase() === "top_frame"
    );
    if (topFrame) {
      if (originalTopFrameY === null) {
        originalTopFrameY = topFrame.position.y;
      }

      const scaleDifference = (newHeight - baseHeight) / 2 / 1000;
      topFrame.position.y = originalTopFrameY + scaleDifference;
    }

    if (typeof onScaleChange === "function") {
      onScaleChange(newHeight);
    }
  });
}

export function widthScaling(widthSliderElement, onScaleChange) {
  widthSliderElement.addEventListener("input", (event) => {
    const newWidth = parseFloat(event.target.value);
    const baseWidth = 2000;
    const scaleZ = newWidth / baseWidth;

    horizontalParts.forEach((mesh) => (mesh.scale.z = scaleZ));

    const rightframe = verticalParts.find(
      (mesh) => mesh.name.toLowerCase() === "right_frame"
    );
    if (rightframe) {
      rightframe.position.z = 0;
      console.log(rightframe.position.x);
    }

    if (typeof onScaleChange === "function") {
      onScaleChange(scaleZ);
    }
  });
}
