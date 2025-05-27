import React, { useEffect, useRef, useState } from 'react';
import './App.css';

import { initThree } from './scripts';

import logo from './Images/reuzenpandalogo.jpg';

function App() {
  const mountRef = useRef(null);
  
  // Optional: State to hold which model you want to load
  const [modelPath, ] = useState('/models/Window_Frame.glb');

  useEffect(() => {
    if (mountRef.current) {
      // Pass the mount DOM element AND the model path you want to load
      initThree(mountRef.current, modelPath);
    }
  }, [modelPath]); // Re-run if modelPath changes, reloads scene with new model

  return (
    <div className="container">
      <nav className="sidebar">
        <img src={logo} alt="Logo" className="bottom-image" />
        <h1>Home</h1>
        <ul>
          <li>Section A</li>
          <li>Section B</li>
          <li>Section C</li>
          <li>Section D</li>
          <li>Section E</li>
          <li>Footer</li>
        </ul>
      </nav>

      <main className="main-content" ref={mountRef} style={{ width: '100%', height: '100vh' }}>
        {/* The 3D scene will render inside this element */}
      </main>
    </div>
  );
}

export default App