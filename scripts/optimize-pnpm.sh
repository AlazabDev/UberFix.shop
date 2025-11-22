#!/bin/bash
# scripts/optimize-pnpm.sh
echo "⚡ تحسين أداء pnpm..."

# تنظيف المتجر
npm run store prune

# تحديث pnpm
npm run env use --global lts
npm run set version latest

# إعادة البناء
npm run rebuild

echo "✅ اكتمل التحسين"
