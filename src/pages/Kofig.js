import React, { useEffect, useRef, useState } from 'react';
import { initThree } from '../scripts';
import '../Kofig.css';
import { useNavigate } from 'react-router-dom';
import SliderControl from '../SliderControl';
import ColorSelectorGroup from '../ColorSelectorGroup';


// color fixing
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


function Kofig() {
  const mountRef = useRef(null);
 
  const [controller, setController] = useState(null);

 
  
  const [modelPath] = useState('/models/Window_Frame_Kofig.glb');

  const [modularLeftBar, setModularLeftBar] = useState(0);
  const [modularLeftEdge, setModularLeftEdge] = useState(0);
  const [modularRightBar, setModularRightBar] = useState(0);
  const [modularRightEdge, setModularRightEdge] = useState(0);

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


const [modularColor, setModularColor] = useState(COLORS[0]);
const [frameColor, setFrameColor] = useState(COLORS[0]);
const [insideColor, setInsideColor] = useState(COLORS[1]);


const [height, setHeight] = useState(1000); //sets start value
const [width, setWidth] = useState(1000);  //sets start value




useEffect(() => {
  let isMounted = true;

   console.log('[Kofig] mountRef.current:', mountRef.current);

  initThree(mountRef.current, modelPath).then((api) => {
    if (isMounted) {
      setController(api);
    }
  });

  return () => {
    isMounted = false;
  };
}, [modelPath]);

  useEffect(() => {
  if (controller) controller.setHeight(height / 1000); // mm to scale
}, [controller,height ]);

useEffect(() => {
  if (controller) controller.setWidth(width / 1000);
}, [controller,width ]);

useEffect(() => {
  if (controller && MATERIAL_NAME_MAP[frameColor.name]) {
    const mappedName = MATERIAL_NAME_MAP[frameColor.name];
    controller.setMaterialForZone('frame', mappedName); // ← "frame" is the correct zone
  }
}, [controller, frameColor]);

useEffect(() => {
  if (controller && MATERIAL_NAME_MAP[insideColor.name]) {
    const mappedName = MATERIAL_NAME_MAP[insideColor.name];
    controller.setMaterialForZone('frameInside', mappedName); // ← use correct zone
  }
}, [controller, insideColor]);


useEffect(() => {
  if (controller) {
    const glbName = MATERIAL_NAME_MAP[modularColor.name]; // or make a new `modularColor` state if needed
    controller.setMaterialForZone('outside', glbName);
  }
}, [controller, modularColor]);



useEffect(() => {
  if (controller) controller.hideGUI();
}, [controller]);

useEffect(() => {
  if (controller) controller.setLeftHorizontalOffset(modularLeftEdge / 1000); // mm to meters
}, [controller, modularLeftEdge]);

useEffect(() => {
  if (controller) controller.setRightHorizontalOffset(modularRightEdge / 1000); // mm to meters
}, [controller, modularRightEdge]);

useEffect(() => {
  if (controller) controller.setLeftVerticalOffset(modularLeftBar / 1000);
}, [controller, modularLeftBar]);

useEffect(() => {
  if (controller) controller.setRightVerticalOffset(modularRightBar / 1000);
}, [controller, modularRightBar]);



  return (
    <div className="kofig-root container">
    <div className="container">
      <div className="sidebar">
  <div className="kofig-header">
    <h1>Kofig Demo</h1>
    <button className="back-button" onClick={handleBack}>←</button>
  </div>


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
          title="Modular Frame Color"
          colors={COLORS}
          selected={modularColor}
          onSelect={setModularColor}
        />
            </li>
          <li className="modular-positions-section">
  <h2>Modular Positions</h2>

  <SliderControl
    label="Left Vertical Bar"
    min={-150}
    max={235}
    step={1}
    value={modularLeftBar}
    onChange={setModularLeftBar}
  />

  <SliderControl
    label="Left Horizontal Bar"
    min={0}
    max={750}
    value={modularLeftEdge}
    onChange={setModularLeftEdge}
  />

  <SliderControl
    label="Right Vertical Bar"
    min={-235}
    max={150}
    step={1}
    value={modularRightBar}
    onChange={setModularRightBar}
  />

  <SliderControl
    label="Right Horizontal Bars"
    min={0}
    max={750}
    value={modularRightEdge}
    onChange={setModularRightEdge}
  />
</li>


        </ul>
      </div>

      <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {/* 3D scene renders here */}
      </main>
      

    </div>
    </div> 
  );
}

export default Kofig;
