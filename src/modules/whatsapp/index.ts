/**
 * WhatsApp Module
 * ================
 * Module مركزي لجميع خدمات WhatsApp
 * 
 * @example
 * import { whatsappApi, useWhatsAppMessages, useWhatsAppMedia } from '@/modules/whatsapp';
 * 
 * // استخدام API مباشرة
 * const result = await whatsappApi.messages.sendText('+201234567890', 'مرحباً');
 * 
 * // استخدام Hooks
 * const { sendText, isSending } = useWhatsAppMessages();
 * await sendText('+201234567890', 'مرحباً');
 */

// API
export { 
  whatsappApi,
  messagesApi,
  templatesApi,
  mediaApi,
  configApi,
  type SendMessageParams,
  type SendMessageResponse,
  type MediaFile,
  type MediaFilters,
  type MediaListResponse,
  type TemplateFilters,
  type ConfigStatus,
  type MessageType,
} from './api/whatsappApi';

// Hooks
export {
  useWhatsAppMessages,
  useWhatsAppMedia,
  useWhatsAppConfig,
  useWhatsAppTemplates,
  useWhatsAppNotifications,
  type UseWhatsAppMessagesReturn,
  type UseWhatsAppMediaReturn,
  type UseWhatsAppConfigReturn,
} from './hooks';

// Components - سيتم إضافتها لاحقاً
// export { WhatsAppMediaPage } from './pages/WhatsAppMediaPage';
