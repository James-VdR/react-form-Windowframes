import React, { useEffect, useRef } from 'react';
import './App.css';

import { initThree } from './scripts';


function App() {
  const mountRef = useRef(null);
// needs to be put in react like this or the render will give an error because
useEffect(() => {
  if (mountRef.current) {
    initThree(mountRef.current);
  }
}, []);

     return (
    <div className="container">
      <nav className="sidebar">
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

      <main className="main-content" ref={mountRef}>
        
      </main>
    </div>
  );
}

export default App;
  
