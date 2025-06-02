import React, { useState } from 'react';
import './SliderControl.css';

function SliderControl({ label, min, max, value, onChange }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="slider-wrapper">
      <label className="slider-label">
        {label}
        <span className="slider-sub">in millimeters</span>
      </label>

      <div className="slider-container">
        <input
          className="slider-input"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onFocus={(e) => e.target.select()}
        />

        <div className="slider-range-container">
          <span className="slider-min">{min}</span>

          <div className="slider-range-wrapper">
            <input
              type="range"
              min={min}
              max={max}
              value={value}
              onChange={(e) => onChange(Number(e.target.value))}
              className="slider-range"
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            />

            {hovered && (
              <div className="slider-bubble">
                <input
                  value={value}
                  onChange={(e) => onChange(Number(e.target.value))}
                  onClick={(e) => e.target.select()}
                />
              </div>
            )}
          </div>

          <span className="slider-max">{max}</span>
        </div>
      </div>
    </div>
  );
}

export default SliderControl;
