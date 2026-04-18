import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Forms from './pages/Forms';
import CuttingReports from './pages/CuttingReports';
import ProductionReport from './pages/ProductionReport';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="forms" element={<Forms />} />
        <Route path="cutting" element={<CuttingReports />} />
        <Route path="production" element={<ProductionReport />} />
      </Route>
    </Routes>
  );
}

export default App;
