// ErrorBoundary — catches unhandled React errors gracefully
import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center py-5">
          <div className="py-5">
            <div className="mb-4">
              <span style={{ fontSize: '4rem' }}>⚠️</span>
            </div>
            <h2 className="fw-bold mb-3">Something Went Wrong</h2>
            <p className="text-muted mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              className="btn btn-primary px-4"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
