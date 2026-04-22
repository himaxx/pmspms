/**
 * AdminRoute.jsx — Protected Route Guard
 *
 * Wraps any component that requires admin authentication.
 * - Shows nothing while Supabase checks the session (prevents flash)
 * - Redirects to /admin/login if not authenticated
 * - Renders children if authenticated
 */
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function AdminRoute({ children }) {
  const isAdmin = useAuthStore((s) => s.isAdmin);
  const loading = useAuthStore((s) => s.loading);

  // While Supabase is checking the stored session, show nothing
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin w-8 h-8 text-violet-400" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="text-sm text-gray-500 font-medium">Verifying session…</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
