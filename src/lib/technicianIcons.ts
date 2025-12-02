// نظام تعيين الأيقونات والألوان للفنيين
// Technician icon and color mapping system

export interface SpecializationStyle {
  icon: string;
  color: string;
  label: string;
}

export const getSpecializationStyle = (specialization: string): SpecializationStyle => {
  const styleMap: Record<string, SpecializationStyle> = {
    plumber: {
      icon: '/icons/pin-pro/pin-pro-2.svg',
      color: '#FF8C00', // برتقالي
      label: 'سباك'
    },
    electrician: {
      icon: '/icons/pin-pro/pin-pro-3.svg',
      color: '#FFD700', // أصفر ذهبي
      label: 'كهربائي'
    },
    carpenter: {
      icon: '/icons/pin-pro/pin-pro-4.svg',
      color: '#D2691E', // بني
      label: 'نجار'
    },
    painter: {
      icon: '/icons/pin-pro/pin-pro-5.svg',
      color: '#20B2AA', // فيروزي
      label: 'دهان'
    },
    ac_technician: {
      icon: '/icons/pin-pro/pin-pro-6.svg',
      color: '#1E90FF', // أزرق فاتح
      label: 'فني تكييف'
    },
    general_maintenance: {
      icon: '/icons/pin-pro/pin-pro-7.svg',
      color: '#9370DB', // بنفسجي
      label: 'صيانة عامة'
    }
  };

  return styleMap[specialization] || {
    icon: '/icons/default-pin.png',
    color: '#808080',
    label: specialization
  };
};

// تعيين الأيقونات حسب التخصص
export const getSpecializationIcon = (specialization: string): string => {
  return getSpecializationStyle(specialization).icon;
};

// تعيين اللون حسب التخصص
export const getSpecializationColor = (specialization: string): string => {
  return getSpecializationStyle(specialization).color;
};

// تعيين التسمية العربية حسب التخصص
export const getSpecializationLabel = (specialization: string): string => {
  return getSpecializationStyle(specialization).label;
};
