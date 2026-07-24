"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, Info, Undo2, X } from "lucide-react";
import clsx from "clsx";
import { useMounted } from "./hooks";

/**
 * Avisos efêmeros.
 *
 * Toda escrita no painel devolve um toast — sem ele o operador não
 * sabe se a ação valeu. Quando a ação é reversível, o toast carrega
 * o "Desfazer": é mais rápido que um diálogo de confirmação antes.
 */

export type ToastTone = "success" | "error" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastItem extends Required<Pick<ToastOptions, "title" | "tone">> {
  id: number;
  description?: string;
  duration: number;
  action?: ToastOptions["action"];
}

interface ToastApi {
  toast: (options: ToastOptions) => void;
  success: (title: string, options?: Omit<ToastOptions, "title" | "tone">) => void;
  error: (title: string, options?: Omit<ToastOptions, "title" | "tone">) => void;
  info: (title: string, options?: Omit<ToastOptions, "title" | "tone">) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const icons = { success: Check, error: AlertTriangle, info: Info };

const tones: Record<ToastTone, string> = {
  success: "bg-adm-ok-bg text-adm-ok",
  error: "bg-adm-bad-bg text-adm-bad",
  info: "bg-adm-info-bg text-adm-info",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);
  const mounted = useMounted();

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((options: ToastOptions) => {
    counter.current += 1;
    const item: ToastItem = {
      id: counter.current,
      title: options.title,
      description: options.description,
      tone: options.tone ?? "success",
      duration: options.duration ?? (options.action ? 7000 : 4000),
      action: options.action,
    };
    // No máximo três avisos na tela: o quarto empurra o mais antigo.
    setItems((current) => [...current.slice(-2), item]);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      toast,
      success: (title, options) => toast({ ...options, title, tone: "success" }),
      error: (title, options) => toast({ ...options, title, tone: "error" }),
      info: (title, options) => toast({ ...options, title, tone: "info" }),
    }),
    [toast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted &&
        createPortal(
          <div
            role="region"
            aria-label="Notificações"
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-4 sm:items-end"
          >
            {items.map((item) => (
              <ToastCard key={item.id} item={item} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  onDismiss,
}: {
  item: ToastItem;
  onDismiss: (id: number) => void;
}) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setTimeout(() => onDismiss(item.id), item.duration);
    return () => window.clearTimeout(timer);
  }, [item.id, item.duration, onDismiss, paused]);

  const Icon = icons[item.tone];

  return (
    <div
      role={item.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-adm-lg border border-adm-line bg-adm-surface p-3 shadow-adm-pop animate-adm-toast"
    >
      <span
        aria-hidden="true"
        className={clsx(
          "mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full",
          tones[item.tone],
        )}
      >
        <Icon size={13} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-adm-ink">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-micro leading-relaxed text-adm-ink-3">
            {item.description}
          </p>
        )}
        {item.action && (
          <button
            type="button"
            onClick={() => {
              item.action?.onClick();
              onDismiss(item.id);
            }}
            className="mt-1.5 inline-flex items-center gap-1 rounded-[3px] text-micro font-medium text-adm-accent hover:underline"
          >
            <Undo2 size={12} />
            {item.action.label}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => onDismiss(item.id)}
        aria-label="Dispensar aviso"
        className="-mr-0.5 -mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-adm text-adm-ink-3 transition-colors hover:bg-adm-sunken hover:text-adm-ink"
      >
        <X size={13} />
      </button>
    </div>
  );
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  return context;
}
