#!/bin/bash
# scripts/security-audit.sh
echo "🔒 إجراء فحص أمني للمشروع..."

# فحص الثغرات
pnpm audit --audit-level high

# فحص المكتبات المعرضة للخطر
pnpm dlx npm-audit-resolver

# فحص التبعيات
pnpm dlX depcheck

echo "✅ اكتمل الفحص الأمني"