# دليل الفحص والاختبار المحلي
## Local Testing Guide - UberFix.shop

---

## 📋 جدول المحتويات

1. [متطلبات النظام](#متطلبات-النظام)
2. [الإعداد الأولي](#الإعداد-الأولي)
3. [اختبارات الوحدة](#اختبارات-الوحدة)
4. [اختبارات E2E](#اختبارات-e2e)
5. [اختبارات الأداء](#اختبارات-الأداء)
6. [اختبارات الأمان](#اختبارات-الأمان)
7. [اختبارات التكامل](#اختبارات-التكامل)
8. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🖥️ متطلبات النظام

### البرمجيات المطلوبة
```bash
Node.js >= 18.0.0
npm >= 9.0.0 أو pnpm >= 8.0.0
Git >= 2.30.0
```

### المتصفحات المطلوبة للاختبار
- Chrome/Chromium (آخر إصدار)
- Firefox (آخر إصدار)
- Safari 14+ (للماك فقط)

---

## ⚙️ الإعداد الأولي

### 1. استنساخ المشروع
```bash
git clone [repository-url]
cd uberfix-shop
```

### 2. تثبيت المكتبات
```bash
# استخدام npm
npm install

# أو استخدام pnpm (موصى به)
pnpm install
```

### 3. إعداد متغيرات البيئة
```bash
# إنشاء ملف .env.local
cp .env.example .env.local

# تحرير الملف وإضافة المتغيرات
nano .env.local
```

المتغيرات المطلوبة:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Settings
VITE_APP_ENV=development
```

### 4. تشغيل السيرفر المحلي
```bash
npm run dev
# أو
pnpm dev
```

الوصول للتطبيق: `http://localhost:8080`

---

## 🧪 اختبارات الوحدة (Unit Tests)

### تشغيل جميع الاختبارات
```bash
npm run test
```

### تشغيل اختبارات محددة
```bash
# اختبار ملف واحد
npm run test src/__tests__/hooks/useErrorHandler.test.ts

# اختبار مجلد
npm run test src/__tests__/hooks/

# وضع المراقبة (watch mode)
npm run test -- --watch
```

### تقرير التغطية
```bash
npm run test:coverage
```

سيتم إنشاء التقرير في: `coverage/index.html`

### أمثلة الاختبارات

#### اختبار Hook
```typescript
// src/__tests__/hooks/useAuth.test.ts
import { renderHook } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';

describe('useAuth', () => {
  it('should return user when authenticated', async () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeDefined();
  });
});
```

#### اختبار Component
```typescript
// src/__tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

---

## 🎭 اختبارات E2E (End-to-End Tests)

### الإعداد الأولي
```bash
# تثبيت المتصفحات
npx playwright install
```

### تشغيل الاختبارات

#### جميع الاختبارات
```bash
npm run test:e2e
```

#### اختبارات محددة
```bash
# اختبار ملف واحد
npx playwright test e2e/auth.spec.ts

# اختبار على متصفح محدد
npx playwright test --project=chromium

# وضع التصحيح
npx playwright test --debug
```

#### الوضع التفاعلي (UI Mode)
```bash
npx playwright test --ui
```

### بيانات الاختبار

المستخدمون الافتراضيون:
```typescript
// Admin
Email: admin@uberfix.shop
Password: Admin@123

// Vendor
Email: vendor@uberfix.shop
Password: Vendor@123

// Customer
Email: customer@uberfix.shop
Password: Customer@123
```

### التقرير
```bash
# عرض التقرير
npx playwright show-report
```

---

## ⚡ اختبارات الأداء (Performance Tests)

### 1. Lighthouse Audit
```bash
# تشغيل السيرفر أولاً
npm run dev

# في نافذة أخرى
npm run lighthouse
```

### 2. Bundle Analysis
```bash
npm run build
npm run analyze
```

### 3. Load Testing
```bash
# استخدام k6 (يجب تثبيته أولاً)
k6 run tests/performance/load-test.js
```

### معايير الأداء المطلوبة
- **Load Time:** < 2 seconds
- **First Contentful Paint:** < 1 second
- **Time to Interactive:** < 3 seconds
- **Lighthouse Score:** > 90

---

## 🔒 اختبارات الأمان (Security Tests)

### 1. فحص RLS Policies
```bash
npm run test:security:rls
```

### 2. فحص Authentication
```bash
npm run test:security:auth
```

### 3. Supabase Linter
```bash
npx supabase db lint
```

### 4. فحص يدوي للأمان

#### اختبار RLS
```sql
-- كمستخدم غير مصرح
SELECT * FROM maintenance_requests;
-- يجب أن يفشل أو يعيد صفوف محدودة فقط
```

#### اختبار Permissions
```typescript
// محاولة الوصول كمستخدم عادي
const { data, error } = await supabase
  .from('profiles')
  .delete()
  .eq('role', 'admin');
// يجب أن يفشل
```

---

## 🔗 اختبارات التكامل (Integration Tests)

### 1. Supabase Connection
```bash
npm run test:integration:supabase
```

### 2. Google Maps API
```bash
npm run test:integration:maps
```

### 3. Edge Functions
```bash
# تشغيل Edge Functions محلياً
npx supabase functions serve

# اختبار Edge Function
curl -i --location --request POST 'http://localhost:54321/functions/v1/hello' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Test"}'
```

---

## 🎯 سكريبتات الاختبار الشاملة

### سكريبت الفحص الكامل
```bash
#!/bin/bash
# test-all.sh

echo "🚀 Starting Complete Test Suite..."

echo "1️⃣ Running Unit Tests..."
npm run test

echo "2️⃣ Running E2E Tests..."
npm run test:e2e

echo "3️⃣ Running Security Tests..."
npm run test:security

echo "4️⃣ Building Production..."
npm run build

echo "5️⃣ Running Performance Tests..."
npm run lighthouse

echo "✅ All Tests Completed!"
```

### تشغيل السكريبت
```bash
chmod +x test-all.sh
./test-all.sh
```

---

## 🐛 استكشاف الأخطاء

### مشاكل شائعة

#### 1. فشل اختبارات E2E
```bash
# حذف الحالة السابقة
rm -rf playwright/.auth/

# إعادة تشغيل
npm run test:e2e
```

#### 2. خطأ في الاتصال بـ Supabase
```bash
# التحقق من متغيرات البيئة
cat .env.local

# التحقق من الاتصال
curl https://your-project.supabase.co/rest/v1/
```

#### 3. خطأ في Google Maps
```bash
# التحقق من API Key
echo $VITE_GOOGLE_MAPS_API_KEY

# التحقق من الحصص
https://console.cloud.google.com/apis/dashboard
```

---

## 📊 التقارير والسجلات

### مواقع التقارير
```
coverage/              # تقارير التغطية
playwright-report/     # تقارير E2E
lighthouse-report/     # تقارير الأداء
test-results/         # نتائج الاختبارات
```

### عرض التقارير
```bash
# Unit Tests Coverage
open coverage/index.html

# E2E Report
npx playwright show-report

# Performance Report
open lighthouse-report/index.html
```

---

## ✅ قائمة الفحص (Testing Checklist)

قبل الإطلاق للإنتاج:

- [ ] جميع اختبارات الوحدة ناجحة
- [ ] جميع اختبارات E2E ناجحة
- [ ] التغطية > 75%
- [ ] Lighthouse Score > 90
- [ ] جميع RLS Policies فعالة
- [ ] Authentication يعمل بشكل صحيح
- [ ] Edge Functions تعمل
- [ ] Google Maps API يعمل
- [ ] لا توجد أخطاء في Console
- [ ] التصميم المتجاوب يعمل
- [ ] Performance مقبول
- [ ] Security Scan نظيف

---

## 📚 موارد إضافية

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library](https://testing-library.com/)
- [Supabase Testing](https://supabase.com/docs/guides/testing)

---

*آخر تحديث: 2025-11-15*
