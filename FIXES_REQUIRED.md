# 🔧 الإصلاحات المطلوبة - UberFix.shop

## 🚨 المشكلة الرئيسية: لا يمكن إضافة عقارات

### السبب الجذري
تم تحديد **3 أسباب رئيسية** تمنع إضافة العقارات:

---

## 1️⃣ خطأ React Critical Error

### الخطأ
```
TypeError: Cannot read properties of null (reading 'useEffect')
at QueryClientProvider
```

### الحل الفوري
```bash
# الطريقة 1: تنظيف وإعادة تثبيت
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# الطريقة 2: إذا لم تنجح الأولى
npm install react@18.3.1 react-dom@18.3.1 --force
npm install @tanstack/react-query@latest --force
```

### الفحص
بعد إعادة التثبيت، افتح المشروع وتحقق من عدم وجود أخطاء في Console.

---

## 2️⃣ مشاكل Storage - Property Images

### المشكلة
- Bucket `property-images` موجود وعام (public: true) ✅
- لكن **سياسات الوصول قد تكون مفقودة**

### الحل: إضافة Storage Policies

#### أ) سياسة الرفع (Upload)
```sql
CREATE POLICY "Allow authenticated users to upload property images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
);
```

#### ب) سياسة القراءة (Download)
```sql
CREATE POLICY "Allow public to view property images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'property-images');
```

#### ج) سياسة التحديث (Update)
```sql
CREATE POLICY "Allow users to update their property images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
)
WITH CHECK (
  bucket_id = 'property-images'
);
```

#### د) سياسة الحذف (Delete)
```sql
CREATE POLICY "Allow authenticated users to delete property images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-images' 
  AND auth.uid() IS NOT NULL
);
```

### تطبيق السياسات
1. اذهب إلى: https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/storage/buckets
2. اختر bucket `property-images`
3. انقر على "Policies"
4. أضف السياسات أعلاه واحدة تلو الأخرى

---

## 3️⃣ مشاكل RLS - Properties Table

### السياسات الحالية (موجودة وصحيحة)
✅ `properties_insert_authenticated` - للإدراج  
✅ `properties_staff_select` - للقراءة (staff)  
✅ `السماح بقراءة العقارات النشطة` - للقراءة (public)  
✅ `properties_update_authorized` - للتحديث  
✅ `properties_delete_authorized` - للحذف  
✅ `staff_manage_refs_props` - إدارة شاملة للـ staff

### لكن هناك مشكلة محتملة!

**سياسة INSERT الحالية:**
```sql
Policy: properties_insert_authenticated
WITH CHECK: auth.uid() IS NOT NULL
```

**المشكلة:** قد تحتاج أيضاً لفحص الدور (Role)

**الحل البديل (اختياري):**
```sql
-- حذف السياسة القديمة
DROP POLICY IF EXISTS properties_insert_authenticated ON properties;

-- إنشاء سياسة جديدة أكثر وضوحاً
CREATE POLICY "Allow authenticated users to insert properties"
ON properties
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND created_by = auth.uid()
);
```

---

## 4️⃣ فحص User Authentication

### التحقق من تسجيل الدخول
في `PropertyForm.tsx` يوجد الكود التالي (صحيح):
```typescript
const { data: { user }, error: userError } = await supabase.auth.getUser();
if (userError || !user) {
  toast.error("يجب تسجيل الدخول أولاً");
  navigate("/login");
  return;
}
```

### اختبار تسجيل الدخول
1. تأكد من تسجيل دخول المستخدم
2. افحص في Console:
```javascript
const { data } = await supabase.auth.getSession();
console.log('Current user:', data.session?.user);
```

---

## 5️⃣ خطوات التشخيص والإصلاح

### الخطوة 1: إصلاح React Error
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### الخطوة 2: فحص Storage Policies
1. اذهب إلى Supabase Dashboard
2. Storage → property-images → Policies
3. تأكد من وجود السياسات الـ 4 أعلاه
4. إذا لم تكن موجودة، أضفها

### الخطوة 3: اختبار إضافة عقار
1. سجل دخول كـ admin أو manager
2. اذهب إلى `/properties/add`
3. املأ النموذج
4. ارفع صورة
5. اضغط حفظ
6. راقب Console للأخطاء

### الخطوة 4: فحص الأخطاء
إذا ظهر خطأ، تحقق من:
```javascript
// في Console
// 1. حالة المستخدم
const { data } = await supabase.auth.getSession();
console.log(data);

// 2. اختبار INSERT يدوياً
const { data, error } = await supabase
  .from('properties')
  .insert({
    name: 'Test Property',
    type: 'residential',
    address: 'Test Address',
    status: 'active'
  })
  .select();
console.log({ data, error });

// 3. اختبار رفع صورة
const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
const { data, error } = await supabase.storage
  .from('property-images')
  .upload('test-' + Date.now() + '.jpg', file);
console.log({ data, error });
```

---

## 6️⃣ الأخطاء المحتملة ورسائلها

| الخطأ | السبب | الحل |
|-------|-------|------|
| `row-level security policy violation` | RLS Policy مفقودة أو خاطئة | أضف السياسات أعلاه |
| `ليس لديك صلاحية إضافة عقارات` | المستخدم ليس authenticated | سجل دخول |
| `فشل رفع الصورة` | Storage Policy مفقودة | أضف Storage Policies |
| `Cannot read properties of null` | React dependency issue | أعد تثبيت node_modules |
| `auth.uid() is null` | لم يتم تسجيل الدخول | سجل دخول أولاً |

---

## 7️⃣ سكريبت اختبار شامل

احفظ هذا في ملف `test-property-creation.js`:

```javascript
import { supabase } from '@/integrations/supabase/client';

async function testPropertyCreation() {
  console.log('=== Testing Property Creation ===');
  
  // 1. Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('❌ User not authenticated');
    return;
  }
  console.log('✅ User authenticated:', session.user.email);
  
  // 2. Test INSERT permission
  const testProperty = {
    name: 'Test Property ' + Date.now(),
    type: 'residential',
    address: 'Test Address',
    status: 'active',
    created_by: session.user.id
  };
  
  const { data, error } = await supabase
    .from('properties')
    .insert([testProperty])
    .select()
    .single();
  
  if (error) {
    console.error('❌ Insert failed:', error);
    return;
  }
  console.log('✅ Property created:', data);
  
  // 3. Test image upload
  const testBlob = new Blob(['test'], { type: 'image/jpeg' });
  const testFile = new File([testBlob], 'test.jpg', { type: 'image/jpeg' });
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('property-images')
    .upload(`test-${Date.now()}.jpg`, testFile);
  
  if (uploadError) {
    console.error('❌ Upload failed:', uploadError);
  } else {
    console.log('✅ Image uploaded:', uploadData);
  }
  
  // 4. Clean up - delete test property
  await supabase
    .from('properties')
    .delete()
    .eq('id', data.id);
  console.log('✅ Test property deleted');
  
  console.log('=== Test Complete ===');
}

// Run test
testPropertyCreation();
```

---

## 8️⃣ Checklist قبل الإنتاج

- [ ] إصلاح React Error (npm clean install)
- [ ] إضافة Storage Policies (4 سياسات)
- [ ] اختبار إضافة عقار محلياً
- [ ] اختبار رفع صورة
- [ ] اختبار تعديل عقار
- [ ] اختبار حذف عقار
- [ ] فحص الأدوار (admin/manager/staff)
- [ ] تفعيل Leaked Password Protection
- [ ] ترقية PostgreSQL
- [ ] إضافة search_path للدوال

---

## 9️⃣ روابط سريعة

- [Storage Policies](https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/storage/policies)
- [Database Policies](https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/database/policies)
- [Auth Users](https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/auth/users)
- [SQL Editor](https://supabase.com/dashboard/project/zrrffsjbfkphridqyais/sql/new)

---

**ملاحظة مهمة:**  
بعد تطبيق جميع الإصلاحات، يجب أن تعمل إضافة العقارات بشكل طبيعي. إذا استمرت المشكلة، راجع Console Logs والرسائل الأخطاء بدقة.
