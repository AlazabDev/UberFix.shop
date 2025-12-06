// نظام تعيين الأيقونات والألوان للفنيين
// Technician icon and color mapping system

export interface SpecializationStyle {
  icon: string;
  color: string;
  label: string;
}

// الأيقونات المرفقة من المستخدم - بدون أي تعديل
export const getTechnicianIcon = (specialization: string): string => {
  const spec = specialization?.toLowerCase() || "";
  
  if (spec.includes("كهرب") || spec.includes("elect")) {
    return '/icons/technicians/tec-03.png'; // كهربائي
  } else if (spec.includes("سباك") || spec.includes("plumb")) {
    return '/icons/technicians/tec-05.png'; // سباك
  } else if (spec.includes("تكييف") || spec.includes("ac") || spec.includes("hvac")) {
    return '/icons/technicians/tec-06.png'; // تكييف
  } else if (spec.includes("نجار") || spec.includes("carp")) {
    return '/icons/technicians/tec-04.png'; // نجار
  } else if (spec.includes("دهان") || spec.includes("paint")) {
    return '/icons/technicians/tec-07.png'; // دهان
  } else if (spec.includes("سلم") || spec.includes("ladder") || spec.includes("أعمال")) {
    return '/icons/technicians/tec-12.png'; // أعمال عامة
  } else if (spec.includes("صيانة") || spec.includes("maint")) {
    return '/icons/technicians/tec-09.png'; // صيانة
  }
  return '/icons/technicians/tec-01.png'; // افتراضي
};

// أيقونة الفروع الموحدة
export const getBranchIcon = (): string => {
  return '/icons/branches/branch-icon.png';
};

export const getSpecializationStyle = (specialization: string): SpecializationStyle => {
  const styleMap: Record<string, SpecializationStyle> = {
    plumber: {
      icon: '/icons/technicians/tec-05.png',
      color: '#FF8C00',
      label: 'سباك'
    },
    electrician: {
      icon: '/icons/technicians/tec-03.png',
      color: '#FFD700',
      label: 'كهربائي'
    },
    carpenter: {
      icon: '/icons/technicians/tec-04.png',
      color: '#D2691E',
      label: 'نجار'
    },
    painter: {
      icon: '/icons/technicians/tec-07.png',
      color: '#20B2AA',
      label: 'دهان'
    },
    ac_technician: {
      icon: '/icons/technicians/tec-06.png',
      color: '#1E90FF',
      label: 'فني تكييف'
    },
    general_maintenance: {
      icon: '/icons/technicians/tec-09.png',
      color: '#9370DB',
      label: 'صيانة عامة'
    }
  };

  return styleMap[specialization] || {
    icon: '/icons/technicians/tec-01.png',
    color: '#808080',
    label: specialization
  };
};

export const getSpecializationIcon = (specialization: string): string => {
  return getSpecializationStyle(specialization).icon;
};

export const getSpecializationColor = (specialization: string): string => {
  return getSpecializationStyle(specialization).color;
};

export const getSpecializationLabel = (specialization: string): string => {
  return getSpecializationStyle(specialization).label;
};
