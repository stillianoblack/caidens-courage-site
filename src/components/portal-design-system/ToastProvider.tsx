import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import B4ToastNotification from './B4ToastNotification';
import type { B4ToastSource } from './B4ToastNotification';
import './portal-design-system.css';

export type ToastVariant = 'success' | 'info' | 'warning' | 'error';

export type ShowToastOptions = {
  variant?: ToastVariant;
  source?: B4ToastSource;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
  source: B4ToastSource;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  showToast: (message: string, variantOrOptions?: ToastVariant | ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_TOAST_DISMISS_MS = 3500;

function normalizeOptions(variantOrOptions?: ToastVariant | ShowToastOptions): ShowToastOptions {
  if (typeof variantOrOptions === 'string') {
    return { variant: variantOrOptions };
  }
  return variantOrOptions ?? {};
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variantOrOptions?: ToastVariant | ShowToastOptions) => {
      const options = normalizeOptions(variantOrOptions);
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const item: ToastItem = {
        id,
        message,
        variant: options.variant ?? 'info',
        source: options.source ?? 'b4',
        actionLabel: options.actionLabel,
        onAction: options.onAction,
      };

      setToasts((prev) => [...prev, item]);
      window.setTimeout(() => dismissToast(id), options.duration ?? DEFAULT_TOAST_DISMISS_MS);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="ds-toastViewport" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <B4ToastNotification
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            source={toast.source}
            actionLabel={toast.actionLabel}
            onAction={toast.onAction}
            onDismiss={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
