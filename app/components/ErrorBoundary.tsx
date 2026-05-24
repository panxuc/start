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
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="paper-card max-w-md px-8 py-10 text-center">
            <p className="text-[4rem] font-semibold leading-none text-ink">!</p>
            <h1 className="mt-5 text-2xl font-semibold text-near-black">出了点问题</h1>
            <p className="mt-3 text-sm leading-6 text-stone">
              {this.state.error?.message || "发生了未知错误"}
            </p>
            <button
              type="button"
              className="paper-button mt-7"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
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
