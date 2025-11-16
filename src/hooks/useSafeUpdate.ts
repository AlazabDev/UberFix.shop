import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseSafeUpdateOptions {
  table: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useSafeUpdate({ table, onSuccess, onError }: UseSafeUpdateOptions) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const updateRecord = async (id: string, payload: Record<string, any>) => {
    setIsUpdating(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase.functions.invoke('safe-update', {
        body: {
          table,
          id,
          payload,
        },
      });

      if (updateError) {
        throw updateError;
      }

      if (!data.success) {
        throw new Error(data.error || 'Update failed');
      }

      toast({
        title: 'تم التحديث بنجاح',
        description: 'تم حفظ التغييرات',
      });

      onSuccess?.(data.data);

      return data.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('حدث خطأ أثناء التحديث');
      setError(error);
      
      toast({
        title: 'فشل التحديث',
        description: error.message,
        variant: 'destructive',
      });

      onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateRecord,
    isUpdating,
    error,
  };
}
