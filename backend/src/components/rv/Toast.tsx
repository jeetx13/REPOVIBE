import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, X, AlertTriangle } from 'lucide-react';

type ToastKind = 'success' | 'info' | 'error';
interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  body?: string;
}

interface ToastCtx {
  toast: (t: Omit<Toast, 'id'>) => void;
}

const Ctx = createContext<ToastCtx | null>(null);

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useToast must be used inside <ToastProvider>');
  return c.toast;
}

const icons: Record<ToastKind, typeof CheckCircle2> = {
  success: CheckCircle2,
  info: Info,
  error: AlertTriangle,
};
const accents: Record<ToastKind, string> = {
  success: 'border-forest-300 text-forest-600',
  info: 'border-amber-300 text-amber-500',
  error: 'border-coral-500 text-coral-500',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (t: Omit<Toast, 'id'>) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-[360px]">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icons[t.kind];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`glass shadow-lift rounded-2xl border-l-4 ${accents[t.kind]} pl-4 pr-3 py-3 flex items-start gap-3`}
              >
                <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-charcoal-800">{t.title}</p>
                  {t.body && <p className="text-xs text-charcoal-700/70 mt-0.5">{t.body}</p>}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="text-charcoal-700/50 hover:text-charcoal-800 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
