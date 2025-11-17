import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class FormErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Form error:', error, errorInfo);
    // Log error but don't force reload - let user continue
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          <p className="font-semibold">حدث خطأ في النموذج</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-sm underline"
          >
            المحاولة مرة أخرى
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
