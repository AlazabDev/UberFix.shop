# دليل نظام إرسال الإشعارات والفواتير عبر البريد الإلكتروني

## نظرة عامة

تم تطوير نظام متكامل لإرسال الإشعارات والفواتير عبر البريد الإلكتروني باستخدام خدمة Resend.

## إعدادات SMTP المفعلة

### معلومات الاتصال
- **Host**: `smtp.resend.com`
- **Port**: `465` أو `2465` (TLS) / `587` أو `2587`
- **Username**: `resend`
- **API Key**: `RESEND_API_KEY` (محفوظ في Secrets)

## Edge Functions المتاحة

### 1. إرسال إشعارات البريد الإلكتروني
**Function**: `send-email-notification`

#### أنواع الإشعارات المتاحة:
- `request_created`: تم إنشاء طلب صيانة جديد
- `status_update`: تحديث حالة الطلب
- `vendor_assigned`: تم تعيين فني
- `request_completed`: تم إنجاز الطلب

#### مثال على الاستخدام:
```typescript
await supabase.functions.invoke('send-email-notification', {
  body: {
    recipient_email: "customer@email.com",
    recipient_name: "أحمد محمد",
    notification_type: "request_created",
    request_id: "uuid-here",
    request_title: "إصلاح تسريب المياه",
    request_status: "Open",
    vendor_name: "محمد الفني",
    notes: "ملاحظات إضافية"
  }
});
```

### 2. إرسال الفواتير عبر البريد
**Function**: `send-invoice-email`

#### مثال على الاستخدام:
```typescript
await supabase.functions.invoke('send-invoice-email', {
  body: {
    customer_email: "customer@email.com",
    invoice: {
      id: "uuid",
      invoice_number: "INV-202501-001",
      customer_name: "أحمد محمد",
      customer_email: "customer@email.com",
      issue_date: "2025-01-01",
      due_date: "2025-01-15",
      status: "unpaid",
      total_amount: 500,
      currency: "EGP",
      payment_method: "cash",
      items: [
        {
          service_name: "إصلاح تسريب",
          description: "إصلاح تسريب في الحمام",
          quantity: 1,
          unit_price: 500,
          total_price: 500
        }
      ],
      notes: "شكراً لتعاملكم معنا"
    }
  }
});
```

## Hook المحدث: useNotifications

تم تحديث `useNotifications` لدعم إرسال البريد الإلكتروني تلقائياً:

```typescript
const { createNotification } = useNotifications();

// إنشاء إشعار مع إرسال بريد إلكتروني
await createNotification(
  {
    recipient_id: userId,
    title: "طلب جديد",
    message: "تم استلام طلبك",
    type: "success",
    entity_type: "maintenance_request",
    entity_id: requestId
  },
  true, // إرسال بريد إلكتروني
  {
    recipient_email: "customer@email.com",
    recipient_name: "أحمد",
    notification_type: "request_created",
    request_id: requestId,
    request_title: "إصلاح تسريب"
  }
);
```

## التصميم

### الألوان المستخدمة
- **اللون الأساسي**: `#f5bf23` (الأصفر)
- **اللون الثانوي**: `#111` (الأسود)
- **الخلفية**: `#fff` (الأبيض)

### المميزات
- تصميم responsive يعمل على جميع الأجهزة
- دعم كامل للغة العربية (RTL)
- تدرجات لونية احترافية
- أيقونات واضحة للحالات
- رابط مباشر لعرض التفاصيل

## الأمان

- جميع Edge Functions تستخدم CORS headers
- `send-email-notification`: `verify_jwt = false` (للسماح بالإرسال من النظام)
- `send-invoice-email`: `verify_jwt = false` (للسماح بإرسال الفواتير)

## متى يتم إرسال البريد الإلكتروني؟

### تلقائياً:
1. عند إنشاء طلب صيانة جديد
2. عند تحديث حالة الطلب
3. عند تعيين فني
4. عند إنجاز الطلب
5. عند إرسال فاتورة

### يدوياً:
يمكن استدعاء Edge Functions مباشرة من أي مكان في التطبيق.

## نصائح للاستخدام

1. **تأكد من صحة البريد الإلكتروني** قبل الإرسال
2. **استخدم notification_type المناسب** لكل حالة
3. **أضف ملاحظات واضحة** في حقل notes
4. **راجع Logs** في حالة فشل الإرسال
5. **اختبر البريد** قبل الإطلاق الفعلي

## مثال شامل - سيناريو كامل

```typescript
// 1. إنشاء طلب صيانة
const request = await createRequest({...});

// 2. إرسال إشعار بالبريد
await createNotification(
  {
    recipient_id: customerId,
    title: "تم استلام طلبك",
    message: "تم استلام طلب الصيانة بنجاح",
    type: "success",
    entity_type: "maintenance_request",
    entity_id: request.id
  },
  true,
  {
    recipient_email: customerEmail,
    recipient_name: customerName,
    notification_type: "request_created",
    request_id: request.id,
    request_title: request.title
  }
);

// 3. عند إنجاز العمل - إرسال فاتورة
await supabase.functions.invoke('send-invoice-email', {
  body: {
    customer_email: customerEmail,
    invoice: invoiceData
  }
});
```

## الدعم الفني

للمشاكل المتعلقة بإرسال البريد:
1. تحقق من Logs في Supabase
2. تأكد من صحة RESEND_API_KEY
3. تحقق من Domain Verification في Resend
4. راجع CORS settings

## الخطوات التالية

- [ ] إضافة قوالب بريد إضافية
- [ ] دعم المرفقات (PDF للفواتير)
- [ ] إحصائيات فتح البريد
- [ ] تخصيص القوالب حسب نوع العميل
