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
    const message = typeof err?.message === 'string' ? err.message : '';
    const isChunkError =
      err?.name === 'ChunkLoadError' ||
      /Loading chunk [\d]+ failed/i.test(message) ||
      /Failed to fetch dynamically imported module/i.test(message) ||
      /Importing a module script failed/i.test(message) ||
      /error loading dynamically imported module/i.test(message);

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
            Return to the portal and try opening this page again.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
