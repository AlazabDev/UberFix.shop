// Hook لتطبيق تحسينات الإنتاج
import { useEffect } from 'react';
import { errorHandler } from '@/lib/errorHandler';
import { applySecuritySettings, applyPerformanceSettings } from '@/lib/productionConfig';

export const useProductionOptimizations = () => {
  useEffect(() => {
    // تطبيق إعدادات الأمان
    applySecuritySettings();
    
    // تطبيق تحسينات الأداء
    applyPerformanceSettings();

    // تسجيل معلومات الأداء - فقط في التطوير
    if (process.env.NODE_ENV === 'development') {
      if ('performance' in window && 'getEntriesByType' in performance) {
        const navigationEntries = performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navigation = navigationEntries[0] as PerformanceNavigationTiming;
          console.log('[Performance]', {
            loadTime: `${(navigation.loadEventEnd - navigation.loadEventStart).toFixed(2)}ms`,
            domContentLoaded: `${(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart).toFixed(2)}ms`,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
            firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
          });
        }
      }
    }

    // مراقبة استخدام الذاكرة - فقط الحالات الحرجة
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.95) {
        errorHandler.logError({
          level: 'error',
          message: 'Critical memory usage detected',
          metadata: {
            usedJSHeapSize: memory.usedJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            totalJSHeapSize: memory.totalJSHeapSize
          }
        });
      }
    }
  }, []);

  // مراقبة أخطاء الموارد الحرجة فقط (JavaScript)
  useEffect(() => {
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      // فقط أخطاء تحميل JavaScript الحرجة
      if (target && target.tagName === 'SCRIPT') {
        errorHandler.logError({
          level: 'error',
          message: `Failed to load critical script: ${(target as any).src}`,
          metadata: {
            type: 'resource_error',
            tagName: target.tagName,
            src: (target as any).src
          }
        });
      }
    };

    document.addEventListener('error', handleResourceError, true);

    return () => {
      document.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  return {
    getErrorQueueStatus: () => errorHandler.getQueueStatus(),
    clearErrorQueue: () => errorHandler.clearQueue()
  };
};