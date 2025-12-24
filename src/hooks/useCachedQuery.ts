import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const CACHE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cache-service`;

// Whitelist of allowed tables for caching (security: prevents cache key manipulation)
const ALLOWED_CACHE_TABLES = ['categories', 'services', 'cities', 'districts'] as const;
type AllowedCacheTable = typeof ALLOWED_CACHE_TABLES[number];

interface CachedQueryOptions<T> {
  queryKey: string[];
  table: string;
  select?: string;
  filters?: Record<string, any>;
  enabled?: boolean;
  staleTime?: number;
}

/**
 * Sanitize filter value to prevent injection attacks
 * Only allows alphanumeric characters, underscores, hyphens, and UUIDs
 */
const sanitizeFilterValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // Allow UUID format
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stringValue)) {
    return stringValue;
  }
  
  // Allow only alphanumeric, underscore, hyphen (max 100 chars)
  return stringValue.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 100);
};

/**
 * Validate and sanitize filter key names
 */
const sanitizeFilterKey = (key: string): string => {
  // Only allow valid SQL column name characters
  return key.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 50);
};

/**
 * Hook for cached queries with Edge Function fallback
 * Includes input validation to prevent cache key injection attacks
 */
export function useCachedQuery<T>({
  queryKey,
  table,
  select = '*',
  filters = {},
  enabled = true,
  staleTime = 5 * 60 * 1000, // 5 minutes default
}: CachedQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      // Security: Only allow whitelisted tables for caching
      const isAllowedTable = ALLOWED_CACHE_TABLES.includes(table as AllowedCacheTable);
      
      if (isAllowedTable) {
        try {
          // Sanitize all filter values before constructing cache key
          const sanitizedFilters = Object.entries(filters)
            .filter(([, value]) => value !== undefined && value !== null)
            .map(([key, value]) => `${sanitizeFilterKey(key)}=${sanitizeFilterValue(value)}`)
            .join('&');
          
          // Construct safe cache key
          const cacheKey = `${table}:${sanitizedFilters}`;
          
          const response = await fetch(
            `${CACHE_FUNCTION_URL}?action=get&key=${encodeURIComponent(cacheKey)}`
          );
          
          if (response.ok) {
            const result = await response.json();
            // Validate response structure
            if (result && typeof result === 'object' && 'data' in result && result.data) {
              return result.data as T;
            }
          }
        } catch (error) {
          // Log warning only in development
          if (import.meta.env.DEV) {
            console.warn('Cache fetch failed, falling back to database:', error);
          }
        }
      }

      // Fallback to direct database query (RLS will handle security)
      let query = supabase.from(table as any).select(select) as any;

      // Apply sanitized filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          const sanitizedKey = sanitizeFilterKey(key);
          if (sanitizedKey) {
            query = query.eq(sanitizedKey, value);
          }
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
