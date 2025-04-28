import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full min-h-screen flex flex-col items-center justify-center text-gray-800">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-red-600">{this.state.error?.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;