import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WindowSelector.css';

import frame1 from '../Images/Regular_Window_Model.jpg';
import frame2 from '../Images/Modular_Window_Model.jpg';

function WindowSelector() {
  const [selected, setSelected] = useState('');
  const navigate = useNavigate();

 const handleNext = () => {
  if (selected === 'regular') {
    navigate('/regular-frame', {
      state: { model: 'Window_Frame.glb' }
    });
  } else if (selected === 'modular') {
    navigate('/modular-frame', {
      state: { model: 'Window_Frame_Cross.glb' }
    });
  }
};

  return (
    <div className="selector-page">
      <div className="selector-grid">
        <div className="selector-heading">
          <h1>Choose a Window Type</h1>
        </div>

        <div className="selector-options-group">
          <div className="selector-row">
            <label className={`radio-option ${selected === 'regular' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="windowType"
                value="regular"
                checked={selected === 'regular'}
                onChange={() => setSelected('regular')}
              />
              <span className="custom-radio" />
              Regular Window Frame
            </label>
            <img src={frame1} alt="Regular Frame" className="selector-img" />
          </div>

          <div className="selector-row">
            <label className={`radio-option ${selected === 'modular' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="windowType"
                value="modular"
                checked={selected === 'modular'}
                onChange={() => setSelected('modular')}
              />
              <span className="custom-radio" />
              Modular Frame
            </label>
            <img src={frame2} alt="Modular Frame" className="selector-img" />
          </div>

          <button
            className="next-button"
            onClick={handleNext}
            disabled={!selected}
          >
            Volgende &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default WindowSelector;
