/**
 * useJobs.js — Single Data Access Layer for all Jobs
 *
 * Exports:
 *   useJobs()        → query hook; returns { data: jobs[], isLoading, error, refetch }
 *   useUpdateJob()   → mutation hook with optimistic updates for any step
 *   JOBS_QUERY_KEY   → stable query key constant for manual invalidation
 *
 * TanStack Query handles:
 *   - Deduplication: 4 pages call useJobs(), but only 1 real Supabase request fires
 *   - Caching: navigating away and back serves from cache (no spinner, instant)
 *   - Background revalidation: data auto-refreshes every 60 s and on window focus
 *   - Optimistic updates: UI reflects the mutation immediately; rolls back on error
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllJobs,
  createJob,
  updateStep2,
  updateStep3,
  updateStep4,
  updateStep5,
  updateStep6,
} from '../utils/db';

// ── Stable query key ──────────────────────────────────────────────────────────
export const JOBS_QUERY_KEY = ['jobs'];

// ── Main query hook ───────────────────────────────────────────────────────────
/**
 * useJobs() — fetches all jobs with shared cache.
 * Use this in every page/component that needs the jobs list.
 *
 * @returns {import('@tanstack/react-query').UseQueryResult}
 */
export function useJobs() {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn:  getAllJobs,
    staleTime: 45 * 1000,
    // Poll every 60 s (replaces Dashboard's manual setInterval)
    refetchInterval: 60 * 1000,
  });
}

// ── Step mutation builder ─────────────────────────────────────────────────────
/**
 * useStepMutation(mutationFn, getPatch?)
 *
 * Generic factory that wraps any step update in optimistic-update logic.
 *
 * @param {Function} mutationFn  - The db.js function (e.g. updateStep2)
 * @param {Function} [getPatch]  - Optional: (variables) => Partial<Job> for optimistic patch
 */
export function useStepMutation(mutationFn, getPatch) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn,

    onMutate: async (variables) => {
      // Cancel any in-flight refetches to prevent overwriting optimistic state
      await qc.cancelQueries({ queryKey: JOBS_QUERY_KEY });

      // Snapshot the current cache for rollback
      const previousJobs = qc.getQueryData(JOBS_QUERY_KEY);

      // Apply optimistic patch if a patch function was provided
      if (getPatch) {
        const patch = getPatch(variables);
        qc.setQueryData(JOBS_QUERY_KEY, (old = []) =>
          old.map((j) =>
            String(j.jobNo) === String(variables.jobNo)
              ? { ...j, ...patch }
              : j
          )
        );
      }

      return { previousJobs };
    },

    onError: (_err, _variables, context) => {
      // Rollback to the snapshot on error
      if (context?.previousJobs) {
        qc.setQueryData(JOBS_QUERY_KEY, context.previousJobs);
      }
    },

    onSettled: () => {
      // Always re-fetch from DB after mutation to ensure consistency
      qc.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
    },
  });
}

// ── Per-step mutation hooks ───────────────────────────────────────────────────

/** Create a brand-new job (Step 1) */
export function useCreateJob() {
  return useStepMutation(
    (params) => createJob(params),
    null // No optimistic update for creates — we don't know the jobNo yet
  );
}

/** Step 2 — Production Approval */
export function useUpdateStep2() {
  return useStepMutation(
    ({ jobNo, ...data }) => updateStep2(jobNo, data),
    ({ jobNo, yesNo, instructions, inhouseCutting }) => ({
      s2YesNo:       yesNo ? 'Yes' : 'No',
      s2Instructions: instructions || null,
      s2Inhouse:     inhouseCutting ? 'Yes' : 'No',
      s2Actual:      new Date().toISOString(),
    })
  );
}

/** Step 3 — Inhouse Cutting */
export function useUpdateStep3() {
  return useStepMutation(
    ({ jobNo, ...data }) => updateStep3(jobNo, data),
    ({ jobNo, cuttingPcs, name, sizeDetails }) => ({
      s3Actual:         new Date().toISOString(),
      s3DukanCutting:   cuttingPcs,
      s3CuttingPerson:  name,
      s3SizeDetails:    sizeDetails || null,
    })
  );
}

/** Step 4 — Naame */
export function useUpdateStep4() {
  return useStepMutation(
    ({ jobNo, ...data }) => updateStep4(jobNo, data),
    ({ jobNo, thekedarName, cutToPack, leadTime, cuttingPcs }) => ({
      s4StartDate:   new Date().toISOString(),
      s4Thekedar:    thekedarName,
      s4CutToPack:   cutToPack ? 'Yes' : 'No',
      s4LeadTime:    Number(leadTime) || null,
      s4CuttingPcs:  Number(cuttingPcs) || null,
    })
  );
}

/** Step 5 — Finished Maal Jama */
export function useUpdateStep5() {
  return useStepMutation(
    ({ jobNo, ...data }) => updateStep5(jobNo, data),
    ({ jobNo, jamaQty, pressHua }) => ({
      s5JamaQty: Number(jamaQty) || null,
      s5Press:   pressHua ? 'Yes' : 'No',
      s5Status:  'Complete',
    })
  );
}

/** Step 6 — Settle */
export function useUpdateStep6() {
  return useStepMutation(
    ({ jobNo, ...data }) => updateStep6(jobNo, data),
    ({ jobNo, settleQty, reason, yourName }) => ({
      s6SettleQty: Number(settleQty) || null,
      s6Reason:    reason || null,
      s6Name:      yourName,
    })
  );
}
