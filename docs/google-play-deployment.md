# دليل النشر على Google Play Store

## المتطلبات الأساسية

### 1. البيئة المحلية
- **Node.js** 20+ مثبت
- **Java JDK 17+** مثبت
- **Android Studio** مثبت مع Android SDK
- **حساب Google Play Console** (رسوم لمرة واحدة $25)

### 2. التحقق من البيئة
```bash
# التحقق من Java
java -version

# التحقق من Android SDK
echo $ANDROID_HOME
# أو
echo $ANDROID_SDK_ROOT
```

---

## خطوات البناء

### الخطوة 1: استنساخ المشروع
```bash
git clone https://github.com/YOUR_USERNAME/uberfix.git
cd uberfix
```

### الخطوة 2: تثبيت التبعيات
```bash
npm install
# أو
pnpm install
```

### الخطوة 3: إضافة منصة Android
```bash
npx cap add android
```

### الخطوة 4: بناء الويب
```bash
npm run build
```

### الخطوة 5: مزامنة Capacitor
```bash
npx cap sync android
```

### الخطوة 6: إنشاء مفتاح التوقيع (مرة واحدة فقط)
```bash
keytool -genkey -v -keystore android/app/uberfix-release-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias uberfix-key
```

**⚠️ هام:** احتفظ بملف `.jks` وكلمة المرور في مكان آمن! لا يمكن استعادتهما.

### الخطوة 7: تكوين التوقيع
أنشئ ملف `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=uberfix-key
storeFile=uberfix-release-key.jks
```

### الخطوة 8: تحديث build.gradle
في ملف `android/app/build.gradle`:
```gradle
android {
    ...
    
    signingConfigs {
        release {
            def keystorePropertiesFile = rootProject.file("key.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
            
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### الخطوة 9: بناء AAB
```bash
cd android
./gradlew bundleRelease
```

الملف الناتج:
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## النشر على Google Play Console

### 1. إنشاء التطبيق
1. اذهب إلى [Google Play Console](https://play.google.com/console)
2. اضغط **Create app**
3. املأ البيانات الأساسية:
   - اسم التطبيق: **UberFix**
   - اللغة الافتراضية: العربية
   - نوع التطبيق: App
   - مجاني/مدفوع: مجاني

### 2. إعداد Store Listing
- **Short description** (80 حرف): تطبيق إدارة الصيانة والعقارات الذكي
- **Full description** (4000 حرف): وصف كامل للتطبيق
- **Screenshots**: صور شاشة للهاتف والتابلت
- **Feature graphic**: 1024x500 بكسل
- **App icon**: 512x512 بكسل

### 3. Content Rating
1. اذهب إلى **Policy > App content**
2. أكمل استبيان التقييم العمري
3. التطبيق سيكون غالباً **PEGI 3** أو **Everyone**

### 4. Privacy Policy
أضف رابط سياسة الخصوصية (مطلوب للتطبيقات التي تجمع بيانات)

### 5. رفع AAB
1. اذهب إلى **Production > Create new release**
2. اضغط **Upload** وارفع ملف `.aab`
3. أضف ملاحظات الإصدار (Release notes)
4. اضغط **Save** ثم **Review release**

### 6. المراجعة والنشر
1. راجع كل التحذيرات والأخطاء
2. اضغط **Start rollout to Production**
3. انتظر مراجعة Google (1-7 أيام)

---

## استكشاف الأخطاء

### خطأ: SDK not found
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### خطأ: License not accepted
```bash
yes | sdkmanager --licenses
```

### خطأ: Keystore not found
تأكد من مسار الملف في `key.properties`

---

## سكربت البناء السريع
```bash
chmod +x scripts/build-android.sh
./scripts/build-android.sh
```

اختر الخيار 1 للبناء الكامل.

---

## التحديثات المستقبلية

لرفع تحديث جديد:
```bash
git pull
npm run build
npx cap sync android
cd android && ./gradlew bundleRelease
```

ثم ارفع الـ AAB الجديد على Google Play Console.
