import { BrowserRouter as Router, Routes, Route, } from 'react-router-dom';

import WindowSelector from './pages/WindowSelector';
import RegularFrame from './pages/RegularFrame';
import ModularFrame from './pages/ModularFrame';
import Kofig from './pages/Kofig';


function App() {
  return (
    <Router>
     
      <Routes>
        <Route path="/" element={<WindowSelector />} />
        <Route path="/regular-frame" element={<RegularFrame />} />
        <Route path="/modular-frame" element={<ModularFrame />} />
        <Route path="/Kofig-Frame" element={<Kofig />} />
      </Routes>
    </Router>
  );
}

export default App;
