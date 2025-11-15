// نظام التحليلات والمراقبة للإنتاج
import { supabase } from '@/integrations/supabase/client';
import { errorHandler } from './errorHandler';

interface AnalyticsEvent {
  event_type: string;
  event_data: Record<string, any>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  page_url: string;
  user_agent: string;
}

class Analytics {
  private sessionId: string;
  private userId?: string;
  private eventQueue: AnalyticsEvent[] = [];
  private isOnline = navigator.onLine;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.setupEventListeners();
    this.startAutoFlush();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    // مراقبة حالة الشبكة
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushEvents();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // تتبع تغييرات الصفحة
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // تتبع النقرات على الروابط
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.closest('a');
        if (link) {
          this.trackEvent('link_click', {
            href: link.href,
            text: link.textContent?.trim(),
            external: !link.href.startsWith(window.location.origin)
          });
        }
      }
    });

    // تتبع إرسال النماذج
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      if (form.tagName === 'FORM') {
        this.trackEvent('form_submit', {
          form_id: form.id,
          form_action: form.action,
          form_method: form.method
        });
      }
    });

    // تتبع الأخطاء
    window.addEventListener('error', (event) => {
      this.trackEvent('javascript_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno
      });
    });
  }

  private startAutoFlush() {
    // إرسال الأحداث كل دقيقتين
    this.flushInterval = setInterval(() => {
      this.flushEvents();
    }, 2 * 60 * 1000);
  }

  async setUserId(userId: string) {
    this.userId = userId;
    this.trackEvent('user_identified', { user_id: userId });
  }

  trackEvent(eventType: string, eventData: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      event_type: eventType,
      event_data: eventData,
      user_id: this.userId,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      page_url: window.location.href,
      user_agent: navigator.userAgent
    };

    this.eventQueue.push(event);

    // إرسال فوري للأحداث المهمة
    const criticalEvents = ['error', 'payment', 'signup', 'login'];
    if (criticalEvents.some(critical => eventType.includes(critical))) {
      this.flushEvents();
    }

    // الحفاظ على حجم الطابور
    if (this.eventQueue.length > 100) {
      this.eventQueue.shift();
    }
  }

  trackPageView(path?: string) {
    this.trackEvent('page_view', {
      path: path || window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
  }

  trackUserAction(action: string, details: Record<string, any> = {}) {
    this.trackEvent('user_action', {
      action,
      ...details
    });
  }

  trackPerformance(metrics: Record<string, number>) {
    this.trackEvent('performance_metrics', metrics);
  }

  trackBusinessEvent(eventType: string, data: Record<string, any>) {
    this.trackEvent(`business_${eventType}`, data);
  }

  private async flushEvents() {
    if (this.eventQueue.length === 0 || !this.isOnline) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // إرسال للـ Edge Function المخصص للتحليلات
      const { error } = await supabase.functions.invoke('analytics', {
        body: { events: eventsToSend }
      });

      if (error) {
        // إعادة الأحداث للطابور في حالة الفشل
        this.eventQueue.unshift(...eventsToSend);
        throw error;
      }
    } catch (error) {
      // إعادة الأحداث للطابور في حالة الفشل
      this.eventQueue.unshift(...eventsToSend);
      errorHandler.logError({
        level: 'warning',
        message: 'Failed to send analytics events',
        url: window.location.href,
        metadata: { 
          error: error instanceof Error ? error.message : 'Unknown error',
          eventCount: eventsToSend.length
        }
      });
    }
  }

  // إحصائيات الجلسة
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      queueLength: this.eventQueue.length,
      isOnline: this.isOnline,
      sessionStart: this.sessionId.split('_')[1]
    };
  }

  // مسح الطابور
  clearQueue() {
    this.eventQueue = [];
  }

  // إنهاء الجلسة
  endSession() {
    this.trackEvent('session_end', {
      duration: Date.now() - parseInt(this.sessionId.split('_')[1])
    });
    
    this.flushEvents();
    
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
  }
}

// إنشاء instance وحيد
export const analytics = new Analytics();

// دوال مساعدة
export const trackPageView = (path?: string) => analytics.trackPageView(path);
export const trackUserAction = (action: string, details?: Record<string, any>) => 
  analytics.trackUserAction(action, details);
export const trackPerformance = (metrics: Record<string, number>) => 
  analytics.trackPerformance(metrics);
export const trackBusinessEvent = (eventType: string, data: Record<string, any>) => 
  analytics.trackBusinessEvent(eventType, data);

// Hook للاستخدام في React
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackBusinessEvent: analytics.trackBusinessEvent.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    getSessionStats: analytics.getSessionStats.bind(analytics)
  };
};