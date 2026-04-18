import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import Forms from './pages/Forms';
import CuttingReports from './pages/CuttingReports';
import ProductionReport from './pages/ProductionReport';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="forms" element={<Forms />} />
          <Route path="cutting" element={<CuttingReports />} />
          <Route path="production" element={<ProductionReport />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
