import { Routes, Route } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import Layout from './components/Layout';
import SplashScreen from './components/SplashScreen';
import AdminRoute from './components/AdminRoute';
import { useJobsRealtime } from './hooks/useJobsRealtime';
import useAuthStore from './store/useAuthStore';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Forms = lazy(() => import('./pages/Forms'));
const Reports = lazy(() => import('./pages/Reports'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading component for Suspense
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public routes — no login required ── */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="forms/*" element={<Forms />} />
            <Route path="reports/*" element={<Reports />} />
          </Route>

          {/* ── Admin routes ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;


