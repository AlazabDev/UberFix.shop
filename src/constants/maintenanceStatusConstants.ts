/**
 * ثوابت حالات طلبات الصيانة
 * توحيد القيم بين قاعدة البيانات وواجهة المستخدم
 * 
 * المصدر الوحيد للحقيقة: src/types/maintenance.ts (MrStatus)
 * DB enum mr_status: Open | Assigned | InProgress | In Progress | Waiting | On Hold | Completed | Rejected | Closed | Cancelled
 */
import type { MrStatus, StatusDisplayConfig } from "@/types/maintenance";

// Re-export WorkflowStage from workflowStages for backward compat
export type { WorkflowStage } from "@/constants/workflowStages";

// خريطة الحالات من قاعدة البيانات إلى العرض (تدعم جميع قيم الـ enum)
export const STATUS_MAP: Record<string, StatusDisplayConfig> = {
  'Open': { 
    label: 'مفتوح', 
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20'
  },
  'Assigned': { 
    label: 'تم التعيين', 
    color: 'text-primary',
    bgColor: 'bg-primary/10 border-primary/20'
  },
  'In Progress': { 
    label: 'قيد التنفيذ', 
    color: 'text-info',
    bgColor: 'bg-info/10 border-info/20'
  },
  'InProgress': { 
    label: 'قيد التنفيذ', 
    color: 'text-info',
    bgColor: 'bg-info/10 border-info/20'
  },
  'On Hold': { 
    label: 'معلق', 
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20'
  },
  'Waiting': { 
    label: 'معلق', 
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20'
  },
  'Completed': { 
    label: 'مكتمل', 
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/20'
  },
  'Rejected': { 
    label: 'مرفوض', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/20'
  },
  'Closed': { 
    label: 'مغلق', 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted'
  },
  'Cancelled': { 
    label: 'ملغي', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/20'
  },
};

// خريطة مراحل سير العمل - مشتقة من المصدر الوحيد workflowStages.ts
// يُستخدم فقط في RequestStatusBadge للتوافق مع StatusDisplayConfig
import { WORKFLOW_STAGES as WF_STAGES } from "@/constants/workflowStages";

export const WORKFLOW_STAGE_MAP: Record<string, StatusDisplayConfig> = Object.fromEntries(
  Object.entries(WF_STAGES).map(([key, config]) => [
    key,
    { label: config.label, color: config.textColor, bgColor: `${config.bgColor.replace('bg-', 'bg-')}/10 border-${config.bgColor.replace('bg-', '')}/20` }
  ])
);

// الحالات المتاحة للفلترة (باستخدام قيم قاعدة البيانات الفعلية)
export const FILTER_STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'Open', label: 'مفتوح' },
  { value: 'Assigned', label: 'تم التعيين' },
  { value: 'In Progress', label: 'قيد التنفيذ' },
  { value: 'On Hold', label: 'معلق' },
  { value: 'Completed', label: 'مكتمل' },
  { value: 'Rejected', label: 'مرفوض' },
  { value: 'Closed', label: 'مغلق' },
  { value: 'Cancelled', label: 'ملغي' },
];

// الأولويات
export const PRIORITY_MAP: Record<string, StatusDisplayConfig> = {
  'low': { 
    label: 'منخفضة', 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted'
  },
  'medium': { 
    label: 'متوسطة', 
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20'
  },
  'high': { 
    label: 'عالية', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10 border-destructive/20'
  },
  'urgent': { 
    label: 'عاجلة', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/20 border-destructive/30'
  },
};

export const FILTER_PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'كل الأولويات' },
  { value: 'low', label: 'منخفضة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'high', label: 'عالية' },
  { value: 'urgent', label: 'عاجلة' },
];

// أنواع الخدمات (عربي وإنجليزي)
export const SERVICE_TYPE_MAP: Record<string, string> = {
  'plumbing': 'سباكة',
  'electrical': 'كهرباء',
  'hvac': 'تكييف',
  'general': 'صيانة عامة',
  'cleaning': 'نظافة',
  'painting': 'طلاء',
  'carpentry': 'نجارة',
  'other': 'أخرى',
  'سباكة': 'سباكة',
  'كهرباء': 'كهرباء',
  'تكييف': 'تكييف',
  'صيانة عامة': 'صيانة عامة',
  'نظافة': 'نظافة',
  'طلاء': 'طلاء',
  'نجارة': 'نجارة',
  'أخرى': 'أخرى',
};

// دالة للحصول على بيانات الحالة
export function getStatusConfig(status: string | null | undefined): StatusDisplayConfig {
  if (!status) return STATUS_MAP['Open'];
  return STATUS_MAP[status] || { 
    label: status, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted'
  };
}

// دالة للحصول على بيانات مرحلة سير العمل
export function getWorkflowStageConfig(stage: string | null | undefined): StatusDisplayConfig {
  if (!stage) return WORKFLOW_STAGE_MAP['draft'];
  return WORKFLOW_STAGE_MAP[stage] || { 
    label: stage, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted'
  };
}

// دالة للحصول على بيانات الأولوية
export function getPriorityConfig(priority: string | null | undefined): StatusDisplayConfig {
  if (!priority) return PRIORITY_MAP['medium'];
  return PRIORITY_MAP[priority] || PRIORITY_MAP['medium'];
}

// دالة للحصول على ترجمة نوع الخدمة
export function getServiceTypeLabel(serviceType: string | null | undefined): string {
  if (!serviceType) return 'غير محدد';
  return SERVICE_TYPE_MAP[serviceType] || serviceType;
}
