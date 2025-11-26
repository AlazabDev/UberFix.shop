import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CACHE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cache-service`;

interface CachedQueryOptions<T> {
  queryKey: string[];
  table: string;
  select?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Hook for cached queries with Edge Function fallback
 */
export function useCachedQuery<T>({
  queryKey,
  table,
  select = '*',
  filters = {},
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes default
}: CachedQueryOptions<T>) {
  const supabaseClient = supabase as unknown as { from: (table: string) => ReturnType<typeof supabase.from> };
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Try cache first for reference data
      if (['categories', 'services', 'cities', 'districts'].includes(table)) {
        try {
          const cacheKey = `${table}:${Object.values(filters).join(':')}`;
          const response = await fetch(
            `${CACHE_FUNCTION_URL}?action=get&key=${encodeURIComponent(cacheKey)}`
          );
          
          if (response.ok) {
            const { data } = await response.json();
            if (data) return data as T;
          }
        } catch (error) {
          console.warn('Cache fetch failed, falling back to database:', error);
        }
      }

      // Fallback to direct database query
      let query = supabaseClient.from(table).select(select);

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      const { data, error } = await query;
      
      if (error) throw error;
      return data as T;
    },
    enabled,
    staleTime,
    gcTime: staleTime * 2,
  });
}
