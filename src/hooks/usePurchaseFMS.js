import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPurchaseEntries,
  createPurchaseEntry,
  updatePurchaseStep2,
  updatePurchaseStep3,
  updatePurchaseStep4,
} from '../utils/purchaseDb';

export const PURCHASE_QUERY_KEY = ['purchase_fms'];

export function usePurchaseFMS() {
  return useQuery({
    queryKey: PURCHASE_QUERY_KEY,
    queryFn: getPurchaseEntries,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

function usePurchaseMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PURCHASE_QUERY_KEY });
    },
  });
}

export function useCreatePurchaseEntry() {
  return usePurchaseMutation(createPurchaseEntry);
}

export function useUpdatePurchaseStep2() {
  return usePurchaseMutation(({ id, ...data }) => updatePurchaseStep2(id, data));
}

export function useUpdatePurchaseStep3() {
  return usePurchaseMutation(({ id, ...data }) => updatePurchaseStep3(id, data));
}

export function useUpdatePurchaseStep4() {
  return usePurchaseMutation(({ id, ...data }) => updatePurchaseStep4(id, data));
}
