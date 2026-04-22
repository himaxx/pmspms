/**
 * useAuthStore.js — Admin Authentication State (Zustand)
 *
 * Wraps Supabase Auth with a clean Zustand interface.
 * Supabase persists the session in localStorage automatically,
 * so the admin stays logged in across page refreshes.
 *
 * Admin credentials:
 *   Email:    admin@himaxpms.com
 *   Password: HimaxAdmin@2025
 */
import { create } from 'zustand';
import { supabase } from '../utils/supabase';
import { queryClient } from '../lib/queryClient';
import { JOBS_QUERY_KEY } from '../hooks/useJobs';

const useAuthStore = create((set, get) => ({
  user:         null,
  isAdmin:      false,
  loading:      true,   // true while Supabase checks the session
  loginError:   null,

  // ── Called once in App.jsx to listen for session changes ────────────────────
  init: () => {
    // Check current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({
        user:    session?.user ?? null,
        isAdmin: !!session?.user,
        loading: false,
      });
      // Invalidate on initial load to be safe
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    });

    // Subscribe to future auth state changes (login / logout / refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const isNowAdmin = !!session?.user;
      const wasAdmin   = get().isAdmin;

      set({
        user:    session?.user ?? null,
        isAdmin: isNowAdmin,
        loading: false,
      });

      // If auth status changed, clear the cache to ensure correct data permissions (RLS)
      if (isNowAdmin !== wasAdmin) {
        queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      }
    });

    return () => subscription.unsubscribe();
  },

  // ── Login ────────────────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ loginError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loginError: error.message });
      return false;
    }
    
    set({ user: data.user, isAdmin: true, loginError: null });
    
    // Force a re-fetch of all jobs now that we represent the Admin user
    await queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    
    return true;
  },

  // ── Logout ───────────────────────────────────────────────────────────────────
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAdmin: false });
    
    // Clear cache so personal/admin data doesn't linger for the next guest session
    await queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
  },

  clearError: () => set({ loginError: null }),
}));

export default useAuthStore;
