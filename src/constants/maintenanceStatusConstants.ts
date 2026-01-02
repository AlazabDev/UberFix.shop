/**
 * ثوابت حالات طلبات الصيانة
 * توحيد القيم بين قاعدة البيانات وواجهة المستخدم
 */

// حالات قاعدة البيانات (mr_status enum)
export type DatabaseStatus = 'Open' | 'In Progress' | 'Completed' | 'Closed' | 'Cancelled';

// مراحل سير العمل
export type WorkflowStage = 
  | 'draft' | 'submitted' | 'acknowledged' | 'assigned' 
  | 'scheduled' | 'in_progress' | 'inspection' | 'waiting_parts'
  | 'completed' | 'billed' | 'paid' | 'closed' | 'on_hold' | 'cancelled';

// خريطة الحالات من قاعدة البيانات إلى العرض
export const STATUS_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  // حالات قاعدة البيانات الأساسية
  'Open': { 
    label: 'مفتوح', 
    color: 'text-warning',
    bgColor: 'bg-warning/10 border-warning/20'
  },
  'In Progress': { 
    label: 'قيد التنفيذ', 
    color: 'text-info',
    bgColor: 'bg-info/10 border-info/20'
  },
  'Completed': { 
    label: 'مكتمل', 
    color: 'text-success',
    bgColor: 'bg-success/10 border-success/20'
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

// خريطة مراحل سير العمل
export const WORKFLOW_STAGE_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
  'draft': { label: 'مسودة', color: 'text-muted-foreground', bgColor: 'bg-muted/50 border-muted' },
  'submitted': { label: 'مُقدم', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/20' },
  'acknowledged': { label: 'تم الاستلام', color: 'text-info', bgColor: 'bg-info/10 border-info/20' },
  'assigned': { label: 'تم التعيين', color: 'text-primary', bgColor: 'bg-primary/10 border-primary/20' },
  'scheduled': { label: 'مجدول', color: 'text-info', bgColor: 'bg-info/10 border-info/20' },
  'in_progress': { label: 'قيد التنفيذ', color: 'text-info', bgColor: 'bg-info/10 border-info/20' },
  'inspection': { label: 'تحت الفحص', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/20' },
  'waiting_parts': { label: 'بانتظار قطع غيار', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/20' },
  'completed': { label: 'مكتمل', color: 'text-success', bgColor: 'bg-success/10 border-success/20' },
  'billed': { label: 'تم إصدار فاتورة', color: 'text-success', bgColor: 'bg-success/10 border-success/20' },
  'paid': { label: 'مدفوع', color: 'text-success', bgColor: 'bg-success/10 border-success/20' },
  'closed': { label: 'مغلق', color: 'text-muted-foreground', bgColor: 'bg-muted/50 border-muted' },
  'on_hold': { label: 'معلق', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/20' },
  'cancelled': { label: 'ملغي', color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/20' },
};

// الحالات المتاحة للفلترة (باستخدام قيم قاعدة البيانات)
export const FILTER_STATUS_OPTIONS = [
  { value: 'all', label: 'كل الحالات' },
  { value: 'Open', label: 'مفتوح' },
  { value: 'In Progress', label: 'قيد التنفيذ' },
  { value: 'Completed', label: 'مكتمل' },
  { value: 'Closed', label: 'مغلق' },
  { value: 'Cancelled', label: 'ملغي' },
];

// الأولويات
export const PRIORITY_MAP: Record<string, { label: string; color: string; bgColor: string }> = {
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

export const FILTER_PRIORITY_OPTIONS = [
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
  // أيضاً دعم القيم العربية المباشرة
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
export function getStatusConfig(status: string | null | undefined) {
  if (!status) return STATUS_MAP['Open'];
  return STATUS_MAP[status] || { 
    label: status, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted'
  };
}

// دالة للحصول على بيانات مرحلة سير العمل
export function getWorkflowStageConfig(stage: string | null | undefined) {
  if (!stage) return WORKFLOW_STAGE_MAP['draft'];
  return WORKFLOW_STAGE_MAP[stage] || { 
    label: stage, 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50 border-muted'
  };
}

// دالة للحصول على بيانات الأولوية
export function getPriorityConfig(priority: string | null | undefined) {
  if (!priority) return PRIORITY_MAP['medium'];
  return PRIORITY_MAP[priority] || PRIORITY_MAP['medium'];
}

// دالة للحصول على ترجمة نوع الخدمة
export function getServiceTypeLabel(serviceType: string | null | undefined): string {
  if (!serviceType) return 'غير محدد';
  return SERVICE_TYPE_MAP[serviceType] || serviceType;
}
