// ========================================
// TECHNICIAN MODULE - UNIFIED CONSTANTS
// ========================================

// Technician Status
export const TECHNICIAN_STATUS = {
  online: { value: 'online', label: 'متاح الآن', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', mapLabel: 'available' },
  busy: { value: 'busy', label: 'مشغول حالياً', color: 'bg-red-50 text-red-700 border-red-200', mapLabel: 'busy' },
  offline: { value: 'offline', label: 'غير متاح', color: 'bg-gray-50 text-gray-700 border-gray-200', mapLabel: 'offline' },
  on_route: { value: 'on_route', label: 'في الطريق', color: 'bg-amber-50 text-amber-700 border-amber-200', mapLabel: 'soon' },
} as const;

// Specializations - synced with specialization_icons table
// Unified with icons from /icons/technicians/ and colors
export const SPECIALIZATIONS = {
  electrician: { 
    id: 'electrician', 
    label: 'كهربائي', 
    labelAr: 'كهرباء',
    emoji: '⚡', 
    icon: '/icons/technicians/tec-03.png',
    color: '#FFD700',
    keywords: ['كهرب', 'elect'] 
  },
  plumber: { 
    id: 'plumber', 
    label: 'سباك', 
    labelAr: 'سباكة',
    emoji: '🚿', 
    icon: '/icons/technicians/tec-05.png',
    color: '#FF8C00',
    keywords: ['سباك', 'plumb'] 
  },
  ac_technician: { 
    id: 'ac_technician', 
    label: 'فني تكييف', 
    labelAr: 'تكييف',
    emoji: '❄️', 
    icon: '/icons/technicians/tec-06.png',
    color: '#1E90FF',
    keywords: ['تكييف', 'ac', 'hvac'] 
  },
  carpenter: { 
    id: 'carpenter', 
    label: 'نجار', 
    labelAr: 'نجارة',
    emoji: '🪵', 
    icon: '/icons/technicians/tec-04.png',
    color: '#D2691E',
    keywords: ['نجار', 'carp'] 
  },
  painter: { 
    id: 'painter', 
    label: 'دهان', 
    labelAr: 'دهانات',
    emoji: '🎨', 
    icon: '/icons/technicians/tec-07.png',
    color: '#20B2AA',
    keywords: ['دهان', 'paint'] 
  },
  general: { 
    id: 'general', 
    label: 'صيانة عامة', 
    labelAr: 'صيانة عامة',
    emoji: '🛠️', 
    icon: '/icons/technicians/tec-09.png',
    color: '#9370DB',
    keywords: ['عام', 'general', 'صيانة', 'maint'] 
  },
} as const;

// Technician Levels
export const TECHNICIAN_LEVELS = {
  technician: { value: 'technician', label: 'فني', color: 'from-gray-600 to-gray-700', icon: '🔧' },
  pro: { value: 'pro', label: 'فني محترف', color: 'from-blue-600 to-cyan-600', icon: '⭐' },
  elite: { value: 'elite', label: 'فني مميز', color: 'from-purple-600 to-pink-600', icon: '👑' },
} as const;

// Badge Types
export const BADGE_TYPES = {
  gold_monthly: { value: 'gold_monthly', label: 'الذهبي الشهري', icon: '🏆' },
  crown_annual: { value: 'crown_annual', label: 'التاج السنوي', icon: '👑' },
  legacy: { value: 'legacy', label: 'الإرث', icon: '⭐' },
} as const;

// Application Status
export const APPLICATION_STATUS = {
  pending: { value: 'pending', label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-800' },
  approved: { value: 'approved', label: 'تم القبول', color: 'bg-emerald-100 text-emerald-800' },
  rejected: { value: 'rejected', label: 'مرفوض', color: 'bg-red-100 text-red-800' },
  verified: { value: 'verified', label: 'موثق', color: 'bg-blue-100 text-blue-800' },
} as const;

// Task Status
export const TASK_STATUS = {
  pending: { value: 'pending', label: 'بانتظار القبول', color: 'bg-gray-100 text-gray-800' },
  accepted: { value: 'accepted', label: 'تم القبول', color: 'bg-blue-100 text-blue-800' },
  rejected: { value: 'rejected', label: 'مرفوضة', color: 'bg-red-100 text-red-800' },
  in_progress: { value: 'in_progress', label: 'جاري العمل', color: 'bg-amber-100 text-amber-800' },
  completed: { value: 'completed', label: 'مكتملة', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { value: 'cancelled', label: 'ملغاة', color: 'bg-gray-100 text-gray-800' },
} as const;

// Types
export type TechnicianStatus = keyof typeof TECHNICIAN_STATUS;
export type Specialization = keyof typeof SPECIALIZATIONS;
export type TechnicianLevel = keyof typeof TECHNICIAN_LEVELS;
export type BadgeType = keyof typeof BADGE_TYPES;
export type ApplicationStatus = keyof typeof APPLICATION_STATUS;
export type TaskStatus = keyof typeof TASK_STATUS;

// Helper Functions
export const getTechnicianStatusLabel = (status: string): string => {
  return TECHNICIAN_STATUS[status as TechnicianStatus]?.label || status;
};

export const getTechnicianStatusColor = (status: string): string => {
  return TECHNICIAN_STATUS[status as TechnicianStatus]?.color || 'bg-gray-100 text-gray-800';
};

export const getSpecializationLabel = (spec: string): string => {
  return SPECIALIZATIONS[spec as Specialization]?.label || spec;
};

export const getSpecializationEmoji = (spec: string): string => {
  return SPECIALIZATIONS[spec as Specialization]?.emoji || '🛠️';
};

export const getSpecializationIcon = (spec: string): string => {
  return SPECIALIZATIONS[spec as Specialization]?.icon || '/icons/technicians/tec-01.png';
};

export const getSpecializationColor = (spec: string): string => {
  return SPECIALIZATIONS[spec as Specialization]?.color || '#808080';
};

// Helper to get icon based on specialization text (for dynamic matching)
export const getTechnicianIconByText = (specialization: string): string => {
  const spec = specialization?.toLowerCase() || "";
  
  for (const [key, value] of Object.entries(SPECIALIZATIONS)) {
    if (value.keywords.some(kw => spec.includes(kw))) {
      return value.icon;
    }
  }
  return '/icons/technicians/tec-01.png';
};

// Branch icon
export const getBranchIcon = (): string => '/icons/branches/branch-icon.png';

export const getTechnicianLevelInfo = (level: string) => {
  return TECHNICIAN_LEVELS[level as TechnicianLevel] || TECHNICIAN_LEVELS.technician;
};

export const mapStatusToMapLabel = (status: string): 'available' | 'busy' | 'soon' => {
  const mapLabel = TECHNICIAN_STATUS[status as TechnicianStatus]?.mapLabel;
  if (mapLabel === 'available' || mapLabel === 'busy' || mapLabel === 'soon') {
    return mapLabel;
  }
  return 'soon';
};

// Lists for dropdowns
export const TECHNICIAN_STATUS_LIST = Object.values(TECHNICIAN_STATUS);
export const SPECIALIZATIONS_LIST = Object.values(SPECIALIZATIONS);
export const TECHNICIAN_LEVELS_LIST = Object.values(TECHNICIAN_LEVELS);
export const TASK_STATUS_LIST = Object.values(TASK_STATUS);
