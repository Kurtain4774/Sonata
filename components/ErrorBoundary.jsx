"use client";

import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught", error, info?.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }
      if (this.props.compact) {
        return (
          <div className="rounded-2xl border border-rose-900/40 bg-rose-950/20 p-5 text-sm">
            <div className="text-rose-300 font-medium mb-1">
              {this.props.label ? `${this.props.label} failed to load` : "This section failed to load"}
            </div>
            <div className="text-neutral-400 mb-3">
              {this.state.error?.message || "Unexpected error."}
            </div>
            <button
              onClick={this.reset}
              className="px-3 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-700/40 text-rose-200 text-xs font-medium"
            >
              Try again
            </button>
          </div>
        );
      }
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-3">
            <h2 className="text-xl font-semibold text-white">Something broke here.</h2>
            <p className="text-sm text-neutral-400">
              {this.state.error?.message || "Unexpected error in this view."}
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={this.reset}
                className="px-4 py-2 rounded-full bg-spotify text-black text-sm font-semibold hover:brightness-110"
              >
                Try again
              </button>
              <a
                href="/dashboard"
                className="px-4 py-2 rounded-full border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-sm"
              >
                Back to dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
