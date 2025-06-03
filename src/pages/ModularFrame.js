import React, { useEffect, useRef, useState } from 'react';
import { initThree } from '../scripts';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import SliderControl from '../SliderControl';
import ColorSelectorGroup from '../ColorSelectorGroup';
import { useLocation } from 'react-router-dom';

function ModularFrame() {
  const mountRef = useRef(null);
 
  const [controller, setController] = useState(null);

  const [horizontalEnabled, setHorizontalEnabled] = useState(false);
  const [verticalEnabled, setVerticalEnabled] = useState(false);
  const location = useLocation();
  const [modelPath] = useState(`/models/${location.state?.model || 'Window_Frame.glb'}`);


  

  const navigate = useNavigate();

  const handleBack = () => {
  navigate('/');
  };

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

const [frameColor, setFrameColor] = useState(COLORS[0]);
const [insideColor, setInsideColor] = useState(COLORS[1]);


const [height, setHeight] = useState(1000); //sets start value
const [width, setWidth] = useState(1000);  //sets start value

const [ModuleHorizontal, setHorizontal] = useState(250); //sets start value
const [ModuleVertical, setVertical] = useState(250);   //sets start value



  useEffect(() => {
    if (mountRef.current) {
      const api = initThree(mountRef.current, modelPath);
      setController(api);
    }
  }, [modelPath]);
  useEffect(() => {
  if (controller) controller.setHeight(height / 1000); // mm to scale
}, [height, ]);

useEffect(() => {
  if (controller) controller.setWidth(width / 1000);
}, [width, ]);

useEffect(() => {
  if (controller) controller.setMaterialForZone('outside', frameColor.name);
}, [frameColor, ]);

useEffect(() => {
  if (controller) controller.setMaterialForZone('inside', insideColor.name);
}, [insideColor, ]);
useEffect(() => {
  if (controller) controller.setModularSizes(ModuleHorizontal / 1000, ModuleVertical / 1000);
}, [ModuleHorizontal, ModuleVertical ]);

useEffect(() => {
  if (controller) controller.setModularEnabled(horizontalEnabled, verticalEnabled);
}, [horizontalEnabled, verticalEnabled,]);
useEffect(() => {
  if (controller) controller.hideGUI();
}, [controller]);


  return (
    <div className="container">
      <nav className="sidebar">
        <button className="back-button" onClick={handleBack}>←</button>
        <h1>Modular Window</h1>
        <ul>
          
          <li>
  <SliderControl
    label="Height"
    min={1000}
    max={3000}
    value={height}
    onChange={setHeight}
  />
</li>
<li>
  <SliderControl
    label="Width"
    min={1000}
    max={4000}
    value={width}
    onChange={setWidth}
  />
</li>

       <li className="modular-block">
  <div className="toggle-wrapper">
    <SliderControl
      label="Horizontal Modulization"
      min={250}
      max={1200}
      value={ModuleHorizontal}
      onChange={setHorizontal}
    />
    <button
      className={`mode-toggle ${horizontalEnabled ? 'enabled' : ''}`}
      onClick={() => setHorizontalEnabled(!horizontalEnabled)}
    >
      {horizontalEnabled ? '✓' : ''}
    </button>
  </div>
</li>

<li className="modular-block">
  <div className="toggle-wrapper">
    <SliderControl
      label="Vertical Modulization"
      min={250}
      max={3800}
      value={ModuleVertical}
      onChange={setVertical}
    />
    <button
      className={`mode-toggle ${verticalEnabled ? 'enabled' : ''}`}
      onClick={() => setVerticalEnabled(!verticalEnabled)}
    >
      {verticalEnabled ? '✓' : ''}
    </button>
  </div>
</li>


          <li>
                <ColorSelectorGroup
                title="Frame Color"
                colors={COLORS}
                selected={frameColor}
                onSelect={setFrameColor}
                                        />
            </li>
            <li>
            <ColorSelectorGroup
                title="Inside Frame Color"
                colors={COLORS}
                selected={insideColor}
                onSelect={setInsideColor}
            />
            </li>
            <li>
            <ColorSelectorGroup
                title="ModularParts Color"
                colors={COLORS}
                selected={insideColor}
                onSelect={setInsideColor}
            />
            </li>
        </ul>
      </nav>

      <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {/* 3D scene renders here */}
      </main>
      

    </div>
  );
}

export default ModularFrame;
