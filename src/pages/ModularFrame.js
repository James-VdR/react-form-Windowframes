import React, { useEffect, useRef, useState } from 'react';
import { initThree } from '../scripts';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import SliderControl from '../SliderControl';
import ColorSelectorGroup from '../ColorSelectorGroup';
import { useLocation } from 'react-router-dom';

// Mapping color names
const MATERIAL_NAME_MAP = {
  'White': 'White',
  'Cream': 'Creme',
  'Ivory': 'Licht Ivoor',
  'WineRed': 'Wijnrood',
  'PineGreen': 'Dennengroen',
  'MonumentGreen': 'Monumentengroen',
  'BlueSteel': 'Staalblauw',
  'Golden Oak': 'Golden Oak',
  'Mahogany': 'Mahonie',
  'SilverGrey': 'Zilvergrijs',
  'BasaltGrey': 'Basaltgrijs',
  'QuartzGrey': 'Kwartsgrijs',
  'Anthracite': 'Antracietgrijs',
  'BlackGrey': 'Zwartgrijs',
  'Black': 'Zwart'
};

function ModularFrame() {
  const mountRef = useRef(null);
  const [controller, setController] = useState(null);

  const [horizontalEnabled, setHorizontalEnabled] = useState(false);
  const [verticalEnabled, setVerticalEnabled] = useState(false);
  const location = useLocation();

  const [modelPath] = useState(`/models/${location.state?.model || 'Window_Frame.glb'}`);

  const model = "ModularFrame"
 


  

  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const handleBack = () => navigate('/');

  const COLORS = [
    { name: 'White', ral: '9010', hex: '#f4f4f4' },
    { name: 'Cream', ral: '9001', hex: '#fdf4d3' },
    { name: 'Ivory', ral: '1015', hex: '#eae3c6' },
    { name: 'WineRed', ral: '3005', hex: '#5e1b22' },
    { name: 'PineGreen', ral: '6009', hex: '#1c3c1b' },
    { name: 'MonumentGreen', ral: '6005', hex: '#2f4538' },
    { name: 'BlueSteel', ral: '5011', hex: '#232c3f' },
    { name: 'Golden Oak', ral: '8003', hex: '#a75b1f' },
    { name: 'Mahogany', ral: '8016', hex: '#4c2f27' },
    { name: 'SilverGrey', ral: '7001', hex: '#c0c0c0' },
    { name: 'BasaltGrey', ral: '7012', hex: '#4e5754' },
    { name: 'QuartzGrey', ral: '7039', hex: '#6c6860' },
    { name: 'Anthracite', ral: '7016', hex: '#373f43' },
    { name: 'BlackGrey', ral: '7021', hex: '#2e3234' },
    { name: 'Black', ral: '9005', hex: '#0a0a0a' }
  ];

  const [modularColor, setModularColor] = useState(COLORS[0]);
  const [frameColor, setFrameColor] = useState(COLORS[0]);
  const [insideColor, setInsideColor] = useState(COLORS[1]);

  const [height, setHeight] = useState(1000);
  const [width, setWidth] = useState(1000);
  const [ModuleHorizontal, setHorizontal] = useState(600);
  const [ModuleVertical, setVertical] = useState(250);

  useEffect(() => {
    let isMounted = true;
    initThree(mountRef.current, modelPath).then(api => {
      if (isMounted) setController(api);
    });
    return () => { isMounted = false; };
  }, [modelPath]);

  useEffect(() => {
    if (controller) controller.setHeight(height / 1000);
  }, [controller, height]);

  useEffect(() => {
    if (controller) controller.setWidth(width / 1000);
  }, [controller, width]);

  useEffect(() => {
    if (controller && MATERIAL_NAME_MAP[frameColor.name]) {
      controller.setMaterialForZone('frame', MATERIAL_NAME_MAP[frameColor.name]);
    }
  }, [controller, frameColor]);

  useEffect(() => {
    if (controller && MATERIAL_NAME_MAP[insideColor.name]) {
      controller.setMaterialForZone('frameInside', MATERIAL_NAME_MAP[insideColor.name]);
    }
  }, [controller, insideColor]);

  useEffect(() => {
    if (controller && MATERIAL_NAME_MAP[modularColor.name]) {
      controller.setMaterialForZone('outside', MATERIAL_NAME_MAP[modularColor.name]);
    }
  }, [controller, modularColor]);

  useEffect(() => {
    if (controller) controller.setModularSizes(ModuleHorizontal / 1000, ModuleVertical / 1000);
  }, [controller, ModuleHorizontal, ModuleVertical]);

  useEffect(() => {
    if (controller) controller.setModularEnabled(horizontalEnabled, verticalEnabled);
  }, [controller, horizontalEnabled, verticalEnabled]);

  useEffect(() => {
    if (controller) controller.hideGUI();
  }, [controller]);

  const handleSubmit = async () => {
    const payload = {
      model,
      width, 
      height,
      frameColor: frameColor.name,
      insideColor: insideColor.name,
      modularColor: modularColor.name,
      horizontalEnabled,
      verticalEnabled,
      ModuleHorizontal,
      ModuleVertical,
    };
    console.log("Sending payload to Zapier:", payload);

     try {
  await fetch('https://hooks.zapier.com/hooks/catch/14955932/uy82dks/', {
  "mode":"no-cors",
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});


     
    // Since no-cors returns opaque responses, don't check status
    console.log('✅ Sent to Zapier (no-cors assumed success)');
  } catch (err) {
    console.error('❌ Zapier webhook error:', err);
  } finally {
    setSubmitted(true); // Disable further submissions
  }
};

  return (
    <div className="container">
      <nav className="sidebar">
        <button className="back-button" onClick={handleBack}>←</button>
        <h1>Modular Window</h1>

        <div className="sidebar-scroll">
          <ul>
            <li>
              <SliderControl label="Height" min={1000} max={3000} value={height} onChange={setHeight} />
            </li>
            <li>
              <SliderControl label="Width" min={1000} max={4000} value={width} onChange={setWidth} />
            </li>

            <li className="modular-block">
              <div className="toggle-wrapper">
                <SliderControl label="Horizontal Modulization" min={600} max={3800} value={ModuleHorizontal} onChange={setHorizontal} />
                <button className={`mode-toggle ${horizontalEnabled ? 'enabled' : ''}`} onClick={() => setHorizontalEnabled(!horizontalEnabled)}>
                  {horizontalEnabled ? '✓' : ''}
                </button>
              </div>
            </li>

            <li className="modular-block">
              <div className="toggle-wrapper">
                <SliderControl label="Vertical Modulization" min={250} max={1200} value={ModuleVertical} onChange={setVertical} />
                <button className={`mode-toggle ${verticalEnabled ? 'enabled' : ''}`} onClick={() => setVerticalEnabled(!verticalEnabled)}>
                  {verticalEnabled ? '✓' : ''}
                </button>
              </div>
            </li>

            <li>
              <ColorSelectorGroup title="Frame Color" colors={COLORS} selected={frameColor} onSelect={setFrameColor} />
            </li>
            <li>
              <ColorSelectorGroup title="Inside Frame Color" colors={COLORS} selected={insideColor} onSelect={setInsideColor} />
            </li>
            <li>
              <ColorSelectorGroup title="Modular Frame Color" colors={COLORS} selected={modularColor} onSelect={setModularColor} />
            </li>
          </ul>
<button
  className="submit-button"
  onClick={handleSubmit}
  disabled={submitted}
>
  {submitted ? 'Submitted' : 'Submit'}
</button>


        </div>
      </nav>

      <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {/* 3D Canvas */}
      </main>
    </div>
  );
}

export default ModularFrame;
