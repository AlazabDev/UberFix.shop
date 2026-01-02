/**
 * نظام الإشعارات المبني على الأحداث (Event-Driven Notification System)
 * مربوط بدورة حياة طلب الصيانة
 * 
 * القاعدة الحاكمة: كل تغيير حالة مؤثّر على العميل = إشعار واحد فقط
 */

export type NotificationChannel = 'email' | 'whatsapp';

export type NotificationStatus = 
  | 'received'      // تم استلام الطلب
  | 'reviewed'      // تمت المراجعة الفنية
  | 'scheduled'     // تم تحديد الموعد
  | 'on_the_way'    // الفني في الطريق
  | 'in_progress'   // جاري التنفيذ
  | 'completed'     // تم الانتهاء
  | 'closed';       // تم الإغلاق

export interface NotificationTemplate {
  status: NotificationStatus;
  channels: NotificationChannel[];
  email?: {
    subject: string;
    bodyTemplate: string;
    buttonText: string;
  };
  whatsapp?: {
    template: string;
    buttonText: string;
  };
}

/**
 * قوالب الإشعارات لكل حالة
 */
export const NOTIFICATION_TEMPLATES: Record<NotificationStatus, NotificationTemplate> = {
  received: {
    status: 'received',
    channels: ['email', 'whatsapp'],
    email: {
      subject: 'تم استلام طلب الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم استلام طلب الصيانة الخاص بك بنجاح.
رقم الطلب: {{order_id}}
سنقوم بمراجعته والعودة إليك بالتحديثات.`,
      buttonText: 'تتبّع طلب الصيانة',
    },
    whatsapp: {
      template: `تم استلام طلب الصيانة بنجاح ✅
رقم الطلب: {{order_id}}
يمكنك متابعة حالة الطلب من هنا 👇`,
      buttonText: 'تتبّع الطلب',
    },
  },

  reviewed: {
    status: 'reviewed',
    channels: ['email'],
    email: {
      subject: 'تمت مراجعة طلب الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تمت مراجعة طلب الصيانة وجارٍ تجهيز التفاصيل اللازمة.`,
      buttonText: 'عرض حالة الطلب',
    },
  },

  scheduled: {
    status: 'scheduled',
    channels: ['email', 'whatsapp'],
    email: {
      subject: 'تم تحديد موعد الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم تحديد موعد الزيارة كما يلي:
📅 {{date}} — ⏰ {{time}}`,
      buttonText: 'عرض / تغيير الموعد',
    },
    whatsapp: {
      template: `تم تحديد موعد الصيانة 🗓
📅 {{date}} — ⏰ {{time}}
لمراجعة التفاصيل أو تغيير الموعد:`,
      buttonText: 'إدارة الموعد',
    },
  },

  on_the_way: {
    status: 'on_the_way',
    channels: ['whatsapp'],
    whatsapp: {
      template: `الفني في الطريق إليك الآن 🚚
يمكنك متابعة الحالة لحظة بلحظة من هنا:`,
      buttonText: 'تتبّع الفني',
    },
  },

  in_progress: {
    status: 'in_progress',
    channels: ['whatsapp'],
    whatsapp: {
      template: `بدأ تنفيذ أعمال الصيانة 🛠
في حال احتجت أي تواصل أثناء التنفيذ:`,
      buttonText: 'التواصل مع الفني',
    },
  },

  completed: {
    status: 'completed',
    channels: ['email', 'whatsapp'],
    email: {
      subject: 'تم الانتهاء من أعمال الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم الانتهاء من أعمال الصيانة بنجاح.
يرجى مراجعة الأعمال واعتماد الإغلاق.`,
      buttonText: 'اعتماد الإغلاق',
    },
    whatsapp: {
      template: `تم الانتهاء من الصيانة ✅
يرجى مراجعة الأعمال واعتماد الإغلاق:`,
      buttonText: 'اعتماد الإغلاق',
    },
  },

  closed: {
    status: 'closed',
    channels: ['email'],
    email: {
      subject: 'تم إغلاق طلب الصيانة',
      bodyTemplate: `مرحبًا {{customer_name}}،
تم إغلاق طلب الصيانة بنجاح.
نشكرك على ثقتك في UberFix.`,
      buttonText: 'تقييم الخدمة',
    },
  },
};

/**
 * تحويل مرحلة سير العمل إلى حالة الإشعار
 */
export const workflowStageToNotificationStatus = (stage: string): NotificationStatus | null => {
  const mapping: Record<string, NotificationStatus> = {
    'submitted': 'received',
    'acknowledged': 'reviewed',
    'assigned': 'reviewed',
    'scheduled': 'scheduled',
    'in_progress': 'in_progress',
    'inspection': 'in_progress',
    'completed': 'completed',
    'closed': 'closed',
    'paid': 'closed',
  };
  
  return mapping[stage] || null;
};

/**
 * الحالات التي لا تُرسل إشعارات
 */
export const SILENT_STAGES = [
  'draft',
  'waiting_parts',
  'on_hold',
  'cancelled',
  'billed',
];

/**
 * التحقق مما إذا كانت المرحلة تتطلب إشعار
 */
export const shouldSendNotification = (stage: string): boolean => {
  return !SILENT_STAGES.includes(stage);
};

/**
 * الحصول على قالب الإشعار للمرحلة
 */
export const getNotificationTemplate = (stage: string): NotificationTemplate | null => {
  const status = workflowStageToNotificationStatus(stage);
  if (!status) return null;
  return NOTIFICATION_TEMPLATES[status];
};

/**
 * بناء رابط التتبع
 */
export const buildTrackUrl = (orderId: string): string => {
  return `/track/${orderId}`;
};

/**
 * استبدال المتغيرات في القالب
 */
export const replaceTemplateVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value || '');
  });
  return result;
};
