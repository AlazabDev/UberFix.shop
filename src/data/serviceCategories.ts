export interface ServiceCategory {
  id: string;
  name_ar: string;
  name_en: string;
  icon?: string;
}

export const serviceCategories: ServiceCategory[] = [
  { id: "plumbing", name_ar: "سباكة", name_en: "Plumbing", icon: "🔧" },
  { id: "electrical", name_ar: "كهرباء", name_en: "Electrical", icon: "⚡" },
  { id: "ac", name_ar: "تكييف وتبريد", name_en: "AC", icon: "❄️" },
  { id: "carpentry", name_ar: "نجارة", name_en: "Carpentry", icon: "🪚" },
  { id: "metalwork", name_ar: "حدادات", name_en: "Metalwork", icon: "🔨" },
  { id: "general", name_ar: "صيانة عامة", name_en: "General Maintenance", icon: "🛠️" },
  { id: "painting", name_ar: "دهان", name_en: "Painting", icon: "🎨" },
  { id: "cleaning", name_ar: "تنظيف", name_en: "Cleaning", icon: "🧹" },
  { id: "tiling", name_ar: "بلاط وسيراميك", name_en: "Tiling", icon: "🧱" },
  { id: "insulation", name_ar: "عزل", name_en: "Insulation", icon: "🛡️" },
  { id: "other", name_ar: "أخرى", name_en: "Other", icon: "➕" },
];

export const serviceCategoryLabelsAr = serviceCategories.map(({ id, name_ar, icon }) => ({
  id,
  label: name_ar,
  icon,
}));

export const serviceCategoryNamesAr = serviceCategories.map(({ name_ar }) => name_ar);
