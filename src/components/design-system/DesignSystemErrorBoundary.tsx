import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class DesignSystemErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[DESIGN_SYSTEM_RENDER_FAILED]', {
      message: error.message,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="dsPageDenied">
          <h1>We couldn’t load this page.</h1>
          <p>Please try again. If the problem continues, contact hello@caidenscourage.com.</p>
          <button type="button" onClick={() => this.setState({ error: null })}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
