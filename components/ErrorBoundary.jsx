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
