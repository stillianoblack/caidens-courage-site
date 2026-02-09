import React from "react";

const LazyWidget = React.lazy(() => import("./B4ChatWidget"));

function onIdle(cb: () => void) {
  // @ts-ignore
  if (typeof window !== "undefined" && window.requestIdleCallback) {
    // @ts-ignore
    window.requestIdleCallback(cb, { timeout: 2000 });
  } else {
    setTimeout(cb, 1200);
  }
}

export default function B4ChatGate() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    onIdle(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <React.Suspense fallback={null}>
      <LazyWidget />
    </React.Suspense>
  );
}
