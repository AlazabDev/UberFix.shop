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
    // Force full page reload on error
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }

  public render() {
    // Just pass through children - errors will trigger reload
    return this.props.children;
  }
}
