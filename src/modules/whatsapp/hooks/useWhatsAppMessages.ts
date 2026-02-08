/**
 * WhatsApp Messages Hook
 * ======================
 * Hook لإدارة إرسال رسائل WhatsApp
 */

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { messagesApi, type SendMessageParams, type SendMessageResponse } from '../api/whatsappApi';

export interface UseWhatsAppMessagesReturn {
  // Actions
  sendMessage: (params: SendMessageParams) => Promise<SendMessageResponse>;
  sendText: (to: string, message: string) => Promise<SendMessageResponse>;
  sendTemplate: (to: string, templateName: string, variables?: string[], language?: string) => Promise<SendMessageResponse>;
  sendMedia: (to: string, mediaUrl: string, mediaType: 'image' | 'video' | 'document' | 'audio', caption?: string) => Promise<SendMessageResponse>;
  
  // State
  isSending: boolean;
  lastError: string | null;
  lastMessageId: string | null;
}

export function useWhatsAppMessages(): UseWhatsAppMessagesReturn {
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  const sendMutation = useMutation({
    mutationFn: (params: SendMessageParams) => messagesApi.send(params),
    onSuccess: (response) => {
      if (response.success) {
        setLastMessageId(response.messageId || null);
        setLastError(null);
        toast.success('تم إرسال الرسالة بنجاح');
      } else {
        setLastError(response.error || 'فشل الإرسال');
        toast.error(response.error || 'فشل إرسال الرسالة');
      }
    },
    onError: (error: Error) => {
      setLastError(error.message);
      toast.error(`خطأ: ${error.message}`);
    },
  });

  const sendMessage = useCallback(async (params: SendMessageParams) => {
    return sendMutation.mutateAsync(params);
  }, [sendMutation]);

  const sendText = useCallback(async (to: string, message: string) => {
    return sendMutation.mutateAsync({ to, message, type: 'text' });
  }, [sendMutation]);

  const sendTemplate = useCallback(async (
    to: string,
    templateName: string,
    variables: string[] = [],
    language = 'ar'
  ) => {
    const components = variables.length > 0 ? [
      {
        type: 'body',
        parameters: variables.map(text => ({ type: 'text', text })),
      },
    ] : [];

    return sendMutation.mutateAsync({
      to,
      type: 'template',
      templateName,
      templateLanguage: language,
      templateComponents: components,
    });
  }, [sendMutation]);

  const sendMedia = useCallback(async (
    to: string,
    mediaUrl: string,
    mediaType: 'image' | 'video' | 'document' | 'audio',
    caption?: string
  ) => {
    return sendMutation.mutateAsync({
      to,
      mediaUrl,
      mediaType,
      message: caption,
    });
  }, [sendMutation]);

  return {
    sendMessage,
    sendText,
    sendTemplate,
    sendMedia,
    isSending: sendMutation.isPending,
    lastError,
    lastMessageId,
  };
}

export default useWhatsAppMessages;
