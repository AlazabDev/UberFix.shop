/**
 * WhatsApp Media Hook
 * ====================
 * Hook لإدارة ملفات وسائط WhatsApp
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { mediaApi, type MediaFile, type MediaFilters } from '../api/whatsappApi';

export interface UseWhatsAppMediaReturn {
  // Data
  files: MediaFile[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  refetch: () => void;
  deleteFile: (id: number) => Promise<void>;
  getFile: (id: number) => Promise<MediaFile | null>;
  
  // State
  isDeleting: boolean;
}

const defaultFilters: MediaFilters = {
  page: 1,
  limit: 20,
};

export function useWhatsAppMedia(filters: Partial<MediaFilters> = {}): UseWhatsAppMediaReturn {
  const queryClient = useQueryClient();
  const mergedFilters = { ...defaultFilters, ...filters };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wa-media', mergedFilters],
    queryFn: () => mediaApi.list(mergedFilters),
    staleTime: 30000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-media'] });
      toast.success('تم حذف الملف');
    },
    onError: (error: Error) => {
      toast.error(`فشل الحذف: ${error.message}`);
    },
  });

  const getFile = useCallback(async (id: number) => {
    return mediaApi.get(id);
  }, []);

  const deleteFile = useCallback(async (id: number) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  return {
    files: data?.files || [],
    total: data?.total || 0,
    isLoading,
    error: error as Error | null,
    refetch,
    deleteFile,
    getFile,
    isDeleting: deleteMutation.isPending,
  };
}

export default useWhatsAppMedia;
