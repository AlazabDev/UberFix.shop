# 📁 بنية مشروع UberFix.shop

> **آخر تحديث:** 2025-01-14  
> **الحالة:** ✅ تم إعادة الهيكلة بالكامل - Feature-based Architecture

---

## 📋 جدول المحتويات

- [نظرة عامة](#نظرة-عامة)
- [البنية الرئيسية](#البنية-الرئيسية)
- [مجلد Pages](#مجلد-pages)
- [مجلد Components](#مجلد-components)
- [مجلد Hooks](#مجلد-hooks)
- [مجلد Lib](#مجلد-lib)
- [Routes Configuration](#routes-configuration)
- [أمثلة عملية](#أمثلة-عملية)
- [معايير التطوير](#معايير-التطوير)

---

## 🎯 نظرة عامة

تم تنظيم المشروع باستخدام **Feature-based Architecture** لتحسين:
- ✅ **قابلية الصيانة**: كل feature في مجلد مستقل
- ✅ **قابلية التوسع**: سهولة إضافة features جديدة
- ✅ **التعاون**: فهم البنية بسهولة من قبل الفريق
- ✅ **الأداء**: Code splitting تلقائي لكل feature

---

## 📂 البنية الرئيسية

```
uberfix.shop/
├── src/
│   ├── pages/              # 📄 صفحات التطبيق (منظمة حسب الميزة)
│   ├── components/         # 🧩 مكونات React القابلة لإعادة الاستخدام
│   ├── hooks/              # 🪝 Custom React Hooks
│   ├── lib/                # 📚 Utilities و Helper Functions
│   ├── routes/             # 🛣️ تكوينات Routing
│   ├── integrations/       # 🔌 تكاملات خارجية (Supabase)
│   ├── data/               # 💾 Static data و constants
│   ├── App.tsx             # 🚀 نقطة دخول التطبيق الرئيسية
│   ├── main.tsx            # 🎬 Bootstrap file
│   └── index.css           # 🎨 Global styles و Design tokens
│
├── supabase/               # 🗄️ Backend configuration
│   ├── functions/          # ⚡ Edge Functions
│   └── migrations/         # 📊 Database migrations
│
├── public/                 # 🌐 Static assets
├── docs/                   # 📖 Documentation
└── package.json            # 📦 Dependencies
```

---

## 📄 مجلد Pages

تم تنظيم الصفحات حسب **الميزة/Feature** لتسهيل الإدارة:

### 🔐 Auth Pages (`src/pages/auth/`)

صفحات المصادقة والتسجيل:

```
auth/
├── Login.tsx              # صفحة تسجيل الدخول
├── Register.tsx           # صفحة التسجيل
├── ForgotPassword.tsx     # استعادة كلمة المرور
├── AuthCallback.tsx       # معالج callback بعد المصادقة
└── RoleSelection.tsx      # اختيار دور المستخدم
```

**مثال استخدام:**
```tsx
// في routes/publicRoutes.config.tsx
import Login from "@/pages/auth/Login";

{ path: "/login", element: <Login /> }
```

---

### 🌐 Public Pages (`src/pages/public/`)

الصفحات العامة المتاحة للجميع بدون تسجيل دخول:

```
public/
├── Index.tsx              # الصفحة الرئيسية (Landing page)
├── About.tsx              # عن الشركة
├── Services.tsx           # الخدمات المقدمة
├── Gallery.tsx            # معرض الصور
├── Blog.tsx               # قائمة المقالات
├── BlogPost.tsx           # صفحة المقال
├── FAQ.tsx                # الأسئلة الشائعة
├── UserGuide.tsx          # دليل المستخدم
├── PrivacyPolicy.tsx      # سياسة الخصوصية
└── TermsOfService.tsx     # شروط الخدمة
```

**مثال استخدام:**
```tsx
// في routes/publicRoutes.config.tsx
import Index from "@/pages/public/Index";
import About from "@/pages/public/About";

{ path: "/", element: <Index /> },
{ path: "/about", element: <About /> }
```

---

### 🔧 Maintenance Pages (`src/pages/maintenance/`)

إدارة طلبات الصيانة والخدمات:

```
maintenance/
├── Requests.tsx               # قائمة طلبات المستخدم
├── AllRequests.tsx            # جميع الطلبات (للإداريين)
├── RequestDetails.tsx         # تفاصيل الطلب
├── ServiceRequest.tsx         # إنشاء طلب صيانة جديد
├── EmergencyService.tsx       # طلبات الطوارئ
├── ServiceMap.tsx             # خريطة الفنيين
├── MaintenanceProcedures.tsx  # إجراءات الصيانة
└── RequestLifecycleJourney.tsx # دورة حياة الطلب
```

**مثال استخدام:**
```tsx
// في routes/routes.config.tsx (Protected)
import Requests from "@/pages/maintenance/Requests";
import ServiceMap from "@/pages/maintenance/ServiceMap";

{ path: "/requests", element: <Requests />, withLayout: true },
{ path: "/service-map", element: <ServiceMap />, withLayout: false }
```

---

### 🏢 Properties Pages (`src/pages/properties/`)

إدارة العقارات:

```
properties/
├── Properties.tsx         # قائمة العقارات
├── PropertyDetails.tsx    # تفاصيل العقار
├── AddProperty.tsx        # إضافة عقار جديد
├── EditProperty.tsx       # تعديل عقار
└── QuickRequest.tsx       # طلب سريع من العقار
```

**مثال استخدام:**
```tsx
import Properties from "@/pages/properties/Properties";
import AddProperty from "@/pages/properties/AddProperty";

{ path: "/properties", element: <Properties />, withLayout: true },
{ path: "/properties/add", element: <AddProperty />, withLayout: true }
```

---

### 👨‍💼 Admin Pages (`src/pages/admin/`)

صفحات لوحة تحكم الإدارة:

```
admin/
├── AdminControlCenter.tsx     # مركز التحكم الرئيسي
├── UserManagement.tsx         # إدارة المستخدمين
├── MaintenanceLockAdmin.tsx   # قفل النظام للصيانة
├── ProductionMonitor.tsx      # مراقبة الإنتاج
└── Testing.tsx                # أدوات الاختبار
```

**مثال استخدام:**
```tsx
import AdminControlCenter from "@/pages/admin/AdminControlCenter";

{ 
  path: "/admin/control-center", 
  element: <AdminControlCenter />, 
  withLayout: true 
}
```

---

### 📊 Reports Pages (`src/pages/reports/`)

التقارير والإحصائيات:

```
reports/
├── Reports.tsx              # لوحة التقارير الرئيسية
├── SLADashboard.tsx         # تقرير اتفاقيات مستوى الخدمة
├── MaintenanceReports.tsx   # تقارير الصيانة
├── ExpenseReports.tsx       # تقارير المصروفات
└── ProductionReport.tsx     # تقرير الإنتاج
```

---

### 💬 Messages Pages (`src/pages/messages/`)

إدارة الرسائل والتواصل:

```
messages/
├── Inbox.tsx              # صندوق الوارد
├── MessageLogs.tsx        # سجل الرسائل
└── WhatsAppMessages.tsx   # رسائل واتساب
```

---

### 📁 Projects Pages (`src/pages/projects/`)

إدارة المشاريع:

```
projects/
├── Projects.tsx           # قائمة المشاريع
└── ProjectDetails.tsx     # تفاصيل المشروع
```

---

### ⚙️ Settings Pages (`src/pages/settings/`)

الإعدادات:

```
settings/
├── Settings.tsx           # إعدادات التطبيق
└── PWASettings.tsx        # إعدادات Progressive Web App
```

---

### 📄 Core Pages (في الجذر)

الصفحات الأساسية التي لا تنتمي لميزة محددة:

```
src/pages/
├── Dashboard.tsx          # لوحة التحكم الرئيسية
├── Appointments.tsx       # المواعيد
├── Invoices.tsx           # الفواتير
├── Vendors.tsx            # قائمة الموردين
├── VendorDetails.tsx      # تفاصيل المورد
├── Map.tsx                # الخريطة العامة
├── Documentation.tsx      # التوثيق
└── NotFound.tsx           # صفحة 404
```

---

## 🧩 مجلد Components

المكونات القابلة لإعادة الاستخدام منظمة حسب الوظيفة:

```
components/
├── ui/                    # مكونات shadcn/ui الأساسية
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ... (50+ مكون)
│
├── layout/                # مكونات التخطيط
│   ├── AppLayout.tsx      # Layout الرئيسي مع Sidebar
│   ├── AppSidebar.tsx     # Sidebar navigation
│   └── Navbar.tsx
│
├── auth/                  # مكونات المصادقة
│   └── AuthWrapper.tsx
│
├── dashboard/             # مكونات Dashboard
│   ├── StatsCard.tsx
│   ├── RecentActivity.tsx
│   └── QuickActions.tsx
│
├── maintenance/           # مكونات الصيانة
│   ├── RequestCard.tsx
│   ├── StatusBadge.tsx
│   └── PriorityIndicator.tsx
│
├── maps/                  # مكونات الخرائط
│   ├── GoogleMap.tsx
│   ├── TechnicianMarker.tsx
│   └── LocationPicker.tsx
│
├── properties/            # مكونات العقارات
│   ├── PropertyCard.tsx
│   ├── PropertyForm.tsx
│   └── PropertyQRCode.tsx
│
├── forms/                 # نماذج
│   ├── NewRequestForm.tsx
│   └── ImageUpload.tsx
│
├── notifications/         # الإشعارات
│   └── NotificationsList.tsx
│
├── shared/                # مكونات مشتركة
│   ├── LoadingSpinner.tsx
│   └── EmptyState.tsx
│
└── ErrorBoundary.tsx      # معالج الأخطاء
```

**مثال استخدام:**
```tsx
// استيراد من ui
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

// استيراد من features
import { RequestCard } from "@/components/maintenance/RequestCard";
import { GoogleMap } from "@/components/maps/GoogleMap";

function MyPage() {
  return (
    <div>
      <RequestCard {...props} />
      <Button>Submit</Button>
    </div>
  );
}
```

---

## 🪝 مجلد Hooks

Custom React Hooks للمنطق القابل لإعادة الاستخدام:

```
hooks/
├── use-mobile.tsx           # كشف الشاشات الصغيرة
├── use-toast.ts             # نظام الإشعارات
├── useAppSettings.ts        # إعدادات التطبيق
├── useMaintenanceRequests.ts # طلبات الصيانة
├── useProperties.ts         # العقارات
├── useVendors.ts            # الموردين
├── useUserRole.ts           # دور المستخدم
├── useNotifications.ts      # الإشعارات
├── useMessages.ts           # الرسائل
├── useProjects.ts           # المشاريع
├── useOnlineStatus.ts       # حالة الاتصال
├── usePWA.ts                # Progressive Web App
└── ... (30+ hook)
```

**مثال استخدام:**
```tsx
import { useMaintenanceRequests } from "@/hooks/useMaintenanceRequests";
import { useUserRole } from "@/hooks/useUserRole";

function RequestsPage() {
  const { requests, loading } = useMaintenanceRequests();
  const { hasRole } = useUserRole();

  if (loading) return <LoadingSpinner />;
  if (!hasRole('STAFF')) return <Unauthorized />;

  return (
    <div>
      {requests.map(req => <RequestCard key={req.id} {...req} />)}
    </div>
  );
}
```

---

## 📚 مجلد Lib

دوال مساعدة و utilities:

```
lib/
├── utils.ts                  # دوال عامة (cn, etc.)
├── supabase.ts               # Supabase client
├── validationSchemas.ts      # Zod validation schemas
├── requestFormatters.ts      # تنسيق بيانات الطلبات
├── requestValidation.ts      # التحقق من صحة الطلبات
├── mapIconHelper.ts          # مساعد أيقونات الخريطة
├── googleMapsLoader.ts       # تحميل Google Maps
├── errorHandler.ts           # معالجة الأخطاء
├── analytics.ts              # تتبع الإحصائيات
├── productionConfig.ts       # إعدادات الإنتاج
├── pwaRegister.ts            # تسجيل PWA
└── ... (19 ملف)
```

**مثال استخدام:**
```tsx
import { cn } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/requestFormatters";
import { maintenanceRequestSchema } from "@/lib/validationSchemas";

// دمج classes
const buttonClasses = cn(
  "px-4 py-2 rounded",
  isActive && "bg-primary",
  isDisabled && "opacity-50"
);

// تنسيق البيانات
const formattedDate = formatDate(request.created_at);
const price = formatCurrency(request.estimated_cost);

// التحقق من البيانات
const result = maintenanceRequestSchema.safeParse(formData);
```

---

## 🛣️ Routes Configuration

### Public Routes (`src/routes/publicRoutes.config.tsx`)

المسارات المتاحة للجميع:

```tsx
export const publicRoutes = [
  // Auth
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  
  // Public Pages
  { path: "/", element: <Index /> },
  { path: "/about", element: <About /> },
  { path: "/services", element: <Services /> },
  { path: "/gallery", element: <Gallery /> },
  { path: "/blog", element: <Blog /> },
  { path: "/blog/:slug", element: <BlogPost /> },
  
  // Quick Access
  { path: "/quick-request/:propertyId", element: <QuickRequest /> },
  { path: "/map", element: <Map /> },
  
  // Fallback
  { path: "*", element: <NotFound /> },
];
```

### Protected Routes (`src/routes/routes.config.tsx`)

المسارات التي تتطلب تسجيل دخول:

```tsx
export const protectedRoutes = [
  // Dashboard
  { 
    path: "/dashboard", 
    element: <Dashboard />, 
    withLayout: true  // يعرض Sidebar
  },
  
  // Maintenance
  { path: "/requests", element: <Requests />, withLayout: true },
  { path: "/service-map", element: <ServiceMap />, withLayout: false }, // بدون Sidebar
  
  // Admin (protected by RoleGuard in component)
  { path: "/admin/control-center", element: <AdminControlCenter />, withLayout: true },
  
  // Reports
  { path: "/reports", element: <Reports />, withLayout: true },
  { path: "/reports/maintenance", element: <MaintenanceReports />, withLayout: true },
];
```

**معنى `withLayout`:**
- `true`: يعرض الصفحة داخل `AppLayout` مع Sidebar
- `false`: يعرض الصفحة بدون Layout (مثل الخريطة)

---

## 💡 أمثلة عملية

### مثال 1: إضافة صفحة جديدة

لإضافة صفحة "Reports Analytics":

```bash
# 1. أنشئ الملف في المجلد المناسب
src/pages/reports/Analytics.tsx
```

```tsx
// 2. اكتب المكون
export default function Analytics() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      {/* المحتوى */}
    </div>
  );
}
```

```tsx
// 3. أضفها للـ routes
// في src/routes/routes.config.tsx

const Analytics = lazy(() => import("@/pages/reports/Analytics"));

export const protectedRoutes = [
  // ... existing routes
  { path: "/reports/analytics", element: <Analytics />, withLayout: true },
];
```

---

### مثال 2: إنشاء Hook مخصص

```tsx
// src/hooks/useAnalytics.ts

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useAnalytics(dateRange: { from: Date; to: Date }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to);
      
      if (!error) setData(data);
      setLoading(false);
    }
    
    fetchAnalytics();
  }, [dateRange]);

  return { data, loading };
}
```

**استخدامه:**
```tsx
// في src/pages/reports/Analytics.tsx

import { useAnalytics } from "@/hooks/useAnalytics";

export default function Analytics() {
  const { data, loading } = useAnalytics({
    from: new Date('2025-01-01'),
    to: new Date()
  });

  if (loading) return <LoadingSpinner />;
  
  return <AnalyticsChart data={data} />;
}
```

---

### مثال 3: إضافة مكون قابل لإعادة الاستخدام

```tsx
// src/components/reports/AnalyticsCard.tsx

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: number;
  change: number;
  prefix?: string;
}

export function AnalyticsCard({ 
  title, 
  value, 
  change, 
  prefix = "" 
}: AnalyticsCardProps) {
  const isPositive = change >= 0;
  
  return (
    <Card className="p-6">
      <h3 className="text-sm text-muted-foreground">{title}</h3>
      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-3xl font-bold">
          {prefix}{value.toLocaleString('ar-EG')}
        </span>
        <div className={`flex items-center gap-1 ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm">{Math.abs(change)}%</span>
        </div>
      </div>
    </Card>
  );
}
```

**استخدامه:**
```tsx
import { AnalyticsCard } from "@/components/reports/AnalyticsCard";

<AnalyticsCard
  title="إجمالي الطلبات"
  value={1250}
  change={12.5}
/>
```

---

## 📏 معايير التطوير

### 1. تنظيم الملفات

✅ **افعل:**
- ضع كل feature في مجلده الخاص
- استخدم أسماء واضحة وموحدة
- اتبع البنية الموجودة

❌ **لا تفعل:**
- لا تضع كل الملفات في مجلد واحد
- لا تستخدم أسماء غامضة
- لا تكرر الكود في أماكن متعددة

### 2. التسمية

```tsx
// ✅ صحيح
RequestCard.tsx          // مكونات بـ PascalCase
useMaintenanceRequests.ts // hooks بـ camelCase
formatDate.ts            // functions بـ camelCase

// ❌ خطأ
request-card.tsx
UseMaintenanceRequests.ts
FormatDate.ts
```

### 3. الاستيراد

```tsx
// ✅ استخدم alias @
import { Button } from "@/components/ui/button";
import { useRequests } from "@/hooks/useMaintenanceRequests";

// ❌ تجنب المسارات النسبية الطويلة
import { Button } from "../../../../components/ui/button";
```

### 4. Lazy Loading

```tsx
// ✅ استخدم lazy loading للصفحات
const Dashboard = lazy(() => import("@/pages/Dashboard"));

// ❌ لا تستورد الصفحات مباشرة في routes
import Dashboard from "@/pages/Dashboard"; // يزيد حجم Bundle
```

### 5. TypeScript

```tsx
// ✅ استخدم types واضحة
interface RequestCardProps {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// ❌ تجنب any
function RequestCard(props: any) { }
```

---

## 🚀 الخطوات التالية

1. ✅ **تم** - تنظيف وإعادة هيكلة Pages
2. ✅ **تم** - توحيد Utilities في مجلد واحد
3. 🔄 **قيد التنفيذ** - مراجعة وتنظيف Components
4. 📝 **قادم** - إنشاء Barrel Exports (index.ts)
5. 📚 **قادم** - توثيق جميع Hooks والمكونات

---

## 📞 للمساعدة

- 📖 راجع [ARCHITECTURE.md](./docs/ARCHITECTURE.md) لفهم معمارية النظام
- 🔧 راجع [COMPONENTS_GUIDE.md](./docs/COMPONENTS_GUIDE.md) لدليل المكونات
- 🛣️ راجع [Routes Configuration](#routes-configuration) لإضافة مسارات جديدة

---

**آخر تحديث:** 2025-01-14  
**الفريق:** UberFix Development Team
