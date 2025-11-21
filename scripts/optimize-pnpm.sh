#!/bin/bash
# scripts/optimize-pnpm.sh
echo "⚡ تحسين أداء pnpm..."

# تنظيف المتجر
pnpm store prune

# تحديث pnpm
pnpm env use --global lts
pnpm set version latest

# إعادة البناء
pnpm rebuild

echo "✅ اكتمل التحسين"