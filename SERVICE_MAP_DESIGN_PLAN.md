# خطة تصميم وتطوير مديول الخرائط الخدمية
## تحليل شامل لواجهة خدمات الصيانة المنزلية

---

## 1. نظرة عامة على الواجهة

### الهدف الرئيسي
توفير واجهة تفاعلية تمكّن المستخدمين من:
- البحث عن مقدمي خدمات الصيانة القريبين جغرافياً
- فلترة النتائج حسب نوع الخدمة (سباكة، كهرباء، نجارة، إلخ)
- عرض تفاصيل كل مقدم خدمة (التقييم، التوفر، الموقع)
- طلب الخدمة مباشرة

### المستخدمون المستهدفون
1. **العملاء**: يبحثون عن فنيين متاحين لحل مشاكل عاجلة
2. **الفنيين/المزودين**: يظهرون على الخريطة بناءً على موقعهم الحالي
3. **المديرين**: يتتبعون توزيع الفنيين وحالة الخدمات

---

## 2. تحليل أقسام الواجهة

### 2.1 الشريط العلوي (Header)

#### العناصر
- **الشعار (Logo)**: في أقصى اليمين (RTL)
- **العنوان**: "Quick Maintenance Methods" أو "طرق الصيانة السريعة"
- **شريط البحث**: في الجانب الأيسر مع أيقونة بحث

#### الوظائف
```typescript
interface HeaderProps {
  logo: string;
  title: string;
  onSearch: (query: string) => void;
  searchPlaceholder: string;
}
```

#### حالات التفاعل
- **Focus**: تكبير خفيف لحقل البحث
- **Typing**: عرض اقتراحات فورية (autocomplete)
- **Clear**: زر × لمسح النص

#### مبادئ التصميم
- خلفية بيضاء نقية مع ظل خفيف (shadow-sm)
- ارتفاع ثابت: 64px - 72px
- استخدام `z-index: 50` للبقاء فوق المحتوى عند التمرير

---

### 2.2 شريط الفلاتر (Filter Bar)

#### العناصر
أزرار للتصنيفات الرئيسية:
- 🎨 دهان (Painting)
- ⚡ كهربائي (Electrical) 
- 🔧 نجار (Carpentry)
- 🔩 سباك (Plumbing)

#### البيانات
```typescript
interface ServiceFilter {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string; // emoji or lucide icon
  color: string; // للتمييز البصري
  isActive: boolean;
}
```

#### حالات التفاعل
- **Idle**: لون محايد (border + bg-background)
- **Hover**: رفع خفيف + تغيير لون الحد
- **Active**: لون مميز (bg-primary + text-primary-foreground)
- **Multi-Select**: إمكانية اختيار أكثر من فلتر

#### التأثير على النظام
عند الضغط → تصفية:
1. العلامات على الخريطة
2. القائمة الجانبية للخدمات
3. عدد النتائج المعروضة

---

### 2.3 لوحة الخدمات الجانبية (Services Sidebar)

#### الهيكل
```
┌─────────────────────┐
│ الخدمات المتاحة (6) │
├─────────────────────┤
│ ┌─────────────────┐ │
│ │ أحمد حسين      │ │
│ │ سباك           │ │
│ │ ⭐⭐⭐⭐⭐ 5    │ │
│ │ متاح الآن      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ محمد علي       │ │
│ │ كهربائي  ⚡    │ │
│ │ ⭐⭐⭐⭐ 4.8   │ │
│ └─────────────────┘ │
└─────────────────────┘
```

#### بطاقة المزود (Provider Card)
```typescript
interface ProviderCard {
  id: string;
  name: string;
  avatar?: string;
  specialization: string[];
  rating: number;
  totalReviews: number;
  status: 'available' | 'busy' | 'offline';
  estimatedArrival?: string; // "40 دقيقة"
  currentLocation: {
    lat: number;
    lng: number;
  };
}
```

#### حالات التفاعل
- **Hover**: ظل أقوى + رفع البطاقة قليلاً
- **Click**: 
  - تركيز الخريطة على موقع المزود
  - تمييز العلامة المقابلة على الخريطة
  - فتح نافذة التفاصيل
- **Selected**: حد ملون (border-primary)

#### التمرير
- `overflow-y: auto`
- ارتفاع محدد: `max-height: calc(100vh - 200px)`
- scrollbar مخصص للتناسق مع التصميم

---

### 2.4 الخريطة التفاعلية (Interactive Map)

#### التقنية
**Google Maps JavaScript API** مع:
- Custom Markers للفنيين
- Clustering للعلامات المتقاربة
- InfoWindow للتفاصيل السريعة

#### أنواع العلامات (Markers)

```typescript
interface MapMarker {
  position: google.maps.LatLngLiteral;
  icon: {
    url: string; // أيقونة مخصصة حسب التخصص
    scaledSize: google.maps.Size;
  };
  data: ProviderCard;
  status: 'available' | 'busy' | 'offline';
}
```

#### نظام الألوان للعلامات
- 🟡 **أصفر/برتقالي**: متاح
- 🔵 **أزرق**: مشغول
- 🟣 **بنفسجي**: متخصص محدد
- ⚫ **رمادي**: غير متصل

#### التفاعلات
1. **Click on Marker**:
   ```javascript
   marker.addListener('click', () => {
     map.panTo(marker.position);
     map.setZoom(16);
     openProviderPopup(marker.data);
   });
   ```

2. **Hover on Marker**: 
   - تكبير الأيقونة
   - عرض tooltip بسيط (الاسم + التقييم)

3. **Drag Map**: تحديث القائمة بناءً على المنطقة المرئية

4. **Zoom**: 
   - Zoom in: عرض تفاصيل أكثر
   - Zoom out: تجميع العلامات (clustering)

#### إعدادات الخريطة
```javascript
const mapOptions = {
  center: { lat: 30.0444, lng: 31.2357 }, // القاهرة
  zoom: 12,
  mapTypeControl: false, // إخفاء تبديل نوع الخريطة
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  styles: customMapStyle, // ألوان مخصصة لتناسب التصميم
  gestureHandling: 'greedy', // سلاسة في التحريك
};
```

---

### 2.5 نافذة تفاصيل المزود (Provider Popup)

#### الموقع
تطفو فوق الخريطة عند النقر على:
- علامة على الخريطة
- بطاقة في القائمة الجانبية

#### المحتوى
```
┌────────────────────────────┐
│  [X]                       │
│  أحمد حسين                 │
│  فني سباك                  │
│  ⭐⭐⭐⭐⭐ 5.0 (127)       │
│  📍 شبرا، الزاوية          │
│  🕒 متاح بعد 40 دقيقة       │
│  ┌────────────────────┐    │
│  │  طلب الخدمة       │    │
│  └────────────────────┘    │
└────────────────────────────┘
```

#### Styling
- خلفية بيضاء مع ظل قوي
- زوايا مستديرة (rounded-lg)
- Animation: fade-in + slide-up
- Backdrop blur خفيف للخلفية

#### Actions
```typescript
interface PopupActions {
  onRequestService: (providerId: string) => void;
  onCall: (phone: string) => void;
  onViewProfile: (providerId: string) => void;
  onClose: () => void;
}
```

---

### 2.6 شريط التنقل السفلي (Bottom Navigation)

#### العناصر
```typescript
const navItems = [
  { icon: User, label: 'الملف الشخصي', route: '/profile' },
  { icon: FileText, label: 'الفواتير', route: '/invoices' },
  { icon: CheckCircle, label: 'الخدمات المكتملة', route: '/completed' },
  { icon: Bell, label: 'تتبع الطلبات', route: '/track' },
  { icon: Plus, label: 'طلب سريع', route: '/quick-request', primary: true },
  { icon: MapPin, label: 'الخريطة', route: '/map', active: true },
];
```

#### التخطيط
- Position: `fixed bottom-0`
- توزيع متساوٍ: `justify-evenly`
- ارتفاع: 72px على الجوال، 64px على سطح المكتب

#### حالات التفاعل
- **Active**: لون primary + أيقونة ممتلئة
- **Inactive**: لون muted + أيقونة outline
- **Primary Action** (طلب سريع): زر دائري بارز (FAB)

---

## 3. هيكل المكونات (Component Tree)

```
ServiceMapPage
├── MapHeader
│   ├── Logo
│   ├── Title
│   └── SearchBar
│       └── SearchInput
│           └── SearchIcon
│
├── FilterBar
│   └── FilterButton[] (متعدد)
│       ├── Icon
│       └── Label
│
├── LayoutContainer (flex)
│   ├── ProvidersSidebar
│   │   ├── SidebarHeader
│   │   │   └── ResultCount
│   │   └── ProvidersList
│   │       └── ProviderCard[]
│   │           ├── Avatar
│   │           ├── Name
│   │           ├── Specialization
│   │           ├── Rating
│   │           └── StatusBadge
│   │
│   └── MapContainer
│       ├── GoogleMapReact
│       │   └── CustomMarker[]
│       │       ├── MarkerIcon
│       │       └── MarkerLabel
│       │
│       └── ProviderPopup (conditional)
│           ├── PopupHeader
│           ├── ProviderDetails
│           │   ├── Rating
│           │   ├── Location
│           │   └── ETA
│           └── ActionButtons
│               ├── RequestButton
│               └── CallButton
│
└── BottomNavigation
    └── NavItem[]
        ├── Icon
        └── Label
```

---

## 4. إدارة الحالة (State Management)

### State المطلوب

```typescript
interface ServiceMapState {
  // الفلاتر
  selectedFilters: string[]; // ['plumbing', 'electrical']
  searchQuery: string;
  
  // البيانات
  providers: ProviderCard[];
  filteredProviders: ProviderCard[];
  
  // الخريطة
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  mapBounds: google.maps.LatLngBounds | null;
  
  // التفاعل
  selectedProvider: ProviderCard | null;
  hoveredProvider: string | null; // ID
  
  // UI
  isLoading: boolean;
  isSidebarOpen: boolean; // للجوال
  isPopupOpen: boolean;
}
```

### Actions

```typescript
// الفلاتر
const toggleFilter = (filterId: string) => {
  // toggle في selectedFilters
  // ثم filterProviders()
};

const handleSearch = (query: string) => {
  // تحديث searchQuery
  // filterProviders()
};

// التفاعل مع الخريطة
const selectProvider = (provider: ProviderCard) => {
  // تعيين selectedProvider
  // تحديث mapCenter إلى موقع المزود
  // فتح Popup
};

const closePopup = () => {
  // إغلاق Popup
  // إزالة selectedProvider
};

// جلب البيانات
const fetchProviders = async () => {
  const { data } = await supabase
    .from('vendors')
    .select('*')
    .eq('is_tracking_enabled', true)
    .not('current_latitude', 'is', null);
  
  setProviders(data);
};
```

### تصفية البيانات

```typescript
const filterProviders = () => {
  let filtered = providers;
  
  // تصفية حسب الفلتر
  if (selectedFilters.length > 0) {
    filtered = filtered.filter(p =>
      p.specialization.some(s => selectedFilters.includes(s))
    );
  }
  
  // تصفية حسب البحث
  if (searchQuery) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialization.some(s => 
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }
  
  // تصفية حسب حدود الخريطة (إذا كانت محددة)
  if (mapBounds) {
    filtered = filtered.filter(p =>
      mapBounds.contains({
        lat: p.current_latitude,
        lng: p.current_longitude
      })
    );
  }
  
  setFilteredProviders(filtered);
};
```

---

## 5. التصور التقني - أمثلة الكود

### 5.1 المكون الرئيسي

```typescript
// src/pages/ServiceMap.tsx
import { useState, useEffect } from 'react';
import { MapHeader } from '@/components/service-map/MapHeader';
import { FilterBar } from '@/components/service-map/FilterBar';
import { ProvidersSidebar } from '@/components/service-map/ProvidersSidebar';
import { MapView } from '@/components/service-map/MapView';
import { BottomNavigation } from '@/components/service-map/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';

export default function ServiceMap() {
  // ═══ State Management ═══
  const [providers, setProviders] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // ═══ Data Fetching ═══
  useEffect(() => {
    fetchProviders();
  }, []);
  
  const fetchProviders = async () => {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_tracking_enabled', true);
    setProviders(data || []);
  };
  
  // ═══ Filtering Logic ═══
  const filteredProviders = providers.filter(p => {
    // تطبيق الفلاتر المحددة
    if (selectedFilters.length && 
        !p.specialization?.some(s => selectedFilters.includes(s))) {
      return false;
    }
    // تطبيق البحث
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery)) {
      return false;
    }
    return true;
  });
  
  // ═══ Render ═══
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* الشريط العلوي */}
      <MapHeader 
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />
      
      {/* شريط الفلاتر */}
      <FilterBar
        selectedFilters={selectedFilters}
        onToggleFilter={(id) => {
          setSelectedFilters(prev =>
            prev.includes(id) 
              ? prev.filter(f => f !== id)
              : [...prev, id]
          );
        }}
      />
      
      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex overflow-hidden">
        {/* القائمة الجانبية */}
        <ProvidersSidebar
          providers={filteredProviders}
          selectedId={selectedProvider?.id}
          onSelectProvider={setSelectedProvider}
        />
        
        {/* الخريطة */}
        <MapView
          providers={filteredProviders}
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
        />
      </div>
      
      {/* شريط التنقل السفلي */}
      <BottomNavigation />
    </div>
  );
}
```

### 5.2 مكون الخريطة

```typescript
// src/components/service-map/MapView.tsx
import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { ProviderPopup } from './ProviderPopup';

interface MapViewProps {
  providers: Provider[];
  selectedProvider: Provider | null;
  onSelectProvider: (provider: Provider) => void;
}

export function MapView({ 
  providers, 
  selectedProvider, 
  onSelectProvider 
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  
  // ═══ تهيئة الخريطة ═══
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 30.0444, lng: 31.2357 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      styles: customMapStyles, // أسلوب مخصص
    });
  }, []);
  
  // ═══ تحديث العلامات ═══
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // مسح العلامات القديمة
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    
    // إضافة علامات جديدة
    providers.forEach(provider => {
      const marker = new google.maps.Marker({
        position: {
          lat: provider.current_latitude,
          lng: provider.current_longitude
        },
        map: mapInstanceRef.current,
        icon: {
          url: getMarkerIcon(provider.specialization[0]),
          scaledSize: new google.maps.Size(48, 48),
        },
        title: provider.name,
      });
      
      // حدث النقر
      marker.addListener('click', () => {
        onSelectProvider(provider);
        mapInstanceRef.current?.panTo(marker.getPosition()!);
      });
      
      markersRef.current.push(marker);
    });
  }, [providers]);
  
  return (
    <div className="flex-1 relative">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* نافذة التفاصيل */}
      {selectedProvider && (
        <ProviderPopup
          provider={selectedProvider}
          onClose={() => onSelectProvider(null)}
        />
      )}
    </div>
  );
}

// ═══ Helper Functions ═══
function getMarkerIcon(specialization: string): string {
  const icons = {
    plumbing: '/markers/plumber.png',
    electrical: '/markers/electrician.png',
    carpentry: '/markers/carpenter.png',
    painting: '/markers/painter.png',
  };
  return icons[specialization] || '/markers/default.png';
}

const customMapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }] // إخفاء نقاط الاهتمام
  },
  // ... المزيد من التخصيصات
];
```

### 5.3 بطاقة المزود

```typescript
// src/components/service-map/ProviderCard.tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProviderCardProps {
  provider: Provider;
  isSelected: boolean;
  onClick: () => void;
}

export function ProviderCard({ 
  provider, 
  isSelected, 
  onClick 
}: ProviderCardProps) {
  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all",
        "hover:shadow-md hover:-translate-y-0.5",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
      onClick={onClick}
    >
      {/* رأس البطاقة - الاسم والحالة */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-foreground">
            {provider.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {provider.specialization.join(' • ')}
          </p>
        </div>
        
        <Badge variant={
          provider.status === 'available' ? 'default' : 'secondary'
        }>
          {provider.status === 'available' ? 'متاح' : 'مشغول'}
        </Badge>
      </div>
      
      {/* التقييم */}
      <div className="flex items-center gap-1 mb-2">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(provider.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        <span className="text-sm font-medium">
          {provider.rating.toFixed(1)}
        </span>
        <span className="text-xs text-muted-foreground">
          ({provider.total_reviews} تقييم)
        </span>
      </div>
      
      {/* الموقع ووقت الوصول */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {provider.current_latitude.toFixed(4)}, 
            {provider.current_longitude.toFixed(4)}
          </span>
        </div>
        
        {provider.estimated_arrival && (
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Clock className="h-3.5 w-3.5" />
            <span>متاح بعد {provider.estimated_arrival}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
```

---

## 6. مبادئ التصميم المطبقة

### 6.1 التدرج البصري (Visual Hierarchy)

#### المستوى الأول: العناوين والأزرار الرئيسية
- حجم الخط: `text-xl` (20px) - `text-2xl` (24px)
- الوزن: `font-bold` (700)
- اللون: `text-foreground` (أغمق لون متاح)

#### المستوى الثاني: المحتوى الرئيسي
- حجم الخط: `text-base` (16px)
- الوزن: `font-medium` (500)
- اللون: `text-foreground`

#### المستوى الثالث: التفاصيل الثانوية
- حجم الخط: `text-sm` (14px)
- الوزن: `font-normal` (400)
- اللون: `text-muted-foreground`

### 6.2 نظام المسافات (Spacing System)

```css
/* نظام Tailwind الافتراضي */
--spacing-xs: 0.25rem;  /* 4px  - gap-1 */
--spacing-sm: 0.5rem;   /* 8px  - gap-2 */
--spacing-md: 1rem;     /* 16px - gap-4 */
--spacing-lg: 1.5rem;   /* 24px - gap-6 */
--spacing-xl: 2rem;     /* 32px - gap-8 */
```

**التطبيق**:
- بين العناصر داخل البطاقة: `gap-2` (8px)
- بين البطاقات: `gap-4` (16px)
- بين الأقسام الرئيسية: `gap-6` (24px)
- هوامش الحاويات: `p-4` أو `p-6`

### 6.3 نظام الألوان (Color System)

#### الألوان الدلالية (Semantic Colors)
```css
/* من index.css و tailwind.config.ts */
--primary: /* اللون الأساسي للعلامة التجارية */
--primary-foreground: /* نص على primary */

--secondary: /* لون ثانوي */
--secondary-foreground: /* نص على secondary */

--muted: /* خلفيات خفيفة */
--muted-foreground: /* نص خافت */

--accent: /* للتأكيدات */
--destructive: /* للتحذيرات والأخطاء */

--border: /* حدود العناصر */
--background: /* خلفية الصفحة */
--foreground: /* النص الرئيسي */
```

#### تطبيق الألوان حسب الحالة
- **متاح**: `bg-green-50 text-green-700 border-green-200`
- **مشغول**: `bg-orange-50 text-orange-700 border-orange-200`
- **غير متصل**: `bg-gray-50 text-gray-500 border-gray-200`

### 6.4 الاستجابة للأحجام (Responsive Design)

#### Breakpoints
```typescript
const breakpoints = {
  sm: '640px',   // هواتف كبيرة
  md: '768px',   // أجهزة لوحية
  lg: '1024px',  // أجهزة لوحية كبيرة / شاشات صغيرة
  xl: '1280px',  // شاشات سطح المكتب
  '2xl': '1536px' // شاشات كبيرة
};
```

#### تخطيط متجاوب
```typescript
// القائمة الجانبية
<ProvidersSidebar className={cn(
  "w-full lg:w-80 xl:w-96", // عرض متغير
  "h-64 lg:h-full",         // ارتفاع متغير
  "overflow-y-auto"
)} />

// الخريطة
<MapView className="flex-1 min-h-[400px]" />

// شريط الفلاتر
<FilterBar className={cn(
  "flex flex-wrap gap-2",
  "md:flex-nowrap md:gap-4" // بدون لف على الشاشات الكبيرة
)} />
```

### 6.5 قابلية القراءة بالعربية

#### خطوط عربية واضحة
```css
font-family: 'Cairo', 'Tajawal', 'Almarai', system-ui, sans-serif;
```

#### توجيه RTL
```html
<html dir="rtl" lang="ar">
```

```css
/* تطبيق RTL على المكونات */
.service-map {
  direction: rtl;
  text-align: right;
}

/* عكس الهوامش والمسافات */
.provider-card {
  margin-inline-start: 0;  /* بدلاً من margin-left */
  margin-inline-end: 1rem; /* بدلاً من margin-right */
}
```

#### أحجام خطوط مناسبة
- **الحد الأدنى للنص العربي**: `14px` (text-sm)
- **النص الأساسي**: `16px` (text-base)
- **العناوين**: `20px+` (text-xl)

### 6.6 الظلال والعمق (Shadows & Depth)

```css
/* مستويات العمق */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

**التطبيق**:
- البطاقات: `shadow-sm` في الحالة العادية، `shadow-md` عند الـ hover
- النوافذ المنبثقة: `shadow-xl`
- الشريط العلوي: `shadow-sm` للفصل البصري

### 6.7 الحركة والانتقالات (Animations & Transitions)

```css
/* سلاسة الانتقالات */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.transition-transform {
  transition-property: transform;
  transition-duration: 200ms;
}
```

**أمثلة الاستخدام**:
```typescript
// Hover على البطاقة
className="transition-all hover:-translate-y-0.5 hover:shadow-md"

// فتح النافذة المنبثقة
className="animate-in fade-in slide-in-from-bottom-4 duration-300"

// إغلاق النافذة
className="animate-out fade-out slide-out-to-bottom-4 duration-200"
```

---

## 7. تحسينات الأداء (Performance Optimizations)

### 7.1 Lazy Loading للبيانات
```typescript
// تحميل المزودين داخل حدود الخريطة فقط
const fetchProvidersInBounds = async (bounds: google.maps.LatLngBounds) => {
  const { data } = await supabase
    .from('vendors')
    .select('*')
    .gte('current_latitude', bounds.getSouthWest().lat())
    .lte('current_latitude', bounds.getNorthEast().lat())
    .gte('current_longitude', bounds.getSouthWest().lng())
    .lte('current_longitude', bounds.getNorthEast().lng());
  
  return data;
};
```

### 7.2 Debouncing للبحث
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (query: string) => {
    filterProviders(query);
  },
  300 // انتظار 300ms بعد آخر ضغطة مفتاح
);
```

### 7.3 Memoization للعمليات الثقيلة
```typescript
import { useMemo } from 'react';

const filteredProviders = useMemo(() => {
  return providers.filter(p => {
    // منطق التصفية المعقد
  });
}, [providers, selectedFilters, searchQuery]);
```

### 7.4 Virtual Scrolling للقوائم الطويلة
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={filteredProviders.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <ProviderCard provider={filteredProviders[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## 8. اختبار تجربة المستخدم (UX Testing)

### سيناريوهات الاختبار

#### 1. البحث عن فني سباكة قريب
**الخطوات**:
1. فتح صفحة الخريطة
2. النقر على فلتر "سباك"
3. مشاهدة تحديث الخريطة والقائمة
4. النقر على بطاقة فني
5. التحقق من فتح نافذة التفاصيل
6. النقر على "طلب الخدمة"

**النتيجة المتوقعة**: 
- تصفية سريعة (< 300ms)
- تركيز سلس على الخريطة
- انتقال واضح إلى نموذج الطلب

#### 2. المقارنة بين عدة فنيين
**الخطوات**:
1. اختيار تخصص من الفلاتر
2. التمرير في القائمة الجانبية
3. مقارنة التقييمات والأسعار
4. النقر على فنيين مختلفين

**النتيجة المتوقعة**:
- عرض واضح للاختلافات
- سهولة التنقل بين البطاقات
- تحديث فوري للخريطة

---

## 9. خطة التنفيذ التدريجية

### المرحلة 1: الأساسيات (Week 1)
- [x] إعداد الصفحة الرئيسية
- [x] دمج Google Maps API
- [x] عرض علامات ثابتة
- [x] قائمة المزودين الأساسية

### المرحلة 2: التفاعل (Week 2)
- [ ] نظام الفلترة الكامل
- [ ] البحث المباشر
- [ ] النوافذ المنبثقة التفاعلية
- [ ] ربط النقر بين القائمة والخريطة

### المرحلة 3: التحسينات (Week 3)
- [ ] تجميع العلامات (clustering)
- [ ] تحسين الأداء (debouncing, memoization)
- [ ] Responsive design للجوال
- [ ] Animations سلسة

### المرحلة 4: الميزات المتقدمة (Week 4)
- [ ] التتبع الحي للفنيين
- [ ] حساب وقت الوصول الفعلي
- [ ] نظام الحجز المباشر
- [ ] الإشعارات الفورية

---

## 10. الخلاصة والتوصيات

### نقاط القوة في التصميم الحالي
✅ واجهة نظيفة وواضحة
✅ تدفق منطقي للمعلومات
✅ تكامل جيد بين القائمة والخريطة
✅ نظام ألوان متسق

### فرص التحسين
🔄 إضافة فلترة متقدمة (السعر، التقييم، المسافة)
🔄 عرض المسار إلى موقع الفني
🔄 دمج نظام الدفع المباشر
🔄 تقييم الخدمة بعد الإنجاز

### المتطلبات التقنية الضرورية
- **Google Maps API Key**: للوصول إلى خدمات الخرائط
- **Geolocation Permission**: لتحديد موقع المستخدم
- **Real-time Updates**: لتتبع الفنيين المتحركين (WebSocket أو Supabase Realtime)
- **Push Notifications**: لإشعارات الحجز والوصول

---

**تم إعداد هذه الوثيقة وفقاً لأفضل ممارسات UX/UI وهندسة Front-end**

📅 آخر تحديث: 2025-11-21
🔖 الإصدار: 1.0
