import React, { useEffect, useRef } from 'react';
import './App.css';
import './scripts';
function App() {
   const mountRef = useRef(null);
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
  
