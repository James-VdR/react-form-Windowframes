import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WindowSelector.css';

import frame1 from '../Images/Regular_Window_Model.jpg';
import frame2 from '../Images/Modular_Window_Model.jpg';
import kofigLogo from '../Images/KofigLogo.jpg';

function WindowSelector() {
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();

  const handleSelect = (type) => {
    setSelected(type);
  };

  const handleSubmit = () => {
    if (!selected) return;

    let modelPath = '';
    let route = '/';

    if (selected === 'regular') {
      modelPath = 'Window_Frame.glb';
      route = '/regular-frame';
    } else if (selected === 'modular') {
      modelPath = 'Window_Frame_Cross.glb';
      route = '/modular-frame';
    } else if (selected === 'kofig') {
      modelPath = 'Kofig_Window_Model.glb';
      route = '/kofig-frame';
    }

    navigate(route, { state: { model: modelPath } });
  };

  return (
    <div className="selector-page">
      <h1 className="selector-title">Choose a Window Type</h1>

      <div className="selector-grid">
        <div
          className={`selector-card ${selected === 'regular' ? 'selected' : ''}`}
          onClick={() => handleSelect('regular')}
        >
          <img src={frame1} alt="Regular Frame" className="selector-card-img" />
          <p>Model 1</p>
        </div>

        <div
          className={`selector-card ${selected === 'modular' ? 'selected' : ''}`}
          onClick={() => handleSelect('modular')}
        >
          <img src={frame2} alt="Modular Frame" className="selector-card-img" />
          <p>Model 2</p>
        </div>

        <div
          className={`selector-card ${selected === 'kofig' ? 'selected' : ''}`}
          onClick={() => handleSelect('kofig')}
        >
          <img src={kofigLogo} alt="Kofig Frame" className="selector-card-img" />
          <p>Model 3</p>
        </div>
      </div>

      <button
        className="next-button"
        onClick={handleSubmit}
        disabled={!selected}
      >
        Confirm Selection →
      </button>
    </div>
  );
}

export default WindowSelector;
