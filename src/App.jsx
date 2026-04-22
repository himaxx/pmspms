import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import Forms from './pages/Forms';
import CuttingReports from './pages/CuttingReports';
import ProductionReport from './pages/ProductionReport';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import { useJobsRealtime } from './hooks/useJobsRealtime';
import useAuthStore from './store/useAuthStore';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const initAuth = useAuthStore((s) => s.init);

  // Initialize Supabase auth listener once (restores session from localStorage)
  useEffect(() => {
    const unsub = initAuth();
    return unsub;
  }, [initAuth]);

  // Mount real-time Supabase subscription once — auto-invalidates cache on any DB change
  useJobsRealtime();

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}

      <Routes>
        {/* ── Public routes — no login required ── */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="forms" element={<Forms />} />
          <Route path="cutting" element={<CuttingReports />} />
          <Route path="production" element={<ProductionReport />} />
        </Route>

        {/* ── Admin routes ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
