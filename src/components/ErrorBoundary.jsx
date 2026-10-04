import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 bg-rose-50 border border-rose-200 rounded-2xl text-slate-800">
          <div className="flex items-center gap-3 mb-2 text-rose-700 font-bold">
            <AlertTriangle size={22} />
            <span>Component Display Error</span>
          </div>
          <p className="text-xs text-slate-600 mb-4">
            {this.state.error?.message || "An unexpected rendering error occurred in this section."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold"
          >
            <RefreshCw size={13} />
            <span>Retry</span>
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
