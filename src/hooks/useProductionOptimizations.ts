// Hook لتطبيق تحسينات الإنتاج
import { useEffect } from 'react';
import { applySecuritySettings, applyPerformanceSettings } from '@/lib/productionConfig';

export const useProductionOptimizations = () => {
  useEffect(() => {
    // تطبيق إعدادات الأمان
    applySecuritySettings();
    
    // تطبيق تحسينات الأداء
    applyPerformanceSettings();
  }, []);
};