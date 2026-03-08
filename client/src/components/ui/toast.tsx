import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/stores/toast-store';

const variantStyles = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-amazon-river',
} as const;

const variantIcons = {
  success: <CheckCircle className="h-5 w-5" strokeWidth={2} />,
  error: <AlertCircle className="h-5 w-5" strokeWidth={2} />,
  info: <Info className="h-5 w-5" strokeWidth={2} />,
};

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      className="fixed inset-x-0 top-4 z-50 flex flex-col gap-2 px-4 sm:inset-x-auto sm:top-auto sm:bottom-4 sm:right-4 sm:w-fit sm:px-0"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white sm:w-auto ${variantStyles[toast.variant]}`}
          role="status"
        >
          {variantIcons[toast.variant]}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="ml-auto shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss notification"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
      ))}
    </div>,
    document.body,
  );
};
