import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

/**
 * Catches lazy chunk loading errors (ChunkLoadError) and forces a one-time reload.
 * This protects against stale chunks after a deploy or dev rebuild without breaking the app.
 */
export class ChunkErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  componentDidCatch(error: unknown) {
    // Only handle webpack ChunkLoadError-style failures.
    const err = error as { name?: string; message?: string };
    const isChunkError =
      err?.name === 'ChunkLoadError' ||
      (typeof err?.message === 'string' && err.message.includes('Loading chunk'));

    if (isChunkError) {
      // Avoid infinite reload loops by only retrying once per session.
      const key = '__chunk_reload_attempted__';
      const storage = window.sessionStorage;
      const alreadyRetried = storage.getItem(key) === '1';

      if (!alreadyRetried) {
        storage.setItem(key, '1');
        window.location.reload();
        return;
      }
    }

    this.setState({ hasError: true });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center', color: '#fff', background: '#1f2933' }}>
          <p>Something went wrong loading this page.</p>
          <p style={{ marginTop: 8, fontSize: 12, opacity: 0.8 }}>
            Please refresh the page. If the problem persists, a new deploy may be in progress.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

