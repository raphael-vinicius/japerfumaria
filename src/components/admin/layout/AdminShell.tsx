"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Modal } from "../ui/Overlay";
import { OfflineBanner } from "../ui/States";
import { useEscape, useHotkey } from "../ui/hooks";
import { CommandPalette } from "./CommandPalette";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

/**
 * Casco do painel: sidebar fixa + topo fixo + área de trabalho.
 *
 * Só o conteúdo rola — sidebar e topo ficam sempre no lugar, o que
 * mantém navegação e busca a um clique em qualquer ponto de uma
 * tabela longa. No celular a sidebar vira gaveta.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [online, setOnline] = useState(true);

  // Fecha a gaveta ao trocar de tela (evita menu aberto sobre o conteúdo).
  useEffect(() => setDrawerOpen(false), [pathname]);

  useHotkey("mod+k", () => setPaletteOpen(true));
  useHotkey("shift+?", () => setShortcutsOpen(true));
  useEscape(drawerOpen, () => setDrawerOpen(false));

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return (
    <div className="min-h-screen bg-adm-canvas">
      {/* Sidebar — desktop */}
      <aside
        className={clsx(
          "adm-no-print fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 ease-luxe lg:block",
          collapsed ? "w-[4.25rem]" : "w-60",
        )}
      >
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((value) => !value)}
        />
      </aside>

      {/* Sidebar — gaveta no celular */}
      <div
        className={clsx(
          "adm-no-print fixed inset-0 z-50 lg:hidden",
          drawerOpen ? "visible" : "invisible pointer-events-none",
        )}
      >
        <div
          aria-hidden="true"
          onClick={() => setDrawerOpen(false)}
          className={clsx(
            "absolute inset-0 bg-adm-nav/50 transition-opacity duration-200",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          aria-label="Navegação principal"
          className={clsx(
            "absolute inset-y-0 left-0 w-64 transition-transform duration-300 ease-luxe",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <Sidebar collapsed={false} onNavigate={() => setDrawerOpen(false)} />
        </aside>
      </div>

      {/* Área de trabalho */}
      <div
        className={clsx(
          "flex min-h-screen flex-col transition-[padding] duration-200 ease-luxe",
          collapsed ? "lg:pl-[4.25rem]" : "lg:pl-60",
        )}
      >
        <Topbar
          onOpenMenu={() => setDrawerOpen(true)}
          onOpenSearch={() => setPaletteOpen(true)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
        />
        <OfflineBanner online={online} />

        <main
          id="conteudo"
          className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8"
        >
          {children}
        </main>

        <footer className="adm-no-print mx-auto w-full max-w-[1500px] px-4 pb-6 sm:px-6 lg:px-8">
          <p className="border-t border-adm-line pt-4 text-micro text-adm-ink-3">
            JA Store Perfumaria · Painel administrativo —{" "}
            <span className="text-adm-ink-3/80">
              protótipo de demonstração, dados fictícios e não persistidos.
            </span>
          </p>
        </footer>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />

      <ShortcutsDialog
        open={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </div>
  );
}

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ["⌘", "K"], description: "Buscar pedido, produto ou cliente" },
  { keys: ["/"], description: "Focar a busca da tela atual" },
  { keys: ["↑", "↓"], description: "Navegar pelos resultados da busca" },
  { keys: ["⏎"], description: "Abrir o resultado destacado" },
  { keys: ["Esc"], description: "Fechar diálogo, gaveta ou busca" },
  { keys: ["?"], description: "Abrir esta lista de atalhos" },
];

function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Atalhos de teclado" size="sm">
      <ul className="flex flex-col divide-y divide-adm-line">
        {SHORTCUTS.map((shortcut) => (
          <li
            key={shortcut.description}
            className="flex items-center justify-between gap-4 py-2.5 text-[13px]"
          >
            <span className="text-adm-ink-2">{shortcut.description}</span>
            <span className="flex shrink-0 gap-1">
              {shortcut.keys.map((key) => (
                <kbd
                  key={key}
                  className="min-w-[1.6rem] rounded border border-adm-line bg-adm-raised px-1.5 py-0.5 text-center text-micro text-adm-ink-2"
                >
                  {key}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
