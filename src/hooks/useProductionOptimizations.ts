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

    // تسجيل بداية الجلسة
    errorHandler.logInfo('Application started', {
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });

    // تسجيل معلومات الأداء
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navigationEntries = performance.getEntriesByType('navigation');
      if (navigationEntries.length > 0) {
        const navigation = navigationEntries[0] as PerformanceNavigationTiming;
        errorHandler.logInfo('Performance metrics', {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
        });
      }
    }

    // مراقبة استخدام الذاكرة (إذا كان متاحاً)
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
        errorHandler.logWarning('High memory usage detected', {
          usedJSHeapSize: memory.usedJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          totalJSHeapSize: memory.totalJSHeapSize
        });
      }
    }

    // مراقبة حالة الشبكة
    const handleOnline = () => {
      errorHandler.logInfo('Network status changed to online');
    };

    const handleOffline = () => {
      errorHandler.logWarning('Network status changed to offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // تنظيف المستمعين
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // مراقبة التغييرات في حالة الرؤية - معطلة لتقليل الضوضاء في السجلات
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       errorHandler.logInfo('Application hidden/minimized');
  //     } else {
  //       errorHandler.logInfo('Application visible/restored');
  //     }
  //   };

  //   document.addEventListener('visibilitychange', handleVisibilityChange);

  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);

  // مراقبة أخطاء الموارد
  useEffect(() => {
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        errorHandler.logError({
          level: 'error',
          message: `Failed to load resource: ${target.tagName}`,
          url: window.location.href,
          metadata: {
            type: 'resource',
            tagName: target.tagName,
            src: (target as any).src || (target as any).href,
            resourceType: target.tagName.toLowerCase()
          }
        });
      }
    };

    // مراقبة أخطاء تحميل الصور والموارد الأخرى
    document.addEventListener('error', handleResourceError, true);

    return () => {
      document.removeEventListener('error', handleResourceError, true);
    };
  }, []);

  return {
    getErrorQueueStatus: () => errorHandler.getQueueStatus(),
    clearErrorQueue: () => errorHandler.clearQueue(),
    logCustomError: (message: string, metadata?: Record<string, any>) => 
      errorHandler.logCustomError(message, metadata),
    logWarning: (message: string, metadata?: Record<string, any>) => 
      errorHandler.logWarning(message, metadata),
    logInfo: (message: string, metadata?: Record<string, any>) => 
      errorHandler.logInfo(message, metadata)
  };
};