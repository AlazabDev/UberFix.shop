import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseErrorHandlerReturn {
  error: string | null;
  isLoading: boolean;
  clearError: () => void;
  handleAsync: <T>(
    asyncFn: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showLoading?: boolean;
    }
  ) => Promise<T | null>;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      showLoading?: boolean;
    } = {}
  ): Promise<T | null> => {
    const { successMessage, errorMessage, showLoading = true } = options;
    
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      const result = await asyncFn();
      
      if (successMessage) {
        toast({
          title: "تم بنجاح",
          description: successMessage,
        });
      }
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
      setError(message);
      
      toast({
        title: "خطأ",
        description: errorMessage || message,
        variant: "destructive",
      });
      
      console.error('Error handled by useErrorHandler:', err);
      return null;
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [toast]);

  return {
    error,
    isLoading,
    clearError,
    handleAsync
  };
}
