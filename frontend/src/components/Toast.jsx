/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const tone = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800',
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 md:right-6 md:top-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = icons[toast.type] || Info;
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 24, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.98 }}
                className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg shadow-slate-900/10 ${tone[toast.type] || tone.info}`}
              >
                <Icon size={20} className="mt-0.5 shrink-0" />
                <p className="flex-1 text-sm font-semibold leading-5">{toast.message}</p>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-white/70"
                  aria-label="Dismiss notification"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }
  return context;
};
