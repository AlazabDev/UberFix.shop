/**
 * WhatsApp API Service
 * =====================
 * خدمة مركزية للتواصل مع WhatsApp Edge Functions
 */

import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://zrrffsjbfkphridqyais.supabase.co";

// =====================================================
// Types
// =====================================================

export type MessageType = 'text' | 'template' | 'image' | 'video' | 'document' | 'audio';

export interface SendMessageParams {
  to: string;
  message?: string;
  type?: MessageType;
  templateName?: string;
  templateLanguage?: string;
  templateComponents?: Array<{
    type: string;
    parameters: Array<{ type: string; text?: string }>;
  }>;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  buttons?: Array<{ id: string; title: string }>;
  requestId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  to?: string;
  provider?: string;
  error?: string;
  details?: unknown;
}

export interface MediaFile {
  id: number;
  media_id: string;
  message_id: string;
  filename: string | null;
  file_type: string | null;
  mime_type: string | null;
  file_size: number | null;
  from_phone: string | null;
  direction: 'inbound' | 'outbound' | null;
  meta_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface MediaFilters {
  type?: string;
  direction?: 'inbound' | 'outbound';
  phone?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface MediaListResponse {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
}

export interface TemplateFilters {
  status?: string;
  category?: string;
  language?: string;
  search?: string;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface ConfigStatus {
  configured: boolean;
  hasAccessToken: boolean;
  hasPhoneNumberId: boolean;
  hasWabaId: boolean;
  hasVerifyToken: boolean;
  wabaIdValid: boolean;
}

// =====================================================
// Helper Functions
// =====================================================

async function getAuthToken(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Not authenticated');
  }
  return sessionData.session.access_token;
}

async function callEdgeFunction<T>(
  functionName: string,
  options: {
    method?: 'GET' | 'POST';
    body?: unknown;
    params?: Record<string, string>;
  } = {}
): Promise<T> {
  const token = await getAuthToken();
  const { method = 'GET', body, params } = options;
  
  const queryParams = params ? `?${new URLSearchParams(params)}` : '';
  const url = `${SUPABASE_URL}/functions/v1/${functionName}${queryParams}`;
  
  const res = await fetch(url, {
    method: body ? 'POST' : method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return res.json();
}

// =====================================================
// Messages API
// =====================================================

export const messagesApi = {
  /**
   * إرسال رسالة WhatsApp
   */
  async send(params: SendMessageParams): Promise<SendMessageResponse> {
    return callEdgeFunction<SendMessageResponse>('send-whatsapp-meta', {
      body: params,
    });
  },

  /**
   * إرسال رسالة باستخدام قالب
   */
  async sendTemplate(
    to: string,
    templateName: string,
    variables: string[],
    language = 'ar'
  ): Promise<SendMessageResponse> {
    const components = variables.length > 0 ? [
      {
        type: 'body',
        parameters: variables.map(text => ({ type: 'text', text })),
      },
    ] : [];

    return this.send({
      to,
      type: 'template',
      templateName,
      templateLanguage: language,
      templateComponents: components,
    });
  },

  /**
   * إرسال رسالة نصية بسيطة
   */
  async sendText(to: string, message: string): Promise<SendMessageResponse> {
    return this.send({ to, message, type: 'text' });
  },

  /**
   * إرسال رسالة وسائط
   */
  async sendMedia(
    to: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document' | 'audio',
    caption?: string
  ): Promise<SendMessageResponse> {
    return this.send({
      to,
      mediaUrl,
      mediaType,
      message: caption,
    });
  },
};

// =====================================================
// Templates API
// =====================================================

export const templatesApi = {
  /**
   * جلب قائمة القوالب
   */
  async list(filters: TemplateFilters) {
    const params: Record<string, string> = {
      action: 'list',
      page: String(filters.page),
      limit: String(filters.limit),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.language) params.language = filters.language;
    if (filters.search) params.search = filters.search;

    return callEdgeFunction('whatsapp-templates', { params });
  },

  /**
   * جلب قالب واحد
   */
  async get(id: string) {
    return callEdgeFunction('whatsapp-templates', {
      params: { action: 'get', id },
    });
  },

  /**
   * إنشاء قالب جديد
   */
  async create(template: Record<string, unknown>) {
    return callEdgeFunction('whatsapp-templates', {
      params: { action: 'create' },
      body: template,
    });
  },

  /**
   * تحديث قالب
   */
  async update(template: Record<string, unknown> & { id: string }) {
    return callEdgeFunction('whatsapp-templates', {
      params: { action: 'update' },
      body: template,
    });
  },

  /**
   * إرسال قالب لموافقة Meta
   */
  async submit(id: string) {
    return callEdgeFunction('whatsapp-templates', {
      params: { action: 'submit' },
      body: { id },
    });
  },

  /**
   * مزامنة القوالب من Meta
   */
  async sync() {
    return callEdgeFunction('whatsapp-templates', {
      params: { action: 'sync' },
      body: {},
    });
  },

  /**
   * حذف قالب
   */
  async delete(id: string) {
    return callEdgeFunction('whatsapp-templates', {
      params: { action: 'delete' },
      body: { id },
    });
  },
};

// =====================================================
// Media API
// =====================================================

export const mediaApi = {
  /**
   * جلب قائمة ملفات الوسائط
   */
  async list(filters: MediaFilters): Promise<MediaListResponse> {
    const { data, error, count } = await supabase
      .from('media_files')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((filters.page - 1) * filters.limit, filters.page * filters.limit - 1);

    if (error) throw error;

    return {
      files: (data || []) as MediaFile[],
      total: count || 0,
      page: filters.page,
      limit: filters.limit,
    };
  },

  /**
   * جلب ملف وسائط واحد
   */
  async get(id: number): Promise<MediaFile | null> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as MediaFile;
  },

  /**
   * حذف ملف وسائط
   */
  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * جلب إحصائيات الوسائط
   */
  async getStats() {
    const { data, error } = await supabase
      .from('media_stats_daily')
      .select('*')
      .order('date', { ascending: false })
      .limit(30);

    if (error) throw error;
    return data;
  },
};

// =====================================================
// Config API
// =====================================================

export const configApi = {
  /**
   * التحقق من حالة التكوين
   */
  async checkStatus(): Promise<ConfigStatus> {
    return callEdgeFunction<ConfigStatus>('whatsapp-templates', {
      params: { action: 'check-config' },
    });
  },
};

// =====================================================
// Default Export
// =====================================================

export const whatsappApi = {
  messages: messagesApi,
  templates: templatesApi,
  media: mediaApi,
  config: configApi,
};

export default whatsappApi;
