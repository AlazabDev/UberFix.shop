# مديول Uber Map - دليل التشغيل الكامل

## نظرة عامة
مديول متكامل لإدارة الخدمات على الخريطة بنمط Uber، يشمل تتبع المواقع، إدارة الطلبات، والفواتير.

## المسارات المتاحة

### المسارات الرئيسية
- `/uber-map` - الصفحة الرئيسية للخريطة
- `/uber-map/register-service` - تسجيل خدمة جديدة
- `/uber-map/quick-request` - طلب سريع
- `/uber-map/track-orders` - تتبع الطلبات
- `/uber-map/invoices` - الفواتير
- `/uber-map/completed-services` - الخدمات المكتملة

### مسار الاختبار
- `/uber-map-test` - صفحة اختبار المديول

## البنية التحتية

### قاعدة البيانات
#### جدول `map_locations`
```sql
- id: uuid (PRIMARY KEY)
- name: text
- description: text
- latitude: numeric
- longitude: numeric
- location_type: text
- created_at: timestamptz
- updated_at: timestamptz
```

#### جدول `map_markers`
```sql
- id: uuid (PRIMARY KEY)
- title: text
- description: text
- latitude: numeric
- longitude: numeric
- color: text
- icon: text
- is_active: boolean
- created_at: timestamptz
- updated_at: timestamptz
```

### Hooks المتاحة
#### `useMapLocations()`
- `locations` - قائمة المواقع
- `markers` - قائمة العلامات
- `loading` - حالة التحميل
- `addLocation(location)` - إضافة موقع
- `addMarker(marker)` - إضافة علامة
- `deleteLocation(id)` - حذف موقع
- `deleteMarker(id)` - حذف علامة
- `refetch()` - تحديث البيانات

## المكونات الرئيسية

### Navigation
شريط التنقل السفلي يحتوي على:
- الخريطة
- طلب سريع
- تتبع الطلبات
- الخدمات المكتملة
- الفواتير
- الملف الشخصي

### MapView
مكون الخريطة التفاعلية مع:
- عرض Google Maps
- إضافة علامات
- تتبع الموقع الحي
- دعم المكتبات: places, drawing, geometry, visualization, marker

### SaveLocationDialog
حوار حفظ المواقع مع:
- إدخال الاسم والوصف
- حفظ تلقائي للإحداثيات
- تكامل مع Supabase

## التكامل مع Google Maps

### المتغيرات البيئية المطلوبة
```env
VITE_FRONTEND_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_URL=https://forge.butterfly-effect.dev
```

### الاستخدام
```tsx
import { MapView } from '@/modules/uber-map/components/Map';

<MapView
  center={{ lat: 30.0444, lng: 31.2357 }}
  zoom={13}
  className="w-full h-[600px]"
  onMapReady={(map) => {
    // إضافة علامات أو خدمات
  }}
/>
```

## سياسات الأمان (RLS)

### map_locations
- `authenticated users can read locations`
- `authenticated users can insert locations`
- `users can update own locations`
- `users can delete own locations`

### map_markers
- `authenticated users can read markers`
- `authenticated users can insert markers`
- `users can update own markers`
- `users can delete own markers`

## الصفحات

### MapPage
- عرض الخريطة الرئيسية
- إدارة العلامات والمواقع
- تتبع الموقع الحي

### RegisterService
- تسجيل خدمة جديدة
- نموذج متعدد الخطوات
- التحقق من البيانات

### QuickRequest
- طلب سريع للخدمة
- إدخال بيانات العميل
- اختيار نوع الخدمة

### TrackOrders
- عرض الطلبات الحالية
- تتبع حالة الطلب
- فلترة حسب الحالة

### Invoices
- عرض الفواتير
- فلترة حسب الحالة
- تفاصيل الفاتورة

### CompletedServices
- الخدمات المكتملة
- تقييم الخدمة
- عرض التفاصيل

## الميزات

### تتبع الموقع الحي
- تحديث تلقائي للموقع
- عرض المسار على الخريطة
- حساب المسافة والوقت

### إدارة العلامات
- إضافة علامات ملونة
- وصف تفصيلي
- تفعيل/إلغاء تفعيل

### نظام الطلبات
- حالات متعددة (pending, confirmed, in-progress, completed, cancelled)
- تتبع في الوقت الفعلي
- إشعارات تلقائية

### نظام الفواتير
- فواتير تفصيلية
- حالات الدفع (paid, pending, overdue)
- عرض العناصر

## التصميم

### الألوان
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)

### الخطوط
- Cairo - للنصوص العربية
- Font sizes: xs, sm, base, lg, xl, 2xl, 3xl

### المكونات
جميع المكونات تستخدم:
- Tailwind CSS للتنسيق
- Radix UI للمكونات التفاعلية
- Lucide React للأيقونات

## الأخطاء الشائعة وحلولها

### 1. Google Maps لا يظهر
**الحل**: تحقق من:
- المتغيرات البيئية موجودة
- API Key صحيح
- الإنترنت متصل

### 2. لا يمكن حفظ الموقع
**الحل**: تحقق من:
- المستخدم مسجل دخول
- RLS Policies مفعلة
- الاتصال بـ Supabase

### 3. العلامات لا تظهر
**الحل**: تحقق من:
- `is_active = true` في جدول markers
- الإحداثيات صحيحة
- onMapReady تم استدعاؤه

## الصيانة

### تحديث البيانات
```typescript
const { refetch } = useMapLocations();
// استدعاء refetch() عند الحاجة
```

### مسح الذاكرة المؤقتة
```typescript
// في حالة مشاكل التحميل
localStorage.clear();
location.reload();
```

## الملاحظات الهامة

1. **الأداء**: استخدم lazy loading للصفحات
2. **الأمان**: جميع البيانات محمية بـ RLS
3. **التوافق**: يعمل على جميع المتصفحات الحديثة
4. **اللغة**: واجهة عربية كاملة (RTL)
5. **Mobile**: متجاوب مع جميع الشاشات

## الدعم الفني

للمشاكل أو الاستفسارات:
1. راجع console logs للأخطاء
2. تحقق من network requests
3. راجع Supabase logs
4. تواصل مع فريق التطوير

---

**الإصدار**: 1.0.0  
**آخر تحديث**: 2025-01-12  
**الحالة**: ✅ جاهز للإنتاج
