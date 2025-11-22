#!/bin/bash

# UberFix Repair Runner
set -e

echo "🔧 UberFix Comprehensive Repair Script"
echo "=========================================="

# التفعيل التلقائي للبيئة الافتراضية
VENV_PATH="/opt/UberFix/uberfix_venv"
if [ -d "$VENV_PATH" ]; then
    echo "🐍 تفعيل البيئة الافتراضية..."
    source "$VENV_PATH/bin/activate"
fi

# الانتقال لمجلد المشروع
cd /opt/UberFix

# تشغيل سكريبت الإصلاح
echo "🚀 بدء عملية الإصلاح الشاملة..."
python3 scripts/uberfix_repair.py

# حفظ التقرير في مجلد reports/
REPORT_FILE=$(find /opt/UberFix/reports -name "repair_report_*.txt" 2>/dev/null | sort -r | head -1)
if [ -f "$REPORT_FILE" ]; then
    echo ""
    echo "📄 تم حفظ التقرير في: $REPORT_FILE"
    echo "📋 ملخص التقرير:"
    tail -20 "$REPORT_FILE"
else
    echo "⚠️  لم يتم العثور على تقرير في مجلد reports/"
fi

echo ""
echo "✅ تم الانتهاء من عملية الإصلاح!"
