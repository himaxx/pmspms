import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../utils/supabase';

export function useSizewiseData() {
  return useQuery({
    queryKey: ['sizewise_details'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sizewise_details')
        .select('*')
        .order('category', { ascending: true })
        .order('design_name', { ascending: true });
      
      if (error) throw error;
      
      // Group by category to match the frontend expected structure
      const grouped = data.reduce((acc, row) => {
        if (!acc[row.category]) acc[row.category] = [];
        acc[row.category].push({
          id: row.id,
          name: row.design_name,
          pieces: row.pieces,
          sizes: row.sizes
        });
        return acc;
      }, {});
      
      return grouped;
    }
  });
}

export function useUpdateSizewiseDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, category, design_name, pieces, sizes }) => {
      const { data, error } = await supabase
        .from('sizewise_details')
        .upsert({
          id, // If id is provided, it updates, else inserts
          category,
          design_name,
          pieces,
          sizes
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizewise_details'] });
    }
  });
}

export function useDeleteSizewiseDesign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('sizewise_details')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sizewise_details'] });
    }
  });
}
