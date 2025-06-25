import  "./models/debug_window.glb";

const model = "debug_window.glb";


const scaleSlider = document.getElementById('scaleSlider');

scaleSlider.addEventListener('input' ,(event) => {
    const scale = parseFloat(event.target.value);
    if('debug_window.glb'){
        model.scale.set(scale, scale, scale);
    }
})