import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md mx-auto mt-20 rounded-xl border bg-slate-800/50 p-8 text-center backdrop-blur">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">
              Something went wrong
            </h2>

            <p className="text-gray-300 mb-6">
              An unexpected error occurred. Please reload the page and try
              again.
            </p>

            <button
              onClick={this.handleReload}
              className="inline-flex items-center px-6 py-3 mb-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload
            </button>

            {import.meta.env.DEV && this.state.error && (
              <div className="mt-6 text-left">
                <details className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <summary className="text-sm font-medium text-gray-300 cursor-pointer mb-2">
                    Error Details (Development)
                  </summary>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-gray-400 mb-1">
                        Error Message:
                      </h4>
                      <pre className="text-xs text-red-400 bg-gray-800 p-2 rounded overflow-auto max-h-32">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Stack Trace:
                        </h4>
                        <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-auto max-h-48">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    )}
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-400 mb-1">
                          Component Stack:
                        </h4>
                        <pre className="text-xs text-gray-300 bg-gray-800 p-2 rounded overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
