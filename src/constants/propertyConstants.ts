// ========================================
// PROPERTY MODULE - UNIFIED CONSTANTS
// ========================================

export const PROPERTY_TYPES = {
  residential: { value: 'residential', label: 'المشروع', icon: '🏠' },
  commercial: { value: 'commercial', label: 'الفرع', icon: '🏢' },
  office: { value: 'office', label: 'الوحدة', icon: '🏛️' },
  industrial: { value: 'industrial', label: 'المستودع', icon: '🏭' },
  mixed_use: { value: 'mixed_use', label: 'أخرى', icon: '🏗️' },
} as const;

export const PROPERTY_STATUS = {
  active: { value: 'active', label: 'نشط', color: 'bg-emerald-100 text-emerald-800' },
  inactive: { value: 'inactive', label: 'غير نشط', color: 'bg-gray-100 text-gray-800' },
  maintenance: { value: 'maintenance', label: 'تحت الصيانة', color: 'bg-amber-100 text-amber-800' },
} as const;

export type PropertyType = keyof typeof PROPERTY_TYPES;
export type PropertyStatus = keyof typeof PROPERTY_STATUS;

// Helper functions
export const getPropertyTypeLabel = (type: string): string => {
  return PROPERTY_TYPES[type as PropertyType]?.label || type;
};

export const getPropertyTypeIcon = (type: string): string => {
  return PROPERTY_TYPES[type as PropertyType]?.icon || '🏠';
};

export const getPropertyStatusLabel = (status: string): string => {
  return PROPERTY_STATUS[status as PropertyStatus]?.label || status;
};

export const getPropertyStatusColor = (status: string): string => {
  return PROPERTY_STATUS[status as PropertyStatus]?.color || 'bg-gray-100 text-gray-800';
};

export const PROPERTY_TYPES_LIST = Object.values(PROPERTY_TYPES);
export const PROPERTY_STATUS_LIST = Object.values(PROPERTY_STATUS);
