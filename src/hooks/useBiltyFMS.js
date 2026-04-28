import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBiltyEntries,
  createBiltyEntry,
  updateBiltyStep2,
  updateBiltyStep3,
  updateBiltyStep4,
} from '../utils/biltyDb';

export const BILTY_QUERY_KEY = ['bilty_fms'];

export function useBiltyFMS() {
  return useQuery({
    queryKey: BILTY_QUERY_KEY,
    queryFn: getBiltyEntries,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

function useBiltyMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: BILTY_QUERY_KEY });
    },
  });
}

export function useCreateBiltyEntry() {
  return useBiltyMutation(createBiltyEntry);
}

export function useUpdateBiltyStep2() {
  return useBiltyMutation(({ id, ...data }) => updateBiltyStep2(id, data));
}

export function useUpdateBiltyStep3() {
  return useBiltyMutation(({ id, ...data }) => updateBiltyStep3(id, data));
}

export function useUpdateBiltyStep4() {
  return useBiltyMutation(({ id, ...data }) => updateBiltyStep4(id, data));
}
