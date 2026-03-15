# ⚡ قائمة الإجراءات الفورية - Immediate Action Items
# UberFix.shop Critical Fixes Checklist

**التاريخ / Date:** 25 فبراير 2026 / February 25, 2026  
**الأولوية / Priority:** 🔴 CRITICAL

---

## 🔐 الأمان - Security (يجب إصلاحه اليوم / Must Fix Today)

### 1. إزالة JWT المشفر / Remove Hardcoded JWT ⚠️ CRITICAL
**الموقع / Location:** `src/integrations/supabase/client.ts:9`

```typescript
// ❌ REMOVE THIS:
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycmZmc2piZmtwaHJpZHF5YWlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MzE1NzMsImV4cCI6MjA3MjAwNzU3M30.AwzY48mSUGeopBv5P6gzAPlipTbQasmXK8DR-L_Tm9A";

// ✅ REPLACE WITH:
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY environment variable');
}
```

**الخطوات / Steps:**
1. حذف القيمة الاحتياطية المشفرة / Remove hardcoded fallback value
2. إضافة فحص وجود المتغير / Add validation check
3. تحديث README مع التعليمات / Update README with instructions

---

### 2. إزالة ملف .env من Git / Remove `.env` from Git ⚠️ CRITICAL

```bash
# الخطوات / Steps:

# 1. نسخ احتياطي / Backup current values
cp .env .env.backup

# 2. إزالة من Git / Remove from Git
git rm --cached .env
git commit -m "Remove .env file from version control"

# 3. إضافة إلى .gitignore / Add to .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*.local" >> .gitignore

# 4. إنشاء ملف مثال / Create example file
cat > .env.example << 'EOF'
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Services
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id

# Mapbox
VITE_MAPBOX_TOKEN=your_mapbox_token

# Facebook
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# WhatsApp Business API
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_whatsapp_account_id
VITE_WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_id

# EmailJS
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_USER_ID=your_emailjs_user_id

# Twilio
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
EOF

# 5. التزام التغييرات / Commit changes
git add .gitignore .env.example
git commit -m "Add .env.example and update .gitignore"
```

---

### 3. إعادة إنشاء مفاتيح API المكشوفة / Regenerate Exposed API Keys ⚠️ CRITICAL

**المفاتيح المكشوفة / Exposed Keys:**

#### أ. Google Maps API
```bash
# زيارة / Visit: https://console.cloud.google.com/apis/credentials
# 1. حذف المفتاح القديم / Delete old key
# 2. إنشاء مفتاح جديد / Create new key
# 3. إضافة قيود HTTP referrer / Add HTTP referrer restrictions:
#    - https://uberfix.shop/*
#    - http://localhost:5173/*
# 4. تحديث .env / Update .env
```

#### ب. Mapbox Token
```bash
# زيارة / Visit: https://account.mapbox.com/access-tokens/
# 1. إلغاء الرمز القديم / Revoke old token
# 2. إنشاء رمز جديد / Create new token
# 3. إضافة قيود URL / Add URL restrictions
# 4. تحديث .env / Update .env
```

#### ج. Supabase Anon Key (إذا لزم الأمر / if necessary)
```bash
# ملاحظة: مفاتيح Anon آمنة عادة مع RLS
# ولكن إذا كنت تريد إعادة الإنشاء / but if you want to regenerate:
# زيارة / Visit: Supabase Dashboard > Settings > API
# 1. إعادة إنشاء مفاتيح API / Regenerate API keys
# 2. تحديث جميع البيئات / Update all environments
```

---

### 4. إزالة بيانات اعتماد الاختبار / Remove Test Credentials ⚠️ HIGH

**الموقع / Location:** `e2e/fixtures/test-data.ts`

```typescript
// ❌ REMOVE THIS:
export const testUsers = {
  admin: { email: 'admin@uberfix.shop', password: 'Admin@123' },
  vendor: { email: 'vendor@uberfix.shop', password: 'Vendor@123' },
  customer: { email: 'customer@uberfix.shop', password: 'Customer@123' }
};

// ✅ REPLACE WITH:
export const testUsers = {
  admin: { 
    email: process.env.TEST_ADMIN_EMAIL || '', 
    password: process.env.TEST_ADMIN_PASSWORD || '' 
  },
  vendor: { 
    email: process.env.TEST_VENDOR_EMAIL || '', 
    password: process.env.TEST_VENDOR_PASSWORD || '' 
  },
  customer: { 
    email: process.env.TEST_CUSTOMER_EMAIL || '', 
    password: process.env.TEST_CUSTOMER_PASSWORD || '' 
  }
};
```

**إضافة إلى `.env.example`:**
```bash
# Test Credentials (for E2E tests)
TEST_ADMIN_EMAIL=admin@test.local
TEST_ADMIN_PASSWORD=your_test_password
TEST_VENDOR_EMAIL=vendor@test.local
TEST_VENDOR_PASSWORD=your_test_password
TEST_CUSTOMER_EMAIL=customer@test.local
TEST_CUSTOMER_PASSWORD=your_test_password
```

---

## 📝 TypeScript (يجب البدء هذا الأسبوع / Start This Week)

### 5. تفعيل الوضع الصارم / Enable Strict Mode 🟠 HIGH

**ملف / File:** `tsconfig.json`

```json
{
  "compilerOptions": {
    // ✅ Enable strict type checking
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // ✅ Enable additional checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

**الخطة التدريجية / Gradual Plan:**
```bash
# 1. تفعيل واحد تلو الآخر / Enable one by one
# 2. إصلاح الأخطاء حسب الوحدة / Fix errors by module
# 3. البدء بملفات الأدوات / Start with utility files
pnpm typecheck --noEmit

# 4. إصلاح hooks أولاً / Fix hooks first
# 5. ثم components / Then components
# 6. أخيراً pages / Finally pages
```

---

### 6. إصلاح انتهاكات `any` / Fix `any` Violations 🟠 HIGH

**الأولوية / Priority Files:** (70+ instances total)

#### أ. Supabase Queries (أكثر شيوعاً / Most Common)
```typescript
// ❌ Bad:
const { data, error } = await (supabase as any)
  .from('maintenance_requests')
  .select('*');

// ✅ Good:
import { Database } from '@/integrations/supabase/types';
type MaintenanceRequest = Database['public']['Tables']['maintenance_requests']['Row'];

const { data, error } = await supabase
  .from('maintenance_requests')
  .select('*')
  .returns<MaintenanceRequest[]>();
```

#### ب. Error Handling
```typescript
// ❌ Bad:
catch (err: any) {
  console.error(err);
}

// ✅ Good:
catch (error) {
  if (error instanceof Error) {
    console.error('Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

#### ج. Map Callbacks
```typescript
// ❌ Bad:
appointments.map((appointment: any) => ...)

// ✅ Good:
import { Appointment } from '@/types';
appointments.map((appointment: Appointment) => ...)
```

---

### 7. تحديث ESLint / Update ESLint Rules 🟠 HIGH

**ملف / File:** `eslint.config.js`

```javascript
// ✅ Enable important rules:
{
  rules: {
    "@typescript-eslint/no-explicit-any": "error", // was "off"
    "@typescript-eslint/no-unused-vars": ["error", { 
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_"
    }],
    "react-hooks/exhaustive-deps": "warn", // was "off"
    "no-console": ["warn", { 
      allow: ["warn", "error"] 
    }]
  }
}
```

---

## 🧹 Code Cleanup (هذا الأسبوع / This Week)

### 8. إزالة Console Logs 🟡 MEDIUM

**البحث والاستبدال / Find and Replace:**

```bash
# العثور على جميع console.log / Find all console.log
grep -r "console\.log" src/ --include="*.ts" --include="*.tsx"

# الاستبدال الآلي (حذر!) / Automated replace (careful!)
# الأفضل: مراجعة يدوية / Better: Manual review
find src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '/console\.log/d' {} +

# أو استخدام eslint --fix / Or use eslint --fix
pnpm lint:fix
```

**الاحتفاظ بـ / Keep:**
- `console.error` في معالجات الأخطاء / in error handlers
- `console.warn` للتحذيرات الهامة / for important warnings

---

### 9. إنشاء أداة معالجة الأخطاء / Create Error Handler Utility 🟡 MEDIUM

**ملف جديد / New File:** `src/lib/errorHandler.ts`

```typescript
import { toast } from 'sonner';

interface ErrorOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  customMessage?: string;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(
  error: unknown,
  options: ErrorOptions = {}
): AppError {
  const {
    showToast = true,
    logToConsole = true,
    customMessage
  } = options;

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message);
  } else {
    appError = new AppError('حدث خطأ غير متوقع / An unexpected error occurred');
  }

  if (logToConsole) {
    console.error('[AppError]', appError);
  }

  if (showToast) {
    toast.error(customMessage || appError.message);
  }

  return appError;
}

// استخدام في الخطافات / Usage in hooks:
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = handleError(error, { customMessage: errorMessage });
    return { data: null, error: appError };
  }
}
```

**الاستخدام / Usage:**
```typescript
// ✅ في الخطافات / In hooks:
const { data, error } = await withErrorHandling(
  async () => {
    const result = await supabase.from('maintenance_requests').select('*');
    if (result.error) throw result.error;
    return result.data;
  },
  'خطأ في جلب طلبات الصيانة'
);
```

---

## ✅ Checklist Summary

### اليوم / Today (2-4 ساعات / hours)
- [ ] إزالة JWT المشفر من client.ts / Remove hardcoded JWT
- [ ] إزالة .env من Git / Remove .env from Git
- [ ] إنشاء .env.example / Create .env.example
- [ ] إعادة إنشاء Google Maps API key / Regenerate Google Maps key
- [ ] إعادة إنشاء Mapbox token / Regenerate Mapbox token

### هذا الأسبوع / This Week (8-12 ساعة / hours)
- [ ] نقل بيانات اعتماد الاختبار إلى متغيرات البيئة / Move test credentials to env vars
- [ ] تفعيل TypeScript strict mode تدريجياً / Enable TypeScript strict mode gradually
- [ ] تحديث قواعد ESLint / Update ESLint rules
- [ ] إنشاء أداة معالجة الأخطاء / Create error handler utility
- [ ] إزالة console.log من الإنتاج / Remove production console.log

### الأسبوع القادم / Next Week (16-20 ساعة / hours)
- [ ] إصلاح أول 20 انتهاك `any` / Fix first 20 `any` violations
- [ ] إضافة اختبارات وحدة للخطافات الحرجة / Add unit tests for critical hooks
- [ ] تقسيم المكونات الكبيرة / Split large components
- [ ] إضافة تحسينات React الأساسية / Add basic React optimizations

---

## 📞 الحصول على المساعدة / Getting Help

إذا واجهت صعوبات أثناء التنفيذ / If you encounter difficulties during implementation:

1. **الأولوية / Priority 1:** إصلاح المشاكل الأمنية / Fix security issues
   - إذا لم تكن متأكداً، اطلب المراجعة / If unsure, request review
   
2. **الأولوية / Priority 2:** تفعيل الوضع الصارم لـ TypeScript / Enable TypeScript strict mode
   - البدء بملف واحد في المرة / Start one file at a time
   
3. **استشارة الفريق / Consult team:** للقرارات المعمارية الكبرى / For major architectural decisions

**الاتصال / Contact:**
- 📧 البريد الإلكتروني: support@uberfix.shop
- 📚 الوثائق: `/docs/COMPREHENSIVE_PROJECT_INSPECTION.md`

---

**تم إنشاؤه بواسطة / Created By:** GitHub Copilot  
**التاريخ / Date:** 25 فبراير 2026 / February 25, 2026
