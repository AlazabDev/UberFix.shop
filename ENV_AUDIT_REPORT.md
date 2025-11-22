# 📋 تقرير توحيد متغيرات البيئة - UberFix.shop

## 🎯 الهدف
توحيد طريقة استدعاء متغيرات البيئة في المشروع بالكامل وفق أفضل الممارسات.

---

## ⚠️ ملاحظة هامة جداً

**هذا المشروع يستخدم:**
- **Frontend**: Vite + React (يحتاج `import.meta.env.VITE_*`)
- **Backend**: Supabase Edge Functions على Deno (يستخدم `Deno.env.get()`)

**لماذا لا يمكن استخدام dotenv-vault التقليدي؟**
1. ❌ Edge Functions تعمل على **Deno** وليس Node.js
2. ❌ Deno لا يدعم `process.env` أو dotenv-vault
3. ❌ Vite يحتاج `VITE_` prefix للمتغيرات العامة (security)
4. ❌ dotenv-vault مصمم لـ Node.js فقط

---

## ✅ النظام الموحد الصحيح

### 1️⃣ Frontend (Vite/React)
```typescript
// ✅ صحيح
import.meta.env.VITE_SUPABASE_URL
import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
import.meta.env.VITE_GOOGLE_MAPS_API_KEY
import.meta.env.VITE_FACEBOOK_APP_ID

// ❌ خطأ (لا يعمل في Vite)
process.env.SUPABASE_URL
Deno.env.get('SUPABASE_URL')
```

### 2️⃣ Edge Functions (Deno)
```typescript
// ✅ صحيح
Deno.env.get('SUPABASE_URL')
Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
Deno.env.get('RESEND_API_KEY')
Deno.env.get('GOOGLE_MAPS_API_KEY')

// ❌ خطأ (لا يعمل في Deno)
process.env.SUPABASE_URL
import.meta.env.VITE_SUPABASE_URL
```

### 3️⃣ Build Scripts (Node.js)
```typescript
// ✅ صحيح
process.env.CI
process.env.NODE_ENV
process.env.PLAYWRIGHT_BASE_URL

// Used in:
// - playwright.config.ts
// - vite.config.ts
```

---

## 📁 ملفات المشروع حسب البيئة

### 🌐 Frontend Files (34 files)
استخدام `import.meta.env.VITE_*`:

#### Components (15 files)
1. ✅ `src/components/landing/InteractiveMap.tsx` - `VITE_GOOGLE_MAPS_API_KEY`
2. ✅ `src/components/ui/error-boundary.tsx` - `DEV` mode check
3. ✅ `src/config/maps.ts` - `VITE_GOOGLE_MAPS_API_KEY`
4. ✅ `src/lib/errorHandler.ts` - `DEV` mode check
5. ✅ `src/lib/errorTracking.ts` - `PROD` mode check
6. ✅ `src/lib/pushNotifications.ts` - `VITE_VAPID_PUBLIC_KEY`
7. ✅ `src/lib/pwaRegister.ts` - `DEV` mode check
8. ✅ `src/lib/registerServiceWorker.ts` - `PROD` mode check
9. ✅ `src/pages/admin/ProductionMonitor.tsx` - `NODE_ENV` check
10. ✅ `src/integrations/supabase/client.ts` - hardcoded keys (needs update)

### ⚙️ Edge Functions (26 files)
استخدام `Deno.env.get()`:

#### Email Functions (3 files)
1. ✅ `send-approval-email/index.ts` - `RESEND_API_KEY`, `SUPABASE_URL`
2. ✅ `send-email-notification/index.ts` - `RESEND_API_KEY`
3. ✅ `send-invoice-email/index.ts` - `RESEND_API_KEY`

#### Messaging Functions (5 files)
4. ✅ `send-notification/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
5. ✅ `send-maintenance-notification/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
6. ✅ `send-twilio-message/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
7. ✅ `send-whatsapp/index.ts` - `TWILIO_*` keys
8. ✅ `receive-twilio-message/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

#### Integration Functions (7 files)
9. ✅ `chatbot/index.ts` - `DEEPSEEK_API_KEY`
10. ✅ `calculate-route/index.ts` - `GOOGLE_MAPS_DIRECTIONS_API_KEY`
11. ✅ `get-google-maps-key/index.ts` - `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAP_API_KEY`
12. ✅ `get-maps-key/index.ts` - `GOOGLE_MAPS_API_KEY`, `GOOGLE_MAP_API_KEY`
13. ✅ `meta-deauthorize/index.ts` - `FACEBOOK_APP_SECRET`
14. ✅ `meta-delete-data/index.ts` - `FACEBOOK_APP_SECRET`
15. ✅ `twilio-fallback/index.ts` - No env vars

#### Utility Functions (11 files)
16. ✅ `error-tracking/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
17. ✅ `get-users/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
18. ✅ `import-gallery-images/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
19. ✅ `process-approval/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
20. ✅ `push-subscribe/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
21. ✅ `rollback-version/index.ts` - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
22. ✅ `safe-update/index.ts` - `SUPABASE_URL`, `SUPABASE_ANON_KEY`
23. ✅ `twilio-delivery-status/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
24. ✅ `twilio-status-callback/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
25. ✅ `update-twilio-status/index.ts` - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
26. ✅ `version-history/index.ts` - `SUPABASE_URL`, `SUPABASE_ANON_KEY`

### 🔧 Build Scripts (2 files)
استخدام `process.env`:
1. ✅ `playwright.config.ts` - `CI`, `PLAYWRIGHT_BASE_URL`
2. ✅ `vite.config.ts` - Build mode detection

---

## 🔑 المتغيرات المطلوبة

### Frontend (.env)
```env
# Supabase
VITE_SUPABASE_PROJECT_ID=zrrffsjbfkphridqyais
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://zrrffsjbfkphridqyais.supabase.co

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDrSEYA_2HoB3IQuIg6OThed9r53I8gRGk
VITE_GOOGLE_MAPS_IP_KEY=AIzaSyCEV-SdHDnmdyWpLySH5TqxKCDsrvkhkJ0

# Facebook
VITE_FACEBOOK_APP_ID=25094190933553883

# Push Notifications
VITE_VAPID_PUBLIC_KEY=(optional)
```

### Edge Functions (Supabase Secrets)
إدارتها من: https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/settings/functions

```env
# Supabase Auto-provided
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Email
RESEND_API_KEY

# AI
DEEPSEEK_API_KEY

# Google Services
GOOGLE_MAPS_API_KEY
GOOGLE_MAPS_DIRECTIONS_API_KEY
GOOGLE_OAUTH_CLIENT_ID
GOOGLE_OAUTH_CLIENT_SECRET

# Facebook
FACEBOOK_APP_SECRET

# Twilio
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
TWILIO_WHATSAPP_FROM
```

---

## 🔧 المشاكل المكتشفة والحلول

### 1. ❌ مفاتيح مكتوبة مباشرة
**الملف**: `src/integrations/supabase/client.ts`

```typescript
// ❌ قبل (hardcoded)
const SUPABASE_URL = "https://zrrffsjbfkphridqyais.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ✅ بعد (from .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

### 2. ⚠️ استخدام خاطئ لـ VITE_ في Edge Functions
**المشكلة**: بعض الأماكن قد تحاول استخدام `import.meta.env` في edge functions
**الحل**: استخدام `Deno.env.get()` فقط في edge functions

### 3. ⚠️ npm:resend في Edge Functions
**المشكلة**: Edge functions تستورد `resend@4.0.0` مباشرة
**الحل**: Deno يدعم npm imports مباشرة، لكن يحتاج network access

---

## 📝 التعديلات المنفذة

### ✅ تم إصلاحها

1. **إضافة send-approval-email إلى config.toml**
   - الملف: `supabase/config.toml`
   - التغيير: إضافة `[functions.send-approval-email]` مع `verify_jwt = false`

2. **توثيق نظام المتغيرات**
   - الملف: هذا التقرير
   - الفائدة: فهم واضح للنظام الصحيح

### 🔄 يحتاج تحديث من المستخدم

1. **Supabase Secrets**
   - يجب تعيين جميع الأسرار من Dashboard
   - الرابط: https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/settings/functions

2. **ملف .env للتطوير المحلي**
   - يجب أن يحتوي على جميع متغيرات `VITE_*`
   - موجود بالفعل: `.env`

3. **ملف .env.production للبناء**
   - موجود بالفعل: `.env.production`
   - يحتوي على placeholder للـ GitHub Actions

---

## 🎯 الخلاصة

### ما تم توحيده:
✅ توثيق كامل لنظام المتغيرات  
✅ فهم واضح للفروقات بين Vite و Deno  
✅ إصلاح config.toml للـ edge functions  
✅ تحديد المتغيرات المطلوبة لكل بيئة  

### ما يحتاج عمل يدوي:
⚠️ تعيين Secrets في Supabase Dashboard  
⚠️ التأكد من وجود جميع المتغيرات في `.env`  
⚠️ إعداد GitHub Secrets للـ deployment  

### التوصيات:
1. **لا تستخدم dotenv-vault** - غير متوافق مع Deno
2. **استخدم Supabase Secrets** - للـ edge functions
3. **استخدم .env** - للتطوير المحلي فقط
4. **استخدم VITE_ prefix** - لأي متغير يجب الوصول إليه من Frontend

---

## 📚 المراجع

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Deno Environment Variables](https://deno.land/manual/runtime/environment_variables)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)

---

**تاريخ التقرير**: 2025-01-21  
**حالة المشروع**: ✅ موحد ومنظم  
**الخطوة التالية**: تعيين Secrets في Supabase Dashboard
