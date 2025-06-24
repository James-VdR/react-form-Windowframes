import React, { useEffect, useRef, useState } from 'react';
import { initThree } from '../scripts';
import '../Kofig.css';
import { useNavigate } from 'react-router-dom';
import SliderControl from '../SliderControl';
import ColorSelectorGroup from '../ColorSelectorGroup';





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
  const [horizontalBarMax, setHorizontalBarMax] = useState(750);
  const [controller, setController] = useState(null);
  const [mirrorVertical, setMirrorVertical] = useState(false);
  const [mirrorHorizontal, setMirrorHorizontal] = useState(false);
  const [leftBarMax, setLeftBarMax] = useState(235);
  const [rightBarMin, setRightBarMin] = useState(-235);
  const [rightBarMax, setRightBarMax] = useState(150);


  const [modelPath] = useState('/models/Window_Frame_Three.glb');
  const model = "KofigFrame";
  const [modularLeftBar, setModularLeftBar] = useState(0);
  const [modularLeftEdge, setModularLeftEdge] = useState(0);
  const [modularRightBar, setModularRightBar] = useState(0);
  const [modularRightEdge, setModularRightEdge] = useState(0);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  const [submitted, setSubmitted] = useState(false);


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

  useEffect(() => {
    if (controller) controller.setModularEnabled(false, false);
  }, [controller]);

  useEffect(() => {
    let isMounted = true;
    initThree(mountRef.current, modelPath).then((api) => {
      if (isMounted) setController(api);
    });
    return () => {
      isMounted = false;
    };
  }, [modelPath]);

  useEffect(() => {
    if (controller) controller.setHeight(height / 1000);
  }, [controller, height]);

  useEffect(() => {
    if (controller) controller.setWidth(width / 1000);
  }, [controller, width]);

useEffect(() => {
    const widthDelta = Math.max(width - 1000, 0); // Width beyond 1000mm
    

    setLeftBarMax(235 + widthDelta);

    const baseMin = -235;
    const baseMax = 150;

    setRightBarMin(baseMin + widthDelta);
    setRightBarMax(baseMax + widthDelta * 2);
}, [width]);




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
/*
  useEffect(() => {
    if (controller) controller.hideGUI();
  }, [controller]);
*/
  useEffect(() => {
    if (controller) controller.setLeftHorizontalOffset(modularLeftEdge / 1000);
  }, [controller, modularLeftEdge]);

  useEffect(() => {
    if (controller) controller.setRightHorizontalOffset(modularRightEdge / 1000);
  }, [controller, modularRightEdge]);

  useEffect(() => {
    if (controller) controller.setLeftVerticalOffset(modularLeftBar / 1000);
  }, [controller, modularLeftBar]);

  useEffect(() => {
    if (controller) controller.setRightVerticalOffset(modularRightBar / 1000);
  }, [controller, modularRightBar]);

  useEffect(() => {
    const extraHeight = Math.max(height - 1000, 0);
    setHorizontalBarMax(750 + extraHeight);
  }, [height]);

  

 const handleSubmit = async () => {
  const payload = {
    model,
    width, 
    height,
    modularLeftBar,
    modularRightBar,
    modularLeftEdge,
    modularRightEdge,
    frameColor: frameColor.name,
    insideColor: insideColor.name,
    modularColor: modularColor.name,
  };
  console.log("Sending payload to Zapier:", payload);

  try {
       await fetch('https://hooks.zapier.com/hooks/catch/14955932/uy82dks/', {
      "mode": "no-cors", // needed for Zapier (no response expected)
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
    <div className="kofig-root container">
      <div className="container">
        <div className="sidebar">
          <div className="kofig-header">
            <h1>3 Section Window.</h1>
            <button className="back-button" onClick={handleBack}>←</button>
          </div>

          <ul>
            <li><SliderControl label="Height" min={1000} max={3000} value={height} onChange={setHeight} /></li>
            <li><SliderControl label="Width" min={1000} max={3000} value={width} onChange={setWidth} /></li>

            <li>
              <ColorSelectorGroup title="Frame Color" colors={COLORS} selected={frameColor} onSelect={setFrameColor} />
            </li>
            <li>
              <ColorSelectorGroup title="Inside Frame Color" colors={COLORS} selected={insideColor} onSelect={setInsideColor} />
            </li>
            <li>
              <ColorSelectorGroup title="Modular Frame Color" colors={COLORS} selected={modularColor} onSelect={setModularColor} />
            </li>

            <li className="modular-positions-section">
              <h2>Modular Positions</h2>

              <div className="toggle-buttons">
                <button className={`check-toggle ${mirrorVertical ? 'active' : ''}`} onClick={() => setMirrorVertical(!mirrorVertical)}>✓</button>
                <span className="toggle-label">Toggle Mirror Vertical</span>
              </div>

             <SliderControl label="Left Vertical Bar" min={-150} max={leftBarMax} step={1} value={modularLeftBar}
  onChange={(val) => {
    setModularLeftBar(val);
    if (mirrorVertical) setModularRightBar(-val);
  }}
/>

        <SliderControl label="Right Vertical Bar" min={rightBarMin} max={rightBarMax} step={1} value={modularRightBar}
  onChange={(val) => {
    setModularRightBar(val);
    if (mirrorVertical) setModularLeftBar(-val);
  }}
/>


              <div className="toggle-buttons">
                <button className={`check-toggle ${mirrorHorizontal ? 'active' : ''}`} onClick={() => setMirrorHorizontal(!mirrorHorizontal)}>✓</button>
                <span className="toggle-label">Toggle Mirror Horizontal</span>
              </div>

              <SliderControl label="Left Horizontal Bar" min={0} max={horizontalBarMax} value={modularLeftEdge}
                onChange={(val) => {
                  setModularLeftEdge(val);
                  if (mirrorHorizontal) setModularRightEdge(val);
                }}
              />
              <SliderControl label="Right Horizontal Bar" min={0} max={horizontalBarMax} value={modularRightEdge}
                onChange={(val) => {
                  setModularRightEdge(val);
                  if (mirrorHorizontal) setModularLeftEdge(val);
                }}
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

        </div>

        <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}></main>
      </div>
    </div>
  );
}

export default Kofig;
