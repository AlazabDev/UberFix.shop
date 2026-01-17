import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('App Error Boundary caught error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            padding: '16px',
            direction: 'rtl',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div 
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 16px',
                backgroundColor: '#fee2e2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}
            >
              ⚠️
            </div>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              marginBottom: '8px'
            }}>
              حدث خطأ غير متوقع
            </h1>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              نأسف، حدث خطأ أثناء تحميل التطبيق. يرجى إعادة تحميل الصفحة.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              إعادة تحميل الصفحة
            </button>
            {this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#9ca3af', fontSize: '12px' }}>
                  تفاصيل الخطأ
                </summary>
                <pre style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#f3f4f6', 
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '8px',
                  color: '#dc2626'
                }}>
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
