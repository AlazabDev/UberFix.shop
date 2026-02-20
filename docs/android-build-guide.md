# 📱 دليل بناء ونشر تطبيق UberFix على Google Play Store

> **آخر تحديث:** فبراير 2026  
> **النظام المستهدف:** Ubuntu 24.04 (أو أي Linux/macOS/Windows)  
> **App ID:** `app.lovable.c6adaf510eef43e8bf45d65ac7ebe1aa`

---

## 📋 جدول المحتويات

1. [المتطلبات الأساسية](#1-المتطلبات-الأساسية)
2. [إعداد بيئة التطوير على Ubuntu](#2-إعداد-بيئة-التطوير-على-ubuntu)
3. [استنساخ المشروع وتثبيت التبعيات](#3-استنساخ-المشروع-وتثبيت-التبعيات)
4. [إعداد Capacitor وإضافة Android](#4-إعداد-capacitor-وإضافة-android)
5. [بناء المشروع للإنتاج](#5-بناء-المشروع-للإنتاج)
6. [إنشاء مفتاح التوقيع (Keystore)](#6-إنشاء-مفتاح-التوقيع-keystore)
7. [تكوين التوقيع في Gradle](#7-تكوين-التوقيع-في-gradle)
8. [بناء ملف AAB للنشر](#8-بناء-ملف-aab-للنشر)
9. [اختبار APK على الجهاز](#9-اختبار-apk-على-الجهاز)
10. [النشر على Google Play Console](#10-النشر-على-google-play-console)
11. [التحديثات المستقبلية](#11-التحديثات-المستقبلية)
12. [استكشاف الأخطاء](#12-استكشاف-الأخطاء)

---

## 1. المتطلبات الأساسية

| المتطلب | الحد الأدنى | التحقق |
|---------|-------------|--------|
| Node.js | v20+ | `node -v` |
| npm/pnpm | v9+ | `npm -v` |
| Java JDK | 17+ | `java -version` |
| Android SDK | API 34+ | `sdkmanager --list` |
| Android Studio | Latest | — |
| حساب Google Play | مفعّل ($25) | [play.google.com/console](https://play.google.com/console) |

---

## 2. إعداد بيئة التطوير على Ubuntu

### 2.1 تثبيت Node.js 20+

```bash
# إزالة أي إصدار قديم
sudo apt remove -y nodejs npm

# تثبيت Node.js 20 عبر NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# التحقق
node -v   # يجب أن يكون v20.x أو أحدث
npm -v
```

### 2.2 تثبيت Java JDK 17

```bash
sudo apt update
sudo apt install -y openjdk-17-jdk

# التحقق
java -version
javac -version

# تعيين JAVA_HOME
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

### 2.3 تثبيت Android SDK (بدون Android Studio)

> إذا كنت تعمل على سيرفر بدون واجهة رسومية، يمكنك تثبيت SDK فقط:

```bash
# إنشاء مجلد SDK
mkdir -p ~/android-sdk/cmdline-tools

# تحميل Command Line Tools
cd /tmp
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mv cmdline-tools ~/android-sdk/cmdline-tools/latest

# تعيين متغيرات البيئة
cat >> ~/.bashrc << 'EOF'
export ANDROID_HOME=$HOME/android-sdk
export ANDROID_SDK_ROOT=$HOME/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/build-tools/34.0.0
EOF

source ~/.bashrc

# قبول التراخيص وتثبيت المكونات المطلوبة
yes | sdkmanager --licenses
sdkmanager "platforms;android-34" \
           "build-tools;34.0.0" \
           "platform-tools" \
           "extras;google;m2repository" \
           "extras;android;m2repository"

# التحقق
sdkmanager --list | head -20
```

### 2.4 تثبيت Android Studio (اختياري - للتطوير بواجهة رسومية)

```bash
# تحميل وتثبيت عبر snap
sudo snap install android-studio --classic

# أو تحميل يدوي
# https://developer.android.com/studio
```

---

## 3. استنساخ المشروع وتثبيت التبعيات

```bash
# 1. استنساخ المشروع من GitHub
git clone https://github.com/YOUR_USERNAME/uberfix.git
cd uberfix

# 2. تثبيت التبعيات
npm install

# 3. التحقق من تبعيات Capacitor
npx cap --version
# يجب أن يظهر 8.x
```

---

## 4. إعداد Capacitor وإضافة Android

### 4.1 التحقق من ملف capacitor.config.ts

الملف موجود بالفعل في المشروع. تأكد أن الإعدادات صحيحة:

```typescript
// capacitor.config.ts - الإعدادات الحالية
const config: CapacitorConfig = {
  appId: 'app.lovable.c6adaf510eef43e8bf45d65ac7ebe1aa',
  appName: 'UberFix - صيانة المباني',
  webDir: 'dist',
  // في وضع الإنتاج، لا يوجد server URL (يستخدم الملفات المحلية)
  // في وضع التطوير، يتصل بسيرفر Lovable للـ hot-reload
};
```

### 4.2 إضافة منصة Android

```bash
# إضافة Android (مرة واحدة فقط)
npx cap add android

# ستظهر رسالة نجاح وسيتم إنشاء مجلد android/
```

### 4.3 هيكل مجلد Android الناتج

```
android/
├── app/
│   ├── build.gradle          ← إعدادات البناء
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/         ← كود Java
│   │       ├── res/          ← الموارد (أيقونات، ألوان، إلخ)
│   │       └── assets/
│   │           └── public/   ← ملفات الويب المبنية
│   └── uberfix-release-key.jks  ← مفتاح التوقيع (ستنشئه لاحقاً)
├── build.gradle              ← إعدادات Gradle الرئيسية
├── gradle.properties
├── key.properties            ← كلمات مرور المفتاح (ستنشئه لاحقاً)
└── settings.gradle
```

---

## 5. بناء المشروع للإنتاج

```bash
# 1. تعيين بيئة الإنتاج
export NODE_ENV=production

# 2. بناء ملفات الويب
npm run build

# ستُنشأ في مجلد dist/
ls -la dist/

# 3. مزامنة Capacitor - ينسخ dist/ إلى android/app/src/main/assets/public/
npx cap sync android
```

**⚠️ مهم:** في وضع الإنتاج، `capacitor.config.ts` لا يضيف قسم `server`، مما يعني أن التطبيق سيعمل من الملفات المحلية داخل APK/AAB.

---

## 6. إنشاء مفتاح التوقيع (Keystore)

> ⚠️ **تحذير حرج:** احتفظ بنسخة احتياطية من ملف `.jks` وكلمات المرور في مكان آمن جداً.  
> فقدانهما يعني عدم القدرة على تحديث التطبيق على Google Play أبداً!

```bash
# إنشاء Keystore
keytool -genkey -v \
  -keystore android/app/uberfix-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias uberfix-key \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=UberFix, OU=Development, O=UberFix, L=Cairo, ST=Cairo, C=EG"

# التحقق من المفتاح
keytool -list -v -keystore android/app/uberfix-release-key.jks -alias uberfix-key
```

**استبدل:**
- `YOUR_STORE_PASSWORD` → كلمة مرور قوية للمخزن
- `YOUR_KEY_PASSWORD` → كلمة مرور قوية للمفتاح

---

## 7. تكوين التوقيع في Gradle

### 7.1 إنشاء ملف key.properties

```bash
cat > android/key.properties << EOF
storePassword=YOUR_STORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=uberfix-key
storeFile=uberfix-release-key.jks
EOF

# حماية الملف
chmod 600 android/key.properties
```

### 7.2 تعديل android/app/build.gradle

أضف هذا القسم **قبل** بلوك `android { }`:

```gradle
// قراءة مفتاح التوقيع
def keystorePropertiesFile = rootProject.file("key.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

ثم **داخل** بلوك `android { }`:

```gradle
android {
    // ... الإعدادات الموجودة ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 7.3 إضافة ملفات Keystore إلى .gitignore

```bash
# تأكد أن هذه الأسطر موجودة في .gitignore
echo "android/key.properties" >> .gitignore
echo "*.jks" >> .gitignore
echo "*.keystore" >> .gitignore
```

---

## 8. بناء ملف AAB للنشر

### 8.1 استخدام السكربت الجاهز

```bash
# إعطاء صلاحية التنفيذ
chmod +x scripts/build-android.sh

# تشغيل البناء الكامل
./scripts/build-android.sh
# اختر الخيار 1 للبناء الكامل
```

### 8.2 البناء اليدوي خطوة بخطوة

```bash
# 1. بناء الويب
NODE_ENV=production npm run build

# 2. مزامنة Capacitor
npx cap sync android

# 3. الانتقال لمجلد Android
cd android

# 4. بناء AAB (Android App Bundle)
./gradlew bundleRelease

# 5. التحقق من الملف الناتج
ls -la app/build/outputs/bundle/release/app-release.aab

# الملف الناتج:
# android/app/build/outputs/bundle/release/app-release.aab
```

### 8.3 التحقق من AAB

```bash
# حجم الملف (يجب أن يكون أقل من 150MB)
du -sh app/build/outputs/bundle/release/app-release.aab

# التحقق بأداة bundletool (اختياري)
# تحميل bundletool: https://github.com/google/bundletool/releases
java -jar bundletool.jar validate --bundle=app/build/outputs/bundle/release/app-release.aab
```

---

## 9. اختبار APK على الجهاز

### 9.1 بناء APK للاختبار

```bash
cd android
./gradlew assembleDebug

# الملف الناتج:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### 9.2 التثبيت على الجهاز

```bash
# عبر ADB (الجهاز متصل بـ USB مع وضع Developer مفعّل)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# أو نقل الملف يدوياً إلى الهاتف وتثبيته
```

### 9.3 التشغيل على Emulator

```bash
# تشغيل مباشرة
npx cap run android

# أو فتح في Android Studio
npx cap open android
# ثم اضغط Run (▶)
```

---

## 10. النشر على Google Play Console

### 10.1 إعداد التطبيق

1. اذهب إلى [Google Play Console](https://play.google.com/console)
2. **Account ID:** `4760575196292844822` (حساب `alazab_co`)
3. اضغط **Create app**
4. املأ البيانات:

| الحقل | القيمة |
|-------|--------|
| App name | UberFix - صيانة المباني |
| Default language | العربية (ar) |
| App type | App |
| Free/Paid | Free |
| Declarations | ✅ Accept all |

### 10.2 Store Listing (بيانات المتجر)

```
Short description (80 حرف):
تطبيق إدارة طلبات الصيانة والعقارات الذكي - UberFix

Full description:
UberFix هو نظام متكامل لإدارة طلبات الصيانة والعقارات.
يتيح لك:
• تتبع طلبات الصيانة في الوقت الفعلي
• إدارة الفنيين والموردين
• جدولة المواعيد والزيارات
• إنشاء الفواتير والعقود
• تقارير وإحصائيات شاملة
• خرائط تفاعلية للمواقع
• نظام إشعارات متقدم
```

### 10.3 المتطلبات الإلزامية

| المتطلب | المواصفات |
|---------|-----------|
| App Icon | 512×512 PNG، بدون شفافية |
| Feature Graphic | 1024×500 PNG/JPG |
| Phone Screenshots | 2-8 صور، min 320px، max 3840px |
| Privacy Policy URL | رابط سياسة الخصوصية |
| Content Rating | إكمال الاستبيان |

### 10.4 رفع AAB والنشر

1. اذهب إلى **Production → Create new release**
2. اضغط **Upload** وارفع ملف `app-release.aab`
3. أضف **Release notes** بالعربية:
   ```
   الإصدار الأول من تطبيق UberFix
   - إدارة طلبات الصيانة
   - تتبع الفنيين على الخريطة
   - نظام فواتير متكامل
   ```
4. اضغط **Save** → **Review release** → **Start rollout to Production**
5. انتظر مراجعة Google (1-7 أيام)

---

## 11. التحديثات المستقبلية

### سكربت تحديث سريع

```bash
#!/bin/bash
# update-android.sh

echo "🔄 تحديث تطبيق UberFix Android..."

# 1. سحب أحدث كود
git pull origin main

# 2. تثبيت تبعيات جديدة
npm install

# 3. بناء الويب
NODE_ENV=production npm run build

# 4. مزامنة Capacitor
npx cap sync android

# 5. بناء AAB
cd android
./gradlew bundleRelease

echo "✅ تم! ارفع الملف التالي على Google Play:"
echo "   android/app/build/outputs/bundle/release/app-release.aab"
```

### زيادة رقم الإصدار

قبل كل تحديث، عدّل `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        versionCode 2      // زد بـ 1 لكل تحديث
        versionName "1.1"  // رقم الإصدار المرئي
    }
}
```

---

## 12. استكشاف الأخطاء

### ❌ `SDK location not found`
```bash
# إنشاء ملف local.properties
echo "sdk.dir=$HOME/android-sdk" > android/local.properties
```

### ❌ `License for package not accepted`
```bash
yes | sdkmanager --licenses
```

### ❌ `Could not determine java version`
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### ❌ `Keystore was tampered with, or password was incorrect`
```bash
# تحقق من كلمة المرور في key.properties
cat android/key.properties
# تحقق من المفتاح
keytool -list -keystore android/app/uberfix-release-key.jks
```

### ❌ `Execution failed for task ':app:minifyReleaseWithR8'`
```bash
# تعطيل minify مؤقتاً في build.gradle
# minifyEnabled false
# shrinkResources false
```

### ❌ شاشة بيضاء على الهاتف
- تأكد أن `NODE_ENV=production` عند البناء
- تأكد من تنفيذ `npx cap sync android` بعد `npm run build`
- تحقق من logcat: `adb logcat | grep -i "capacitor\|webview"`

### ❌ التطبيق لا يتصل بـ Supabase
- تأكد من أن URL و Key في `.env` أو مضمّنة في الكود
- تحقق من إعدادات الشبكة وSSL

---

## 📌 ملخص الأوامر السريعة

```bash
# === البناء الكامل من الصفر ===
git clone <repo> && cd uberfix
npm install
npx cap add android
NODE_ENV=production npm run build
npx cap sync android
cd android && ./gradlew bundleRelease

# === تحديث سريع ===
git pull && npm install
NODE_ENV=production npm run build
npx cap sync android
cd android && ./gradlew bundleRelease

# === اختبار محلي ===
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

> 📚 **مراجع إضافية:**
> - [Capacitor Docs](https://capacitorjs.com/docs)
> - [Google Play Console Help](https://support.google.com/googleplay/android-developer)
> - [Lovable Mobile Development](https://docs.lovable.dev/tips-tricks/mobile-development)
> - [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)
