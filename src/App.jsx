import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Teams from './pages/Teams';
import Races from './pages/Races';
import Predictions from './pages/Predictions';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/races" element={<Races />} />
          <Route path="/predictions" element={<Predictions />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
