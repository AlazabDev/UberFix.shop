# نظام الأدوار والصلاحيات

## 📋 نظرة عامة

تم إنشاء نظام أدوار متكامل في المشروع يتحكم في صلاحيات الوصول للمستخدمين. النظام يدعم ثلاثة أدوار رئيسية:

- **Admin (المسؤول)**: صلاحيات كاملة على النظام
- **Technician (الفني)**: صلاحيات متوسطة لإدارة الطلبات والمواعيد
- **Customer (العميل)**: صلاحيات محدودة لعرض وإنشاء الطلبات الخاصة

## 🔧 البنية التقنية

### قاعدة البيانات

#### جدول `user_roles`
```sql
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    role app_role NOT NULL,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    UNIQUE (user_id, role)
);
```

#### Enum الأدوار
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'technician', 'customer');
```

#### الدوال المساعدة

**`has_role(_user_id, _role)`**: للتحقق من امتلاك المستخدم لدور معين
```sql
SELECT public.has_role(auth.uid(), 'admin');
```

**`get_user_roles(_user_id)`**: للحصول على جميع أدوار المستخدم
```sql
SELECT * FROM public.get_user_roles(auth.uid());
```

### Frontend Hooks

#### `useUserRole(user)`
Hook لجلب وإدارة أدوار المستخدم:

```typescript
import { useUserRole } from '@/hooks/useUserRole';

const { roles, isAdmin, isTechnician, isCustomer, loading } = useUserRole(user);
```

### مكونات الحماية

#### `RoleGuard`
مكون لحماية الصفحات حسب الدور:

```typescript
import { RoleGuard } from '@/components/auth/RoleGuard';

<RoleGuard allowedRoles={['admin', 'technician']}>
  <AdminPanel />
</RoleGuard>
```

## 🔐 سياسات Row Level Security (RLS)

### maintenance_requests
- **العملاء**: يرون طلباتهم فقط
- **الفنيون والمسؤولون**: يرون جميع الطلبات

### appointments
- **الجميع**: يرون المواعيد المرتبطة بهم
- **المسؤولون**: يرون جميع المواعيد

### vendors
- **الجميع**: يمكنهم عرض الفنيين
- **المسؤولون والفنيون**: يمكنهم تعديل معلوماتهم

### properties
- **العملاء**: يرون عقاراتهم فقط
- **الفنيون والمسؤولون**: يرون جميع العقارات

### projects
- **الفنيون والمسؤولون فقط**: يمكنهم عرض وإدارة المشاريع

### invoices
- **العملاء**: يرون فواتيرهم فقط
- **المسؤولون والفنيون**: يرون جميع الفواتير

### notifications
- **الجميع**: يرون إشعاراتهم الخاصة فقط

## 🚀 تدفق المصادقة

### 1. الوصول إلى التطبيق
```
الصفحة الرئيسية (/) 
  ↓
زر "تسجيل الدخول" أو "إنشاء حساب"
  ↓
صفحة اختيار الدور (/role-selection)
  ↓
اختيار الدور (عميل/فني/مسؤول)
  ↓
صفحة تسجيل الدخول (/login?role=...)
```

### 2. التسجيل
عند إنشاء حساب جديد:
1. المستخدم يختار دوره من صفحة RoleSelection
2. يملأ نموذج التسجيل
3. يتم حفظ الدور في `raw_user_meta_data`
4. Trigger تلقائي يضيف الدور إلى جدول `user_roles`
5. يتم توجيهه إلى Dashboard

### 3. التحقق من الصلاحيات
```typescript
// في أي صفحة محمية
<AuthWrapper>  {/* يتحقق من وجود مستخدم مسجل */}
  <RoleGuard allowedRoles={['admin']}>  {/* يتحقق من الدور */}
    <AdminContent />
  </RoleGuard>
</AuthWrapper>
```

## 📝 أمثلة الاستخدام

### إضافة صفحة محمية بدور معين

```typescript
// في App.tsx
<Route path="/admin-panel" element={
  <AuthWrapper>
    <RoleGuard allowedRoles={['admin']}>
      <AppLayout>
        <AdminPanel />
      </AppLayout>
    </RoleGuard>
  </AuthWrapper>
} />
```

### التحقق من الدور في المكون

```typescript
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

function MyComponent() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user);
    });
  }, []);
  
  const { isAdmin, isTechnician, loading } = useUserRole(user);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {isAdmin && <AdminControls />}
      {isTechnician && <TechnicianTools />}
      <CommonContent />
    </div>
  );
}
```

### إضافة دور لمستخدم (للمسؤولين)

```typescript
import { addUserRole } from '@/hooks/useUserRole';

async function promoteToTechnician(userId: string) {
  const success = await addUserRole(userId, 'technician');
  if (success) {
    toast({ title: 'تم ترقية المستخدم إلى فني' });
  }
}
```

## 🔄 إضافة دور مسؤول يدوياً

لإضافة أول مسؤول للنظام، استخدم SQL Editor في Supabase:

```sql
-- احصل على user_id من جدول auth.users
SELECT id, email FROM auth.users;

-- أضف دور المسؤول
INSERT INTO public.user_roles (user_id, role)
VALUES ('user-uuid-here', 'admin');
```

## 🎯 أفضل الممارسات

1. **دائماً استخدم `has_role()` في RLS Policies** لتجنب infinite recursion
2. **لا تخزن الأدوار في localStorage** - استخدم دائماً قاعدة البيانات
3. **استخدم RoleGuard** لحماية الصفحات الكاملة
4. **استخدم useUserRole** للتحكم في عرض أجزاء من UI
5. **لا تعتمد على client-side validation فقط** - RLS يوفر الحماية الحقيقية

## 🐛 استكشاف الأخطاء

### المستخدم لا يمكنه الوصول لصفحة معينة
1. تحقق من جدول `user_roles` للمستخدم:
```sql
SELECT * FROM public.user_roles WHERE user_id = 'user-uuid';
```

2. تحقق من RLS policies للجدول:
```sql
SELECT * FROM pg_policies WHERE tablename = 'table_name';
```

### Infinite Recursion Error
- تأكد من استخدام `SECURITY DEFINER` و `SET search_path = public` في الدوال
- لا تستخدم استعلامات مباشرة في RLS policies - استخدم دوال مساعدة

## 📊 مراقبة الأدوار

عرض إحصائيات الأدوار:
```sql
SELECT 
  role, 
  COUNT(*) as user_count 
FROM public.user_roles 
GROUP BY role;
```

## 🔮 التطوير المستقبلي

- [ ] إضافة أدوار ديناميكية (custom roles)
- [ ] صلاحيات دقيقة (permissions) لكل دور
- [ ] سجل تغييرات الأدوار (audit log)
- [ ] واجهة إدارة الأدوار للمسؤولين
- [ ] نظام الموافقات متعدد المستويات