# دليل تشغيل التطبيق على الهاتف (Capacitor)

## المتطلبات الأساسية

### لنظام Android:
- [Android Studio](https://developer.android.com/studio) مُثبت
- Java JDK 17 أو أحدث
- حساب Google Play Developer (للنشر)

### لنظام iOS:
- جهاز Mac مع Xcode مُثبت
- حساب Apple Developer (للنشر)

---

## خطوات الإعداد

### 1. نقل المشروع إلى GitHub

اضغط على زر **"Export to GitHub"** في Lovable لنقل الكود إلى حسابك.

### 2. استنساخ المشروع محلياً

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

### 3. تثبيت التبعيات

```bash
npm install
```

### 4. إضافة منصة Android

```bash
npx cap add android
```

### 5. بناء المشروع

```bash
npm run build
```

### 6. مزامنة Capacitor

```bash
npx cap sync
```

### 7. فتح المشروع في Android Studio

```bash
npx cap open android
```

### 8. تشغيل التطبيق

في Android Studio:
1. اختر جهاز محاكي أو وصّل هاتفك عبر USB
2. اضغط على زر **Run** (المثلث الأخضر)

---

## بناء ملف APK للتثبيت

```bash
cd android
./gradlew assembleDebug
```

سيكون ملف APK في:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## بناء ملف AAB للنشر على Google Play

```bash
cd android
./gradlew bundleRelease
```

---

## ملاحظات مهمة

### وضع التطوير (Hot Reload)
الإعداد الحالي مُفعّل فيه Hot Reload من خادم Lovable. التغييرات تظهر مباشرة على الهاتف.

### وضع الإنتاج
قبل النشر على المتجر، عدّل `capacitor.config.ts` واحذف قسم `server`:

```typescript
const config: CapacitorConfig = {
  appId: 'app.lovable.c6adaf510eef43e8bf45d65ac7ebe1aa',
  appName: 'uberfiix',
  webDir: 'dist',
  // احذف قسم server للإنتاج
  plugins: {
    // ...
  },
};
```

ثم أعد البناء والمزامنة:
```bash
npm run build
npx cap sync
```

---

## المزيد من المعلومات

📚 [دليل Capacitor الرسمي](https://capacitorjs.com/docs)
📚 [مقال Lovable عن تطبيقات الهاتف](https://docs.lovable.dev/tips-tricks/mobile-development)
