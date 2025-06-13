import React, { useEffect, useRef, useState } from 'react';
import { initThree } from '../scripts';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import SliderControl from '../SliderControl';
import ColorSelectorGroup from '../ColorSelectorGroup';
import { useLocation } from 'react-router-dom';

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


  function RegularFrame() {
  const mountRef = useRef(null);
  
  const [controller, setController] = useState(null);
  const location = useLocation();
  const [modelPath] = useState(`/models/${location.state?.model || 'Window_Frame.glb'}`);
  const [modelReady, setModelReady] = useState(false);
  const model =  "RegularFrame";
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);


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



 useEffect(() => {
  let isMounted = true;

  initThree(mountRef.current, modelPath).then((api) => {
    if (isMounted) {
      setController(api);
      setModelReady(true); //  Mark model as ready
    }
  });

  return () => {
    isMounted = false;
  };
}, [modelPath]);

useEffect(() => {
  if (controller) {
    controller.setModularEnabled(false, false); //  Force off
  }
}, [controller]);



useEffect(() => {
  if (controller && modelReady) {
    controller.setHeight(height / 1000);
  }
}, [controller, modelReady, height]);

useEffect(() => {
  if (controller && modelReady) {
    controller.setWidth(width / 1000);
  }
}, [controller, modelReady, width]);

useEffect(() => {
  if (controller && modelReady && MATERIAL_NAME_MAP[frameColor.name]) {
    const mappedName = MATERIAL_NAME_MAP[frameColor.name];
    controller.setMaterialForZone('frame', mappedName);
  }
}, [controller, modelReady, frameColor]);

useEffect(() => {
  if (controller && modelReady && MATERIAL_NAME_MAP[insideColor.name]) {
    const mappedName = MATERIAL_NAME_MAP[insideColor.name];
    controller.setMaterialForZone('frameInside', mappedName);
  }
}, [controller, modelReady, insideColor]);


useEffect(() => {
  if (controller && modelReady) controller.hideGUI();
}, [controller, modelReady]);

  const handleSubmit = async () => {
    const payload = {
      model,
      width, 
      height,
      frameColor: frameColor.name,
      insideColor: insideColor.name,
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
        <h1>Standard Window</h1>
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

        </ul>
       
         <button
  className="submit-button"
  onClick={handleSubmit}
  disabled={submitted}
>
  {submitted ? 'Submitted' : 'Submit'}
</button>
      </nav>

      <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {/* 3D scene renders here */}
      </main>
     

    </div>
  );
}

export default RegularFrame;
