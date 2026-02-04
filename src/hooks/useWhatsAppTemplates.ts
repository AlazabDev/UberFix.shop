import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TemplateStatus = 'draft' | 'submitted' | 'pending' | 'approved' | 'rejected' | 'paused' | 'disabled' | 'deleted';
export type TemplateCategory = 'utility' | 'marketing' | 'authentication';
export type TemplateQuality = 'unknown' | 'high' | 'medium' | 'low';

export interface TemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
  text: string;
  url?: string;
  phone_number?: string;
}

export interface WATemplate {
  id: string;
  tenant_id: string;
  created_by: string | null;
  meta_template_id: string | null;
  meta_template_name: string | null;
  name: string;
  category: TemplateCategory;
  language: string;
  status: TemplateStatus;
  quality: TemplateQuality;
  rejection_reason: string | null;
  quality_reason: string | null;
  header_type: 'text' | 'image' | 'video' | 'document' | 'none' | null;
  header_content: string | null;
  header_media_url: string | null;
  body_text: string;
  footer_text: string | null;
  buttons: TemplateButton[];
  components: any[];
  version: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
}

export interface TemplateEvent {
  id: string;
  template_id: string;
  tenant_id: string;
  actor_id: string | null;
  event_type: string;
  event_source: string;
  old_status: TemplateStatus | null;
  new_status: TemplateStatus | null;
  old_quality: TemplateQuality | null;
  new_quality: TemplateQuality | null;
  metadata: any;
  error_message: string | null;
  correlation_id: string | null;
  created_at: string;
}

export interface TemplateStats {
  total: number;
  draft: number;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
  paused: number;
  disabled: number;
  quality_high: number;
  quality_medium: number;
  quality_low: number;
}

export interface TemplateFilters {
  status?: TemplateStatus;
  category?: TemplateCategory;
  language?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

interface ListResponse {
  templates: WATemplate[];
  total: number;
  page: number;
  limit: number;
  stats: TemplateStats;
}

interface GetResponse {
  template: WATemplate;
  events: TemplateEvent[];
}

const callTemplatesAPI = async (action: string, body?: any, params?: Record<string, string>) => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Not authenticated');
  }

  const queryParams = new URLSearchParams({ action, ...params });
  
  const response = await supabase.functions.invoke('whatsapp-templates', {
    body: body ? JSON.stringify(body) : undefined,
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // For GET requests, we need to use fetch directly with query params
  if (!body) {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(
      `https://zrrffsjbfkphridqyais.supabase.co/functions/v1/whatsapp-templates?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  }

  // For POST requests with body
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(
    `https://zrrffsjbfkphridqyais.supabase.co/functions/v1/whatsapp-templates?${queryParams}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
};

export function useWhatsAppTemplates(filters: TemplateFilters) {
  const queryClient = useQueryClient();

  // List templates with filters
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<ListResponse>({
    queryKey: ['wa-templates', filters],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: String(filters.page),
        limit: String(filters.limit),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.language) params.language = filters.language;
      if (filters.search) params.search = filters.search;

      return callTemplatesAPI('list', undefined, params);
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Get single template
  const getTemplate = useCallback(async (id: string): Promise<GetResponse> => {
    return callTemplatesAPI('get', undefined, { id });
  }, []);

  // Create template
  const createMutation = useMutation({
    mutationFn: (template: Partial<WATemplate>) => callTemplatesAPI('create', template, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-templates'] });
      toast.success('تم إنشاء القالب بنجاح');
    },
    onError: (error: Error) => {
      toast.error(`فشل إنشاء القالب: ${error.message}`);
    },
  });

  // Update template
  const updateMutation = useMutation({
    mutationFn: (template: Partial<WATemplate> & { id: string }) => 
      callTemplatesAPI('update', template, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-templates'] });
      toast.success('تم تحديث القالب بنجاح');
    },
    onError: (error: Error) => {
      toast.error(`فشل تحديث القالب: ${error.message}`);
    },
  });

  // Submit to Meta
  const submitMutation = useMutation({
    mutationFn: (id: string) => callTemplatesAPI('submit', { id }, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-templates'] });
      toast.success('تم إرسال القالب للموافقة من Meta');
    },
    onError: (error: Error) => {
      toast.error(`فشل الإرسال: ${error.message}`);
    },
  });

  // Sync from Meta
  const syncMutation = useMutation({
    mutationFn: () => callTemplatesAPI('sync', {}, {}),
    onSuccess: (result: any) => {
      queryClient.invalidateQueries({ queryKey: ['wa-templates'] });
      toast.success(result.message || 'تمت المزامنة بنجاح');
    },
    onError: (error: Error) => {
      toast.error(`فشلت المزامنة: ${error.message}`);
    },
  });

  // Delete template
  const deleteMutation = useMutation({
    mutationFn: (id: string) => callTemplatesAPI('delete', { id }, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wa-templates'] });
      toast.success('تم حذف القالب');
    },
    onError: (error: Error) => {
      toast.error(`فشل الحذف: ${error.message}`);
    },
  });

  return {
    templates: data?.templates || [],
    total: data?.total || 0,
    stats: data?.stats || {
      total: 0,
      draft: 0,
      submitted: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      paused: 0,
      disabled: 0,
      quality_high: 0,
      quality_medium: 0,
      quality_low: 0,
    },
    isLoading,
    error,
    refetch,
    getTemplate,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    submitToMeta: submitMutation.mutateAsync,
    syncFromMeta: syncMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isSubmitting: submitMutation.isPending,
    isSyncing: syncMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
