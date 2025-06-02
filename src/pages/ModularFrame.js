import React, { useEffect, useRef, useState } from 'react';
import { initThree } from '../scripts';
import '../App.css';
import { useNavigate } from 'react-router-dom';
import SliderControl from '../SliderControl';
import ColorSelectorGroup from '../ColorSelectorGroup';

function ModularFrame() {
  const mountRef = useRef(null);
  const [modelPath] = useState('/models/Window_Frame.glb');

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




  useEffect(() => {
    if (mountRef.current) {
      initThree(mountRef.current, modelPath);
    }
  }, [modelPath]);

  return (
    <div className="container">
      <nav className="sidebar">
        
        <h1>Modular Window</h1>
        <ul>
          
          <li><SliderControl label="Height" min={1000} max={3000} /></li>
          <li><SliderControl label="Width" min={1000} max={4000} /></li>
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
      </nav>

      <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {/* 3D scene renders here */}
      </main>
      <button className="back-button" onClick={handleBack}>
  ←
</button>

    </div>
  );
}

export default ModularFrame;
