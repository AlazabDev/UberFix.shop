/**
 * WhatsApp Config Hook
 * =====================
 * Hook للتحقق من حالة تكوين WhatsApp
 */

import { useQuery } from '@tanstack/react-query';
import { configApi, type ConfigStatus } from '../api/whatsappApi';

export interface UseWhatsAppConfigReturn {
  config: ConfigStatus | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  isConfigured: boolean;
}

export function useWhatsAppConfig(): UseWhatsAppConfigReturn {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wa-config'],
    queryFn: () => configApi.checkStatus(),
    staleTime: 60000, // 1 minute
    retry: 1,
  });

  return {
    config: data || null,
    isLoading,
    error: error as Error | null,
    refetch,
    isConfigured: data?.configured ?? false,
  };
}

export default useWhatsAppConfig;
