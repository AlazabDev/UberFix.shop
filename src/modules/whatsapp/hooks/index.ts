/**
 * WhatsApp Hooks Export
 * =====================
 * تصدير جميع hooks الخاصة بـ WhatsApp Module
 */

export { useWhatsAppMessages, type UseWhatsAppMessagesReturn } from './useWhatsAppMessages';
export { useWhatsAppMedia, type UseWhatsAppMediaReturn } from './useWhatsAppMedia';
export { useWhatsAppConfig, type UseWhatsAppConfigReturn } from './useWhatsAppConfig';

// إعادة تصدير الـ hooks الموجودة للتوافق مع الكود القديم
export { useWhatsAppTemplates } from '@/hooks/useWhatsAppTemplates';
export { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';
