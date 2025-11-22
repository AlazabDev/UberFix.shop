#!/bin/bash
# scripts/security-audit.sh
echo "🔒 إجراء فحص أمني للمشروع..."

# فحص الثغرات
npm run audit --audit-level high

# فحص المكتبات المعرضة للخطر
npm run dlx npm-audit-resolver

# فحص التبعيات
npm run dlX depcheck

echo "✅ اكتمل الفحص الأمني"
