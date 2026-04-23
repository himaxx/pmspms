/**
 * AdminLogin.jsx — Premium Admin Login Page
 *
 * Dark/midnight theme with glassmorphism card.
 * Uses Supabase Auth via useAuthStore.
 * Redirects to /admin on successful login.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const login     = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const isAdmin   = useAuthStore((s) => s.isAdmin);
  const clearError = useAuthStore((s) => s.clearError);
  const navigate  = useNavigate();

  // Already logged in → go straight to admin
  useEffect(() => {
    if (isAdmin) navigate('/admin', { replace: true });
  }, [isAdmin, navigate]);

  useEffect(() => { clearError(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(email, password);
    setSubmitting(false);
    if (ok) navigate('/admin', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet-900/40 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-indigo-900/40 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-purple-900/20 blur-[80px]" />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm">
        {/* Logo + title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-2xl shadow-violet-900/60 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Portal</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">PMS Pro — Restricted Access</p>
        </div>

        {/* Form card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error banner */}
            {loginError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 flex items-center gap-2"
                   style={{ animation: 'slideUp 200ms ease-out' }}>
                <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-red-400 font-semibold">{loginError}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@himaxpms.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                           placeholder:text-gray-600 outline-none focus:border-violet-500 focus:ring-2
                           focus:ring-violet-500/20 transition-all font-medium"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white text-sm
                             placeholder:text-gray-600 outline-none focus:border-violet-500 focus:ring-2
                             focus:ring-violet-500/20 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745A10.029 10.029 0 0020 10c-1.443-3.75-5.079-6.41-9.336-6.41a9.97 9.97 0 00-4.619 1.126L3.28 2.22zm7.31 7.31l2.88 2.88A2.5 2.5 0 0110 12.5a2.5 2.5 0 01-.41-4.97z" clipRule="evenodd" />
                      <path d="M17.149 17.15c-.235.16-.477.31-.724.45L14.57 15.75A4 4 0 016.408 9.238L3.835 6.665A9.97 9.97 0 000 10c1.443 3.75 5.079 6.41 9.336 6.41A9.97 9.97 0 0017.149 17.15z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm
                         bg-gradient-to-r from-violet-600 to-indigo-600
                         hover:from-violet-500 hover:to-indigo-500
                         disabled:opacity-50 disabled:cursor-not-allowed
                         shadow-lg shadow-violet-900/40
                         transition-all duration-200 active:scale-[0.98]"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In as Admin'}
            </button>

            {/* Back to Standard Mode */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2.5 rounded-xl font-bold text-gray-400 text-xs
                         bg-white/5 border border-white/5 hover:bg-white/10
                         hover:text-white transition-all duration-200 uppercase tracking-widest mt-2"
            >
              ← Back to Standard Mode
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-700 mt-6 font-medium">
          Restricted to authorized personnel only
        </p>
      </div>
    </div>
  );
}
