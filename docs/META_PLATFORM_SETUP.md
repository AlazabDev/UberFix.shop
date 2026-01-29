# 🔧 دليل إعداد منصة Meta الشامل لـ UberFix

> **آخر تحديث:** يناير 2026  
> **الإصدار:** 2.0  
> **المشروع:** UberFix - نظام إدارة الصيانة

---

## 📋 الفهرس

1. [المعلومات الأساسية](#-المعلومات-الأساسية)
2. [إعداد Facebook Login](#-إعداد-facebook-login)
3. [إعداد WhatsApp Business API](#-إعداد-whatsapp-business-api)
4. [إعداد Webhook](#-إعداد-webhook)
5. [إعداد الأذونات والمراجعة](#-إعداد-الأذونات-والمراجعة)
6. [المشاكل الشائعة والحلول](#-المشاكل-الشائعة-والحلول)
7. [قائمة التحقق النهائية](#-قائمة-التحقق-النهائية)

---

## 📌 المعلومات الأساسية

### معرّفات المشروع

| العنصر | القيمة |
|--------|--------|
| **Facebook App ID** | `25094190933553883` |
| **WhatsApp Phone Number ID** | `644995285354639` |
| **Supabase Project ID** | `zrrffsjbfkphridqyais` |
| **Production Domain** | `uberfiix.lovable.app` |
| **Preview Domain** | `id-preview--c6adaf51-0eef-43e8-bf45-d65ac7ebe1aa.lovable.app` |

### الروابط المهمة

| الرابط | الوصف |
|--------|-------|
| `https://uberfiix.lovable.app` | الموقع الإنتاجي |
| `https://zrrffsjbfkphridqyais.supabase.co` | Supabase Project URL |
| `https://developers.facebook.com/apps/25094190933553883` | لوحة تحكم التطبيق على Meta |

---

## 🔐 إعداد Facebook Login

### الخطوة 1: الوصول إلى إعدادات Facebook Login

1. اذهب إلى: **Meta for Developers** → **Apps** → **UberFix App**
2. من القائمة الجانبية: **Use cases** → **Authenticate and request data from users with Facebook Login**
3. اضغط على **Customize** → **Settings**

### الخطوة 2: إعداد OAuth Redirect URIs

> ⚠️ **مهم جداً:** يجب إضافة جميع الروابط التالية بالضبط

#### Valid OAuth Redirect URIs (أضف كل هذه الروابط):

```
https://uberfiix.lovable.app/auth/callback
https://zrrffsjbfkphridqyais.supabase.co/auth/v1/callback
https://id-preview--c6adaf51-0eef-43e8-bf45-d65ac7ebe1aa.lovable.app/auth/callback
```

#### Deauthorize Callback URL:
```
https://uberfiix.lovable.app/auth/deauthorize
```

#### Data Deletion Request URL:
```
https://uberfiix.lovable.app/data-deletion
```

### الخطوة 3: إعدادات Client OAuth

| الإعداد | القيمة |
|---------|--------|
| Client OAuth login | ✅ مفعّل |
| Web OAuth login | ✅ مفعّل |
| Enforce HTTPS | ✅ مفعّل |
| Embedded browser OAuth Login | ❌ معطّل |
| Login from Devices | ❌ معطّل |

### 🔴 مشكلة شائعة: "URL is not allowed"

**السبب:** الرابط غير مضاف في Valid OAuth Redirect URIs

**الحل:**
1. تأكد من إضافة الرابط بالضبط (مع https://)
2. لا تضف / في نهاية الرابط
3. انتظر 5 دقائق بعد الحفظ
4. امسح cache المتصفح

---

## 📱 إعداد WhatsApp Business API

### الخطوة 1: إعداد WhatsApp Business Account

1. اذهب إلى: **Meta Business Suite** → **Settings** → **Business Settings**
2. اختر **WhatsApp accounts** من القائمة
3. تأكد من ربط حساب WhatsApp Business بالتطبيق

### الخطوة 2: الحصول على Access Token

#### الطريقة أ: Permanent Token (موصى به للإنتاج)

1. اذهب إلى: **Business Settings** → **Users** → **System Users**
2. أنشئ System User جديد باسم `UberFix API`
3. اختر Role: **Admin**
4. اضغط **Generate New Token**
5. اختر التطبيق: `UberFix`
6. حدد الأذونات التالية:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
7. اختر **Never expire** للـ Token Expiration
8. انسخ الـ Token واحفظه في Supabase Secrets

#### الطريقة ب: Temporary Token (للتطوير فقط)

1. اذهب إلى: **App Dashboard** → **WhatsApp** → **API Setup**
2. انسخ الـ Temporary access token
3. ⚠️ **تنبيه:** هذا التوكن ينتهي خلال 24 ساعة

### الخطوة 3: إعداد Phone Number

1. في **WhatsApp** → **API Setup**
2. تحقق من:
   - **Phone number ID:** `644995285354639`
   - **Display name:** اسم النشاط التجاري
   - **Phone number:** رقم الهاتف المسجل

### الخطوة 4: إعداد Message Templates

1. اذهب إلى: **WhatsApp** → **Message Templates**
2. أنشئ القوالب المطلوبة:

#### قالب: maintenance_update
```
Category: UTILITY
Language: Arabic (ar)

Header: 🔧 تحديث طلب الصيانة
Body: مرحباً {{1}}،
      تم تحديث حالة طلبك رقم {{2}}.
      الحالة الجديدة: {{3}}
Footer: UberFix - خدمة الصيانة السريعة
```

#### قالب: appointment_reminder
```
Category: UTILITY
Language: Arabic (ar)

Header: ⏰ تذكير بموعد
Body: مرحباً {{1}}،
      لديك موعد صيانة غداً في {{2}}.
      العنوان: {{3}}
Footer: UberFix
Buttons: [Quick Reply: "تأكيد"] [Quick Reply: "إلغاء"]
```

### 🔴 مشكلة شائعة: "Message failed to send"

**الأسباب المحتملة:**
1. **Token منتهي:** استخدم Permanent Token
2. **رقم غير مسجل:** العميل يجب أن يراسلك أولاً (في الـ 24 ساعة الأولى)
3. **Template غير معتمد:** انتظر موافقة Meta على القالب

**الحل:**
```javascript
// تحقق من حالة القالب قبل الإرسال
const templateStatus = await checkTemplateStatus('maintenance_update');
if (templateStatus !== 'APPROVED') {
  // استخدم رسالة نصية عادية بدلاً من القالب
}
```

---

## 🔗 إعداد Webhook

### الخطوة 1: تكوين Webhook URL

1. اذهب إلى: **App Dashboard** → **WhatsApp** → **Configuration**
2. في قسم **Webhook**:

| الحقل | القيمة |
|-------|--------|
| **Callback URL** | `https://zrrffsjbfkphridqyais.supabase.co/functions/v1/whatsapp-webhook` |
| **Verify Token** | (نفس قيمة `WHATSAPP_VERIFY_TOKEN` في Supabase) |

3. اضغط **Verify and Save**

### الخطوة 2: اختيار Webhook Fields

اختر الحقول التالية للاشتراك:

| الحقل | الوصف | مطلوب |
|-------|-------|-------|
| `messages` | استقبال الرسائل الواردة | ✅ |
| `message_status` | تحديثات حالة التسليم | ✅ |
| `message_echoes` | نسخ الرسائل المرسلة | اختياري |
| `message_template_status_update` | تحديثات حالة القوالب | اختياري |

### الخطوة 3: التحقق من عمل Webhook

```bash
# اختبار التحقق (GET request)
curl "https://zrrffsjbfkphridqyais.supabase.co/functions/v1/whatsapp-webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=test123"

# يجب أن يُرجع: test123
```

### 🔴 مشكلة شائعة: "Webhook verification failed"

**الأسباب:**
1. **Token غير متطابق:** تأكد من تطابق `WHATSAPP_VERIFY_TOKEN`
2. **الدالة غير منشورة:** انشر Edge Function أولاً
3. **CORS issues:** تحقق من headers

**الحل:**
```typescript
// تأكد من وجود هذا الكود في whatsapp-webhook/index.ts
if (req.method === 'GET') {
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}
```

---

## 📝 إعداد الأذونات والمراجعة

### الأذونات المطلوبة

| الإذن | الغرض | الحالة |
|-------|-------|--------|
| `whatsapp_business_messaging` | إرسال/استقبال رسائل | ⏳ يحتاج مراجعة |
| `whatsapp_business_management` | إدارة حساب WhatsApp | ⏳ يحتاج مراجعة |
| `pages_show_list` | عرض الصفحات | ✅ تمت الموافقة |
| `pages_read_engagement` | قراءة التفاعل | ✅ تمت الموافقة |
| `public_profile` | الملف الشخصي العام | ✅ تمت الموافقة |
| `email` | البريد الإلكتروني | ✅ تمت الموافقة |

### إعداد App Review Submission

#### 1. ملاحظات التقديم (Submission Notes)

استخدم هذا النص بالإنجليزية:

```
UberFix is a maintenance management platform that uses WhatsApp Business API 
for automated customer notifications and support.

IMPORTANT ARCHITECTURE NOTE:
This is a Server-to-Server application using a System User Token. 
There is NO client-side Meta login flow because:
1. Messages are sent programmatically from our backend
2. We use a permanent System User token for API authentication
3. The integration is purely server-side (Edge Functions)

USE CASES:
1. Send maintenance request status updates to customers
2. Send appointment reminders
3. Receive customer replies and route to support team
4. Automated welcome messages for new inquiries

The screencast demonstrates:
- Admin selecting a customer from the dashboard
- Composing and sending a WhatsApp message
- Message appearing in customer's WhatsApp app
- Status updates (sent, delivered, read) reflected in our dashboard
```

#### 2. متطلبات تسجيل الشاشة (Screencast)

##### المدة: 2-5 دقائق

##### المحتوى المطلوب:

**المشهد 1: مقدمة (30 ثانية)**
- اعرض لوحة التحكم الرئيسية
- أضف نص توضيحي: "UberFix Maintenance Management System"

**المشهد 2: الوصول لصفحة الرسائل (30 ثانية)**
- انتقل إلى: `/dashboard/messages`
- أظهر قائمة المحادثات السابقة

**المشهد 3: إرسال رسالة (60 ثانية)**
- اختر عميل من القائمة أو أدخل رقم جديد
- اكتب رسالة اختبار
- اضغط "إرسال"
- أظهر رسالة النجاح في واجهة التطبيق

**المشهد 4: التحقق من الاستلام (60 ثانية)**
- افتح تطبيق WhatsApp على هاتف العميل
- أظهر الرسالة الواردة
- أظهر تطابق المحتوى

**المشهد 5: تحديث الحالة (30 ثانية)**
- ارجع للوحة التحكم
- أظهر تحديث حالة التسليم (Delivered/Read)

##### أدوات التسجيل الموصى بها:
- **Windows:** OBS Studio, ShareX
- **Mac:** QuickTime, OBS Studio
- **Online:** Loom, Screencastify

##### إعدادات التسجيل:
- دقة: 1920x1080 أو أعلى
- معدل الإطارات: 30fps
- اللغة: English (واجهة التطبيق)
- الصوت: اختياري (يُفضل بدون)

### 🔴 أسباب رفض المراجعة وحلولها

#### السبب 1: "Screen recording doesn't match use case"

**المشكلة:** التسجيل لا يُظهر الرحلة الكاملة

**الحل:**
```
✅ أظهر: اختيار العميل → كتابة الرسالة → الإرسال → الاستلام في WhatsApp
❌ لا تفعل: قص مباشر للنتيجة بدون إظهار العملية
```

#### السبب 2: "No Meta login flow shown"

**المشكلة:** Meta تتوقع رؤية تسجيل دخول

**الحل:** أضف في ملاحظات التقديم:
```
This is a SERVER-TO-SERVER integration using System User Token.
No client-side Meta login is required or used.
Authentication is handled via permanent API tokens on our backend.
```

#### السبب 3: "Message not shown in native client"

**المشكلة:** لم تُظهر الرسالة في تطبيق WhatsApp

**الحل:**
1. استخدم هاتف حقيقي (ليس محاكي)
2. سجّل شاشة الهاتف أو صوّره
3. أظهر الرسالة بوضوح مع الوقت

---

## 🔧 المشاكل الشائعة والحلول

### المشكلة 1: "Invalid OAuth redirect URI"

```
Error: Given URL is not allowed by the Application configuration
```

**التشخيص:**
1. افتح Console في المتصفح
2. ابحث عن الرابط المستخدم في الخطأ

**الحل:**
1. انسخ الرابط بالضبط من الخطأ
2. أضفه في Valid OAuth Redirect URIs
3. احفظ وانتظر 5 دقائق

### المشكلة 2: "WhatsApp message not delivered"

```
Error: (#131030) Recipient phone number not in allowed list
```

**السبب:** في Development Mode، الأرقام محدودة

**الحل:**
1. اذهب إلى: **WhatsApp** → **API Setup** → **To**
2. أضف رقم الاختبار في القائمة
3. أو قدّم طلب Live Mode

### المشكلة 3: "Template message failed"

```
Error: (#132000) Template not found
```

**الحل:**
1. تحقق من اسم القالب (case-sensitive)
2. تحقق من اللغة المستخدمة
3. تأكد من حالة القالب: `APPROVED`

### المشكلة 4: "Webhook not receiving messages"

**قائمة التحقق:**
- [ ] Edge Function منشورة؟
- [ ] `WHATSAPP_VERIFY_TOKEN` متطابق؟
- [ ] Webhook Fields مفعّلة؟
- [ ] لا توجد أخطاء في Supabase Logs؟

**تحقق من اللوغات:**
```sql
-- في Supabase SQL Editor
SELECT * FROM message_logs 
WHERE message_type = 'whatsapp' 
ORDER BY created_at DESC 
LIMIT 10;
```

### المشكلة 5: "Access token expired"

```
Error: (#190) Access token has expired
```

**الحل:**
1. استخدم Permanent System User Token
2. أو جدد الـ Temporary Token من API Setup
3. حدّث `WHATSAPP_ACCESS_TOKEN` في Supabase Secrets

---

## ✅ قائمة التحقق النهائية

### إعدادات Facebook App

- [ ] App ID صحيح: `25094190933553883`
- [ ] App في وضع Live (ليس Development)
- [ ] Privacy Policy URL مضاف
- [ ] Terms of Service URL مضاف
- [ ] App Icon مرفوع

### إعدادات OAuth

- [ ] Valid OAuth Redirect URIs مضافة (3 روابط)
- [ ] Deauthorize Callback URL مضاف
- [ ] Data Deletion Request URL مضاف
- [ ] Client OAuth login مفعّل
- [ ] Web OAuth login مفعّل

### إعدادات WhatsApp

- [ ] Phone Number ID صحيح: `644995285354639`
- [ ] Access Token صالح وغير منتهي
- [ ] Webhook URL صحيح
- [ ] Verify Token متطابق
- [ ] Webhook Fields مشتركة (messages, status)

### إعدادات Supabase Secrets

- [ ] `WHATSAPP_ACCESS_TOKEN` موجود
- [ ] `WHATSAPP_PHONE_NUMBER_ID` موجود
- [ ] `WHATSAPP_VERIFY_TOKEN` موجود
- [ ] `FACEBOOK_APP_SECRET` موجود

### Edge Functions

- [ ] `whatsapp-webhook` منشورة
- [ ] `send-whatsapp-meta` منشورة
- [ ] لا توجد أخطاء في اللوغات

### App Review

- [ ] Submission notes بالإنجليزية
- [ ] ذكر "Server-to-Server" architecture
- [ ] تسجيل شاشة واضح
- [ ] يُظهر الإرسال من التطبيق
- [ ] يُظهر الاستلام في WhatsApp client

---

## 📞 الدعم والمساعدة

### روابط مفيدة

| المورد | الرابط |
|--------|--------|
| Meta Developers Docs | https://developers.facebook.com/docs |
| WhatsApp Business API | https://developers.facebook.com/docs/whatsapp |
| App Review Guidelines | https://developers.facebook.com/docs/app-review |
| Screencast Guidelines | https://developers.facebook.com/docs/app-review/submission-guide/screen-recordings |
| Supabase Edge Functions | https://supabase.com/docs/guides/functions |

### مجتمع الدعم

- [Meta Developer Community](https://developers.facebook.com/community)
- [Stack Overflow - Facebook API](https://stackoverflow.com/questions/tagged/facebook-graph-api)
- [Supabase Discord](https://discord.supabase.com)

---

## 📄 سجل التغييرات

| التاريخ | الإصدار | التغييرات |
|---------|---------|-----------|
| 2026-01-29 | 2.0 | تحديث شامل مع حلول المشاكل |
| 2026-01-28 | 1.5 | إضافة معلومات App Review |
| 2026-01-27 | 1.0 | الإصدار الأولي |

---

> **ملاحظة:** هذا المستند يُحدّث بانتظام. تحقق من آخر إصدار قبل البدء في الإعدادات.
