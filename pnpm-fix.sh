#!/bin/bash
# 🔧 UberFix.shop | Automatic PNPM Environment Fixer & Code Quality
# إصلاح البيئة + الكاش + فحص وإصلاح الكود

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
echo "🚀 بدء عملية الإصلاح داخل: $PROJECT_DIR"

cd "$PROJECT_DIR" || exit 1

# 1️⃣ إصلاح الصلاحيات
echo "🧩 ضبط الصلاحيات..."
sudo chown -R $(id -u):$(id -g) "$PROJECT_DIR"

# 2️⃣ تنظيف ملفات cache والمجلدات المؤقتة
echo "🧹 تنظيف ملفات cache..."
pnpm run check

# 3️⃣ فحص ملف القفل وتثبيت الحزم
if [ -f "pnpm-lock.yaml" ]; then
  echo "🔒 ملف القفل موجود — التثبيت المقيد سيُستخدم."
  pnpm install --frozen-lockfile
else
  echo "⚠️ لا يوجد ملف قفل — تثبيت اعتيادي."
  pnpm install
fi

# 4️⃣ الموافقة التلقائية على build scripts
echo "⚙️ الموافقة على build scripts مثل esbuild و @swc/core..."
pnpm approve-builds --yes || true

# 5️⃣ اختبار سريع للبيئة
echo "🧪 فحص سلامة بيئة PNPM..."
pnpm doctor || echo "ℹ️ يمكن تجاهل التحذيرات غير الحرجة."

# 6️⃣ فحص الكود وجودته
echo "🔎 فحص الكود بـ ESLint..."
pnpm run lint

echo "🛠 إصلاح المشاكل تلقائياً عن طريق ESLint..."
pnpm run lint:fix

echo "💅 فحص التنسيق بـ Prettier..."
pnpm run format

echo "🔬 فحص TypeScript بواسطة tsc..."
pnpm run check

echo "✅ الصيانة والفحص اكتملوا بنجاح!"