// نظام معالجة الأخطاء البسيط
import { supabase } from '@/integrations/supabase/client';

interface ErrorLog {
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

class ErrorHandler {
  private errorQueue: ErrorLog[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async logError(error: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      level: error.level || 'error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: error.url || window.location.href,
      userAgent: navigator.userAgent,
      metadata: error.metadata,
    };

    // محاولة جلب userId
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        errorLog.userId = data.user.id;
      }
    } catch (e) {
      // تجاهل الخطأ
    }

    // فقط تسجيل الأخطاء الحقيقية في console في development
    if (import.meta.env.DEV && errorLog.level === 'error') {
      console.error('Error:', errorLog.message);
    }

    // فقط إضافة الأخطاء الحقيقية للـ queue
    if (errorLog.level === 'error') {
      this.errorQueue.push(errorLog);
      await this.flushErrorQueue();
    }
  }

  private async flushErrorQueue() {
    if (!this.isOnline || this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) return;

      await supabase.functions.invoke('log-errors', {
        body: { errors }
      });
    } catch (error) {
      this.errorQueue.push(...errors);
    }
  }

  logCustomError(message: string, metadata?: Record<string, any>) {
    return this.logError({
      level: 'error',
      message,
      metadata,
    });
  }

  logWarning(message: string, metadata?: Record<string, any>) {
    return this.logError({
      level: 'warning',
      message,
      metadata,
    });
  }

  logInfo(message: string, metadata?: Record<string, any>) {
    return this.logError({
      level: 'info',
      message,
      metadata,
    });
  }

  clearQueue() {
    this.errorQueue = [];
  }

  getQueueStatus() {
    return {
      queueLength: this.errorQueue.length,
      isOnline: this.isOnline,
    };
  }
}

export const errorHandler = new ErrorHandler();

export const logError = (message: string, metadata?: Record<string, any>) =>
  errorHandler.logCustomError(message, metadata);

export const logWarning = (message: string, metadata?: Record<string, any>) =>
  errorHandler.logWarning(message, metadata);

export const logInfo = (message: string, metadata?: Record<string, any>) =>
  errorHandler.logInfo(message, metadata);

export const handleReactError = (error: Error, errorInfo: { componentStack: string }) => {
  errorHandler.logError({
    level: 'error',
    message: error.message,
    stack: error.stack,
    metadata: {
      componentStack: errorInfo.componentStack,
      errorType: 'React Error Boundary',
    },
  });
};
