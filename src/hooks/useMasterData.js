import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export function useMasterData() {
  return useQuery({
    queryKey: ['master_data'],
    queryFn: async () => {
      const { data, error } = await supabase.from('master_data').select('*');
      if (error) throw error;
      
      const result = {
        progBy: [],
        cuttingNames: []
      };
      
      data.forEach(row => {
        if (row.category === 'prog_by') result.progBy = row.names || [];
        if (row.category === 'cutting_names') result.cuttingNames = row.names || [];
      });
      
      return result;
    }
  });
}

export function useUpdateMasterData() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ category, names }) => {
      const { error } = await supabase
        .from('master_data')
        .upsert({ category, names });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master_data'] });
    }
  });
}
