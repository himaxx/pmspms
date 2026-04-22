/**
 * queryClient.js — Shared TanStack Query Client
 *
 * Single instance used by the entire app via QueryClientProvider.
 * Production-tuned settings:
 *   - staleTime: 45s  → data is "fresh" for 45 s; no background refetch in that window
 *   - gcTime: 5 min   → unused cache entries evicted after 5 minutes
 *   - retry: 2        → auto-retry failed requests twice with exponential back-off
 *   - refetchOnWindowFocus: true → refresh data when user tabs back into the app
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            45 * 1000,       // 45 seconds
      gcTime:               5 * 60 * 1000,   // 5 minutes
      retry:                2,
      retryDelay:           (attempt) => Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect:   true,
    },
    mutations: {
      retry: 1,
    },
  },
});
