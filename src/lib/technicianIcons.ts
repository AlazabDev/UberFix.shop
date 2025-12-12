// ========================================
// TECHNICIAN ICONS - RE-EXPORTS FROM UNIFIED CONSTANTS
// ========================================
// This file is kept for backward compatibility
// All icons and colors are now defined in src/constants/technicianConstants.ts

export {
  getSpecializationIcon,
  getSpecializationColor,
  getSpecializationLabel,
  getSpecializationEmoji,
  getTechnicianIconByText,
  getBranchIcon,
  SPECIALIZATIONS,
} from '@/constants/technicianConstants';

// Legacy alias for backward compatibility
export const getTechnicianIcon = (specialization: string): string => {
  const { getTechnicianIconByText } = require('@/constants/technicianConstants');
  return getTechnicianIconByText(specialization);
};

// Interface for type compatibility
export interface SpecializationStyle {
  icon: string;
  color: string;
  label: string;
}

// Legacy function - now uses unified constants
export const getSpecializationStyle = (specialization: string): SpecializationStyle => {
  const { SPECIALIZATIONS } = require('@/constants/technicianConstants');
  const spec = SPECIALIZATIONS[specialization as keyof typeof SPECIALIZATIONS];
  
  if (spec) {
    return {
      icon: spec.icon,
      color: spec.color,
      label: spec.label,
    };
  }
  
  return {
    icon: '/icons/technicians/tec-01.png',
    color: '#808080',
    label: specialization,
  };
};
