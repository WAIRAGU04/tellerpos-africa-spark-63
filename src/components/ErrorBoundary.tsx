
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-tellerpos-bg to-tellerpos-dark-accent p-4">
          <div className="bg-white dark:bg-tellerpos-dark-accent rounded-lg shadow-xl p-8 max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We apologize for the inconvenience. Please try refreshing the page or navigate back to the homepage.
            </p>
            <div className="flex justify-between">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Refresh Page
              </button>
              <Link 
                to="/" 
                className="px-4 py-2 bg-tellerpos text-white rounded hover:bg-tellerpos/90 transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
