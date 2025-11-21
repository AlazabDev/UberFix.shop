#!/bin/bash
# scripts/project-audit.sh

echo "🔍 بدء فحص المشروع الشامل..."
echo "=========================================="

# 1. فحص النظام
echo "1. 📋 فحص النظام:"
echo "   Node.js: $(node --version)"
echo "   pnpm: $(pnpm --version)"
echo "   OS: $(uname -s)"

# 2. فحص الملفات الأساسية
echo ""
echo "2. 📁 فحص الملفات الأساسية:"
essential_files=("package.json" "vite.config.ts" "tsconfig.json" "src/main.tsx" "src/App.tsx")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - مفقود!"
    fi
done

# 3. فحص التبعيات
echo ""
echo "3. 📦 فحص التبعيات:"
if [ -f "package.json" ]; then
    echo "   ✅ package.json موجود"
    echo "   عدد التبعيات: $(jq '.dependencies | length' package.json) runtime, $(jq '.devDependencies | length' package.json) dev"
else
    echo "   ❌ package.json مفقود"
fi

# 4. فحص TypeScript
echo ""
echo "4. 🔧 فحص TypeScript:"
if npx tsc --noEmit --project tsconfig.app.json > /dev/null 2>&1; then
    echo "   ✅ TypeScript compilation successful"
else
    echo "   ❌ TypeScript compilation failed"
    npx tsc --noEmit --project tsconfig.app.json
fi

# 5. فحص هيكل src
echo ""
echo "5. 🗂️ فحص هيكل src/:"
if [ -d "src" ]; then
    echo "   هيكل مجلد src:"
    find src -type f -name "*.ts" -o -name "*.tsx" | head -10 | sed 's/^/     /'
    echo "   إجمالي ملفات: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)"
else
    echo "   ❌ مجلد src مفقود!"
fi

# 6. فحص الإعدادات
echo ""
echo "6. ⚙️ فحص الإعدادات:"
config_files=("vite.config.ts" "tsconfig.json" "eslint.config.js" "tailwind.config.js" "postcss.config.js")
for config in "${config_files[@]}"; do
    if [ -f "$config" ]; then
        echo "   ✅ $config"
    else
        echo "   ⚠️  $config - غير موجود (قد يكون طبيعي)"
    fi
done

echo ""
echo "=========================================="
echo "✅ اكتمل الفحص الشامل"