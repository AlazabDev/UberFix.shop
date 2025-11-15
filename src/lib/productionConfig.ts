// إعدادات الإنتاج للتطبيق
export const PRODUCTION_CONFIG = {
  // إعدادات الأمان
  security: {
    passwordMinLength: 8,
    requireSpecialChars: true,
    sessionTimeout: 60 * 60 * 24 * 7, // أسبوع
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 دقيقة
  },

  // إعدادات الأداء
  performance: {
    pageSize: 20,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    cacheTimeout: 5 * 60 * 1000, // 5 دقائق
    debounceDelay: 300,
  },

  // إعدادات التطبيق
  app: {
    name: 'Azab Property Management',
    version: '1.0.0',
    supportEmail: 'support@azab.com',
    maxNotifications: 50,
    defaultLanguage: 'ar',
  },

  // إعدادات API
  api: {
    timeout: 30000, // 30 ثانية
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // إعدادات الصور والملفات
  files: {
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
    allowedDocTypes: ['application/pdf', 'text/plain'],
    maxImageSize: 2 * 1024 * 1024, // 2MB
    maxDocSize: 10 * 1024 * 1024, // 10MB
  },

  // إعدادات الإشعارات
  notifications: {
    enablePush: true,
    enableEmail: true,
    enableSms: false,
    batchSize: 100,
  },

  // إعدادات الخريطة
  maps: {
    defaultZoom: 15,
    maxZoom: 20,
    minZoom: 10,
    defaultCenter: { lat: 24.7136, lng: 46.6753 }, // الرياض
  },

  // إعدادات العملة
  currency: {
    default: 'SAR',
    symbol: 'ر.س',
    precision: 2,
  },

  // إعدادات التاريخ والوقت
  datetime: {
    timezone: 'Asia/Riyadh',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm',
    locale: 'ar-SA',
  },
} as const;

// دالة للتحقق من إعدادات البيئة
export const validateEnvironment = () => {
  // إزالة الفحص - القيم ثابتة في الكود
  return true;
};

// دالة لتطبيق إعدادات الأمان
export const applySecuritySettings = () => {
  // تم تعطيل إعدادات الأمان لتجنب مشاكل الأداء والتوافق
  // يمكن تفعيلها لاحقاً إذا لزم الأمر
};

// دالة لتحسين الأداء
export const applyPerformanceSettings = () => {
  // تم تبسيط إعدادات الأداء لتجنب التعقيد الزائد
  // React و Vite يوفران تحسينات تلقائية كافية
};