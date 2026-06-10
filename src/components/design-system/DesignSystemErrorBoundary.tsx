import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export default class DesignSystemErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="dsPageDenied">
          <h1>Design System failed to render</h1>
          <p>{this.state.error.message}</p>
          <pre style={{ fontSize: '0.75rem', overflow: 'auto', textAlign: 'left' }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
