"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-md-background p-24dp">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-16dp">⚠️</div>
            <h1 className="text-[1.375rem] font-normal text-md-on-surface mb-8dp">出了点问题</h1>
            <p className="text-[0.875rem] text-md-on-surface-variant mb-24dp">
              {this.state.error?.message || "发生了未知错误"}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="md3-state-layer rounded-md3-full bg-md-primary text-md-on-primary px-24dp py-10dp text-[0.875rem] font-medium"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
