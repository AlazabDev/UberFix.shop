#!/bin/bash

# UberFix Architecture Analysis Runner
set -e

echo "🏗️  UberFix Architecture Analysis"
echo "=========================================="

# التفعيل التلقائي للبيئة الافتراضية
VENV_PATH="/opt/UberFix/uberfix_venv"
if [ -d "$VENV_PATH" ]; then
    echo "🐍 تفعيل البيئة الافتراضية..."
    source "$VENV_PATH/bin/activate"
fi

# الانتقال لمجلد المشروع
cd /opt/UberFix

# تشغيل المحلل المعماري
echo "🚀 بدء التحليل المعماري الشامل..."
python3 scripts/architecture_analyzer.py

# البحث عن أحدث التقارير
LATEST_REPORT=$(find /opt/UberFix -name "architecture_report_*.txt" | sort -r | head -1)
LATEST_JSON=$(find /opt/UberFix -name "architecture_data_*.json" | sort -r | head -1)

if [ -f "$LATEST_REPORT" ]; then
    echo ""
    echo "📄 التقرير المُنشأ: $LATEST_REPORT"
    echo "📊 البيانات الخام: $LATEST_JSON"
    echo ""
    echo "📋 نظرة سريعة على التقرير:"
    echo "=========================="
    head -50 "$LATEST_REPORT"
fi

echo ""
echo "✅ تم الانتهاء من التحليل المعماري!"