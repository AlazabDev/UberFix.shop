/**
 * Monitoring and Analytics Library
 * Tracks errors, performance, and user analytics
 */

import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  tags?: Record<string, string>;
}

class MonitoringService {
  private errorBuffer: any[] = [];
  private metricsBuffer: PerformanceMetric[] = [];
  private flushInterval = 5000; // 5 seconds
  private maxBufferSize = 50;

  constructor() {
    this.startAutoFlush();
    this.setupPerformanceObserver();
    this.setupErrorHandler();
  }

  /**
   * Track application error
   */
  trackError(error: Error, context?: ErrorContext): void {
    const errorData = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      user_agent: navigator.userAgent,
      level: 'error' as const,
      metadata: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    };

    this.errorBuffer.push(errorData);

    // Flush immediately for critical errors
    if (this.errorBuffer.length >= 10) {
      this.flushErrors();
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Tracked Error:', error, context);
    }
  }

  /**
   * Track performance metric
   */
  trackMetric(metric: PerformanceMetric): void {
    this.metricsBuffer.push({
      ...metric,
      tags: {
        ...metric.tags,
        timestamp: new Date().toISOString(),
      },
    });

    if (this.metricsBuffer.length >= this.maxBufferSize) {
      this.flushMetrics();
    }
  }

  /**
   * Track page view
   */
  trackPageView(path: string, metadata?: Record<string, any>): void {
    const pageViewData = {
      path,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // Send to analytics endpoint
    if (import.meta.env.PROD) {
      this.sendAnalytics('pageview', pageViewData);
    }
  }

  /**
   * Track user action/event
   */
  trackEvent(
    category: string,
    action: string,
    label?: string,
    value?: number
  ): void {
    const eventData = {
      category,
      action,
      label,
      value,
      timestamp: new Date().toISOString(),
    };

    if (import.meta.env.PROD) {
      this.sendAnalytics('event', eventData);
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      this.trackMetric({
        name,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'success' },
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      this.trackMetric({
        name,
        value: duration,
        unit: 'ms',
        tags: { ...tags, status: 'error' },
      });
      
      throw error;
    }
  }

  /**
   * Flush errors to backend
   */
  private async flushErrors(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errors = [...this.errorBuffer];
    this.errorBuffer = [];

    try {
      const { error } = await supabase.functions.invoke('error-tracking', {
        body: errors,
      });

      if (error) {
        console.error('Failed to send errors:', error);
        // Put errors back in buffer
        this.errorBuffer.push(...errors);
      }
    } catch (error) {
      console.error('Error flushing errors:', error);
      this.errorBuffer.push(...errors);
    }
  }

  /**
   * Flush metrics to backend
   */
  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = [...this.metricsBuffer];
    this.metricsBuffer = [];

    // Store metrics in local analytics
    if (import.meta.env.PROD) {
      this.sendAnalytics('metrics', metrics);
    }
  }

  /**
   * Send analytics data
   */
  private async sendAnalytics(type: string, data: any): Promise<void> {
    try {
      // You can integrate with any analytics service here
      // For now, we'll use Supabase for storage
      console.log('Analytics:', type, data);
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }

  /**
   * Setup automatic flush
   */
  private startAutoFlush(): void {
    setInterval(() => {
      this.flushErrors();
      this.flushMetrics();
    }, this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushErrors();
      this.flushMetrics();
    });
  }

  /**
   * Setup performance observer
   */
  private setupPerformanceObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    // Observe navigation timing
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          this.trackMetric({
            name: 'page_load_time',
            value: navEntry.loadEventEnd - navEntry.fetchStart,
            unit: 'ms',
          });
        }
      }
    });

    navObserver.observe({ entryTypes: ['navigation'] });

    // Observe resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.trackMetric({
            name: 'resource_load_time',
            value: resourceEntry.duration,
            unit: 'ms',
            tags: {
              resource: resourceEntry.name,
              type: resourceEntry.initiatorType,
            },
          });
        }
      }
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    // Observe long tasks
    if ('PerformanceLongTaskTiming' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackMetric({
            name: 'long_task',
            value: entry.duration,
            unit: 'ms',
          });
        }
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // longtask may not be supported
      }
    }
  }

  /**
   * Setup global error handler
   */
  private setupErrorHandler(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        type: 'unhandled_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason)),
        {
          type: 'unhandled_rejection',
        }
      );
    });
  }

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals(): void {
    // LCP - Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      this.trackMetric({
        name: 'lcp',
        value: lastEntry.renderTime || lastEntry.loadTime,
        unit: 'ms',
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const fidEntry = entry as any;
        this.trackMetric({
          name: 'fid',
          value: fidEntry.processingStart - fidEntry.startTime,
          unit: 'ms',
        });
      }
    }).observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as any;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      this.trackMetric({
        name: 'cls',
        value: clsValue,
        unit: 'count',
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Export helper functions
export const trackError = (error: Error, context?: ErrorContext) =>
  monitoring.trackError(error, context);

export const trackMetric = (metric: PerformanceMetric) =>
  monitoring.trackMetric(metric);

export const trackPageView = (path: string, metadata?: Record<string, any>) =>
  monitoring.trackPageView(path, metadata);

export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => monitoring.trackEvent(category, action, label, value);

export const measureAsync = <T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
) => monitoring.measureAsync(name, fn, tags);
