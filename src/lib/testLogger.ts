import { supabase } from '@/integrations/supabase/client';

export interface TestLog {
  test_name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
  timestamp: string;
  error_details?: unknown;
  stack_trace?: string;
  metadata?: Record<string, unknown>;
}

// Security: Check if running in production environment
const isProduction = import.meta.env.PROD;

/**
 * Sanitize log data to remove potentially sensitive information
 */
const sanitizeLogData = (log: TestLog): TestLog => {
  const sanitized = { ...log };
  
  // Remove stack traces in production
  if (isProduction && sanitized.stack_trace) {
    delete sanitized.stack_trace;
  }
  
  // Sanitize error details - remove sensitive patterns
  if (sanitized.error_details) {
    const detailsStr = JSON.stringify(sanitized.error_details);
    // Redact potential sensitive data patterns
    const redactedStr = detailsStr.replace(
      /(password|token|key|secret|auth|bearer|credential)['":\s]*[^'",}\]]+/gi,
      '$1: [REDACTED]'
    );
    try {
      sanitized.error_details = JSON.parse(redactedStr);
    } catch {
      sanitized.error_details = '[Data sanitized]';
    }
  }
  
  return sanitized;
};

class TestLogger {
  private logs: TestLog[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  log(log: Omit<TestLog, 'timestamp'>): void {
    const fullLog: TestLog = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    // Sanitize before storing
    const sanitizedLog = sanitizeLogData(fullLog);
    this.logs.push(sanitizedLog);
    
    // Only log to console in development
    if (!isProduction) {
      const color = log.status === 'success' ? 'green' : log.status === 'error' ? 'red' : 'orange';
      console.warn(
        `%c[TEST ${log.status.toUpperCase()}] ${log.test_name}`,
        `color: ${color}; font-weight: bold`,
        log.message,
        log.error_details || ''
      );
    }

    // Only save to localStorage in development
    if (!isProduction) {
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    // Security: Never persist logs in production
    if (isProduction) {
      return;
    }
    
    try {
      const testHistory = this.getTestHistory();
      testHistory.push({
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        logs: this.logs.map(sanitizeLogData),
      });

      // Keep only last 5 sessions (reduced from 10)
      const trimmedHistory = testHistory.slice(-5);
      localStorage.setItem('test_history', JSON.stringify(trimmedHistory));
    } catch (error) {
      // Silent fail in production
      if (!isProduction) {
        console.error('Failed to save test logs to localStorage:', error);
      }
    }
  }

  getTestHistory(): Array<{ sessionId: string; timestamp: string; logs: TestLog[] }> {
    // Security: Return empty in production
    if (isProduction) {
      return [];
    }
    
    try {
      const history = localStorage.getItem('test_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  }

  async saveToDatabase(): Promise<void> {
    // Security: Do not save test results in production browser storage
    if (isProduction) {
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const testResults = {
        session_id: this.sessionId,
        user_id: user?.id,
        total_tests: this.logs.length,
        passed: this.logs.filter(l => l.status === 'success').length,
        failed: this.logs.filter(l => l.status === 'error').length,
        warnings: this.logs.filter(l => l.status === 'warning').length,
        logs: this.logs.map(sanitizeLogData),
        created_at: new Date().toISOString(),
      };

      // Only save in development
      if (!isProduction) {
        sessionStorage.setItem(`test_session_${this.sessionId}`, JSON.stringify(testResults));
        console.warn('Test results saved (dev mode):', testResults);
      }
    } catch (error) {
      if (!isProduction) {
        console.error('Failed to save test results:', error);
      }
    }
  }

  getSummary() {
    const total = this.logs.length;
    const success = this.logs.filter(l => l.status === 'success').length;
    const error = this.logs.filter(l => l.status === 'error').length;
    const warning = this.logs.filter(l => l.status === 'warning').length;
    const avgDuration = total > 0 ? this.logs.reduce((sum, l) => sum + (l.duration || 0), 0) / total : 0;

    return {
      total,
      success,
      error,
      warning,
      successRate: total > 0 ? ((success / total) * 100).toFixed(2) : '0',
      avgDuration: avgDuration.toFixed(2),
      failedTests: this.logs.filter(l => l.status === 'error').map(l => l.test_name),
    };
  }

  exportLogs(): string {
    // Sanitize all logs before export
    return JSON.stringify({
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      summary: this.getSummary(),
      logs: this.logs.map(sanitizeLogData),
    }, null, 2);
  }

  clear(): void {
    this.logs = [];
    this.sessionId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Clear stored logs in development
    if (!isProduction) {
      try {
        localStorage.removeItem('test_history');
        // Clean up session storage test sessions
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith('test_session_')) {
            sessionStorage.removeItem(key);
          }
        });
      } catch {
        // Silent fail
      }
    }
  }

  getLogs(): TestLog[] {
    return this.logs.map(sanitizeLogData);
  }
}

export const testLogger = new TestLogger();
