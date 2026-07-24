"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";
import { Button, IconButton, type ButtonVariant } from "./Button";
import {
  useClickOutside,
  useEscape,
  useFocusTrap,
  useMounted,
  useScrollLock,
} from "./hooks";

/**
 * Camadas sobrepostas: Modal, Drawer e ConfirmDialog.
 *
 * Todas seguem o mesmo contrato de acessibilidade — role="dialog",
 * aria-modal, foco preso enquanto abertas, Esc fecha, clique fora
 * fecha, e o foco volta para onde estava ao sair.
 */

function Portal({ children }: { children: ReactNode }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(children, document.body);
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Impede fechar por clique fora — para formulários longos. */
  persistent?: boolean;
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-3xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  persistent = false,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEscape(open, onClose);
  useScrollLock(open);
  useFocusTrap(panelRef, open);
  useClickOutside(panelRef, open && !persistent, onClose);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-adm-nav/45 animate-fade-in"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={clsx(
            "relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-adm-lg bg-adm-surface shadow-adm-pop animate-adm-pop sm:rounded-adm-lg",
            modalSizes[size],
          )}
        >
          <header className="flex items-start justify-between gap-4 border-b border-adm-line px-5 py-3.5">
            <div className="min-w-0">
              <h2 className="text-[14px] font-medium text-adm-ink">{title}</h2>
              {description && (
                <p className="mt-0.5 text-micro leading-relaxed text-adm-ink-3">
                  {description}
                </p>
              )}
            </div>
            <IconButton
              icon={X}
              label="Fechar"
              size="sm"
              onClick={onClose}
              className="-mr-1.5 -mt-0.5"
            />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {footer && (
            <footer className="flex items-center justify-end gap-2 border-t border-adm-line bg-adm-raised px-5 py-3">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </Portal>
  );
}

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: string;
}

/** Painel lateral — para contexto que acompanha a tela de trás. */
export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "26rem",
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEscape(open, onClose);
  useScrollLock(open);
  useFocusTrap(panelRef, open);
  useClickOutside(panelRef, open, onClose);

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[60]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-adm-nav/45 animate-fade-in"
        />
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          style={{ maxWidth: width }}
          className="absolute inset-y-0 right-0 flex w-full flex-col bg-adm-surface shadow-adm-pop animate-adm-drawer"
        >
          <header className="flex items-start justify-between gap-4 border-b border-adm-line px-5 py-3.5">
            <div className="min-w-0">
              <h2 className="text-[14px] font-medium text-adm-ink">{title}</h2>
              {description && (
                <p className="mt-0.5 text-micro text-adm-ink-3">{description}</p>
              )}
            </div>
            <IconButton
              icon={X}
              label="Fechar"
              size="sm"
              onClick={onClose}
              className="-mr-1.5 -mt-0.5"
            />
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {footer && (
            <footer className="flex items-center justify-end gap-2 border-t border-adm-line bg-adm-raised px-5 py-3">
              {footer}
            </footer>
          )}
        </div>
      </div>
    </Portal>
  );
}

/* ————————————————————— Confirmação ————————————————————— */

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ButtonVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Confirmação como promessa: `if (await confirm({…})) …`.
 * Evita que cada tela reinvente estado de diálogo — e garante que
 * toda ação destrutiva peça confirmação do mesmo jeito.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((next) => {
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={Boolean(options)}
        onClose={() => settle(false)}
        title={options?.title ?? ""}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => settle(false)}>
              {options?.cancelLabel ?? "Cancelar"}
            </Button>
            <Button
              variant={options?.variant ?? "danger"}
              onClick={() => settle(true)}
            >
              {options?.confirmLabel ?? "Confirmar"}
            </Button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-adm-ink-2">
          {options?.description ??
            "Esta ação não pode ser desfeita. Deseja continuar?"}
        </p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext);
  if (!context)
    throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>.");
  return context;
}
