/**
 * useUIStore.js — Global UI State Store (Zustand)
 *
 * Holds all UI/interaction state that should survive page navigation:
 *   - Dashboard filters (search, step, status)
 *   - CuttingReports active tab
 *   - ProductionReport category + view mode
 *   - Currently selected job ID (for bottom sheets)
 *
 * Uses `persist` middleware so state survives full page reloads.
 * Uses `devtools` middleware for Redux DevTools inspection in development.
 */
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useUIStore = create(
  devtools(
    persist(
      (set) => ({
        // ── Dashboard ────────────────────────────────────────────────────────
        dashSearch: '',
        dashStepFilter: 'All',
        dashStatusFilter: 'All',
        setDashSearch:       (v) => set({ dashSearch: v },       false, 'setDashSearch'),
        setDashStepFilter:   (v) => set({ dashStepFilter: v },   false, 'setDashStepFilter'),
        setDashStatusFilter: (v) => set({ dashStatusFilter: v }, false, 'setDashStatusFilter'),
        clearDashFilters: () => set({
          dashSearch: '',
          dashStepFilter: 'All',
          dashStatusFilter: 'All',
        }, false, 'clearDashFilters'),

        // ── CuttingReports ───────────────────────────────────────────────────
        cuttingTab: 'pending',   // 'pending' | 'completed' | 'hisab'
        setCuttingTab: (v) => set({ cuttingTab: v }, false, 'setCuttingTab'),

        // ── ProductionReport ─────────────────────────────────────────────────
        productionCategory: 'All',
        productionViewMode: 'stage',   // 'stage' | 'thekedar'
        setProductionCategory: (v) => set({ productionCategory: v }, false, 'setProductionCategory'),
        setProductionViewMode: (v) => set({ productionViewMode: v }, false, 'setProductionViewMode'),

        // ── Selected Job (bottom sheets) ─────────────────────────────────────
        // Store just the jobNo string; pages look up the full object from the cache
        selectedJobId: null,
        setSelectedJobId: (id) => set({ selectedJobId: id }, false, 'setSelectedJobId'),
      }),
      {
        name: 'pms-pro-ui-store', // localStorage key
        // Only persist filter/tab preferences — not derived selection state
        partialize: (state) => ({
          dashSearch:          state.dashSearch,
          dashStepFilter:      state.dashStepFilter,
          dashStatusFilter:    state.dashStatusFilter,
          cuttingTab:          state.cuttingTab,
          productionCategory:  state.productionCategory,
          productionViewMode:  state.productionViewMode,
        }),
      }
    ),
    { name: 'PMS-UIStore' }
  )
);

export default useUIStore;
