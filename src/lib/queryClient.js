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
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            45 * 1000,       // 45 seconds
      gcTime:               1000 * 60 * 60 * 24, // 24 hours (keep in cache for offline)
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

// Configure persistence to localStorage
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'KETAN_PMS_OFFLINE_CACHE',
});

persistQueryClient({
  queryClient,
  persister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

