# قائمة سكريبتات الاختبار الجديدة

## إضافة السكريبتات التالية إلى package.json:

```json
{
  "scripts": {
    "test:all": "bash scripts/test-all.sh",
    "test:technicians": "vitest run src/__tests__/technicians",
    "test:map": "vitest run src/__tests__/map",
    "test:e2e:technicians": "playwright test e2e/technicians.spec.ts",
    "test:production": "bash scripts/test-production.sh"
  }
}
```

## الاستخدام:

```bash
# تشغيل جميع الاختبارات
npm run test:all

# اختبارات موديول الفنيين فقط
npm run test:technicians

# اختبارات الخرائط فقط
npm run test:map

# اختبارات E2E للفنيين فقط
npm run test:e2e:technicians

# فحص جاهزية الإنتاج
npm run test:production
```
