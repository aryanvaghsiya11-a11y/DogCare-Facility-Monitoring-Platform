"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  fallback?: ReactNode;
  scope: string;
  children: ReactNode;
}
interface State {
  error: Error | null;
}

// Note: full Sentry boundary lives in SentryProvider. This one is a safety net
// around individual widgets so one broken chunk doesn't take down the whole view.
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(`[${this.props.scope}] boundary caught`, error, info);
  }

  reset = () => this.setState({ error: null });

  override render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div role="alert" className="rounded-md border border-severity-critical/40 bg-severity-critical/5 p-md">
            <h2 className="font-semibold">{this.props.scope} failed to load</h2>
            <p className="text-sm text-slate-600">Try refreshing the page.</p>
            <button onClick={this.reset} className="mt-sm text-sm underline">
              Retry
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
