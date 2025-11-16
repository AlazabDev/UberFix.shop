import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VersionHistoryEntry {
  version: number;
  operation: string;
  changed_at: string;
  changed_by: string;
  changed_by_name: string;
  change_summary: string;
}

export function useVersionHistory(table: string, id: string, limit: number = 10) {
  const [history, setHistory] = useState<VersionHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!table || !id) return;

    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase.functions.invoke('version-history', {
          body: {
            table,
            id,
            limit,
          },
        });

        if (fetchError) {
          throw fetchError;
        }

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch version history');
        }

        setHistory(data.data || []);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch version history');
        setError(error);
        console.error('Version history error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [table, id, limit]);

  return {
    history,
    isLoading,
    error,
  };
}
