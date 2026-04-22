/**
 * useJobsRealtime.js — Supabase Real-Time Subscription
 *
 * Listens for any INSERT or UPDATE on the `jobs` table and
 * invalidates the TanStack Query cache so all pages update live.
 *
 * Mount this hook ONCE in App.jsx (already done).
 * No props needed. Side-effects only.
 */
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';
import { JOBS_QUERY_KEY } from './useJobs';

export function useJobsRealtime() {
  const qc = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'jobs' },
        () => {
          // Any change to the jobs table → bust the cache
          qc.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
