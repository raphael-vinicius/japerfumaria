"use client";

import Link from "next/link";
import { useRef, useState, type ComponentType } from "react";
import {
  Bell,
  Boxes,
  ChevronDown,
  ExternalLink,
  Keyboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  PackageCheck,
  Search,
  Settings,
  Clock3,
} from "lucide-react";
import clsx from "clsx";
import { NOW, formatRelative } from "@/lib/admin/datetime";
import { lowStockRows, stockRows } from "@/lib/admin/metrics";
import { useAdmin } from "@/lib/admin/store";
import { IconButton } from "../ui/Button";
import { Dropdown } from "../ui/Navigation";
import { useClickOutside, useEscape } from "../ui/hooks";

/**
 * Barra superior.
 *
 * Fixa, de 56px, com três funções: abrir a busca global, mostrar o
 * que exige ação agora e dar saída rápida para a loja. Nada de
 * enfeite — cada elemento aqui é usado dezenas de vezes por dia.
 */

interface Alert {
  id: string;
  icon: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description: string;
  href: string;
  tone: "warn" | "info" | "bad";
  at?: string;
}

export function Topbar({
  onOpenMenu,
  onOpenSearch,
  onOpenShortcuts,
}: {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
}) {
  const { orders, products, reviews, currentUser } = useAdmin();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useClickOutside(notificationsRef, notificationsOpen, () =>
    setNotificationsOpen(false),
  );
  useEscape(notificationsOpen, () => setNotificationsOpen(false));

  // ——— Alertas derivados do estado real da operação ———
  const alerts: Alert[] = [];

  const toPick = orders.filter((order) => order.status === "pago");
  if (toPick.length)
    alerts.push({
      id: "separar",
      icon: PackageCheck,
      title: `${toPick.length} pedido${toPick.length > 1 ? "s" : ""} aguardando separação`,
      description: "Pagamento confirmado, pronto para embalar.",
      href: "/admin/pedidos?status=pago",
      tone: "info",
      at: toPick[0]?.updatedAt,
    });

  const stale = orders.filter(
    (order) =>
      order.status === "aguardando_pagamento" &&
      NOW.getTime() - new Date(order.createdAt).getTime() > 24 * 3600_000,
  );
  if (stale.length)
    alerts.push({
      id: "pagamento",
      icon: Clock3,
      title: `${stale.length} pedido${stale.length > 1 ? "s" : ""} sem pagamento há mais de 24h`,
      description: "Vale um contato antes de cancelar.",
      href: "/admin/pedidos?status=aguardando_pagamento",
      tone: "warn",
      at: stale[0]?.createdAt,
    });

  const low = lowStockRows(stockRows(products, orders));
  if (low.length)
    alerts.push({
      id: "estoque",
      icon: Boxes,
      title: `${low.length} produto${low.length > 1 ? "s" : ""} com estoque baixo`,
      description: low
        .slice(0, 2)
        .map((row) => row.product.name)
        .join(", "),
      href: "/admin/estoque",
      tone: low.some((row) => row.health === "sem_estoque") ? "bad" : "warn",
    });

  const pendingReviews = reviews.filter((r) => r.status === "pendente");
  if (pendingReviews.length)
    alerts.push({
      id: "avaliacoes",
      icon: MessageSquareQuote,
      title: `${pendingReviews.length} avaliaç${pendingReviews.length > 1 ? "ões" : "ão"} para moderar`,
      description: "Aguardando publicação na loja.",
      href: "/admin/avaliacoes",
      tone: "info",
      at: pendingReviews[0]?.createdAt,
    });

  const toneClasses = {
    warn: "bg-adm-warn-bg text-adm-warn",
    info: "bg-adm-info-bg text-adm-info",
    bad: "bg-adm-bad-bg text-adm-bad",
  };

  return (
    <header className="adm-no-print sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-adm-line bg-adm-surface/95 px-3 backdrop-blur-sm sm:px-5">
      <IconButton
        icon={Menu}
        label="Abrir menu"
        onClick={onOpenMenu}
        className="lg:hidden"
      />

      {/* Busca global — botão, não campo: a paleta é um diálogo. */}
      <button
        type="button"
        onClick={onOpenSearch}
        // min-w-0: sem isso o flex item não encolhe abaixo do
        // min-content do placeholder e empurra a página no celular.
        className="group flex h-9 min-w-0 flex-1 items-center gap-2 rounded-adm border border-adm-line bg-adm-raised px-3 text-left text-[13px] text-adm-ink-3 transition-colors hover:border-adm-line-strong hover:bg-adm-sunken sm:max-w-sm"
      >
        <Search size={15} className="shrink-0" />
        <span className="flex-1 truncate">Buscar pedido, produto, cliente…</span>
        <kbd className="hidden shrink-0 rounded border border-adm-line bg-adm-surface px-1.5 py-0.5 text-micro sm:block">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Link
          href="/"
          className="hidden h-9 items-center gap-1.5 rounded-adm px-2.5 text-[13px] text-adm-ink-2 transition-colors hover:bg-adm-raised hover:text-adm-ink sm:inline-flex"
        >
          Ver a loja
          <ExternalLink size={13} />
        </Link>

        {/* Notificações */}
        <div ref={notificationsRef} className="relative">
          <IconButton
            icon={Bell}
            label={
              alerts.length
                ? `Notificações (${alerts.length} pendências)`
                : "Notificações"
            }
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-expanded={notificationsOpen}
            className="relative"
          />
          {alerts.length > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-adm-bad ring-2 ring-adm-surface"
            />
          )}

          {notificationsOpen && (
            <div
              role="dialog"
              aria-label="Notificações"
              className="absolute right-0 z-50 mt-1 w-[min(21rem,calc(100vw-1.5rem))] overflow-hidden rounded-adm-lg border border-adm-line bg-adm-surface shadow-adm-pop animate-adm-menu"
            >
              <div className="flex items-center justify-between border-b border-adm-line px-4 py-2.5">
                <p className="text-[13px] font-medium text-adm-ink">
                  Pendências
                </p>
                <span className="text-micro text-adm-ink-3">
                  {alerts.length} item{alerts.length === 1 ? "" : "s"}
                </span>
              </div>

              {alerts.length === 0 ? (
                <p className="px-4 py-8 text-center text-[12.5px] text-adm-ink-3">
                  Tudo em dia. Nenhuma pendência agora.
                </p>
              ) : (
                <ul className="max-h-80 overflow-y-auto p-1.5">
                  {alerts.map((alert) => (
                    <li key={alert.id}>
                      <Link
                        href={alert.href}
                        onClick={() => setNotificationsOpen(false)}
                        className="flex gap-2.5 rounded-adm px-2.5 py-2 transition-colors hover:bg-adm-raised"
                      >
                        <span
                          aria-hidden="true"
                          className={clsx(
                            "mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full",
                            toneClasses[alert.tone],
                          )}
                        >
                          <alert.icon size={13} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-[12.5px] font-medium text-adm-ink">
                            {alert.title}
                          </span>
                          <span className="block truncate text-micro text-adm-ink-3">
                            {alert.description}
                          </span>
                          {alert.at && (
                            <span className="mt-0.5 block text-micro text-adm-ink-3/80">
                              {formatRelative(alert.at)}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Usuário */}
        <Dropdown
          label="Menu do usuário"
          items={[
            {
              label: "Configurações",
              href: "/admin/configuracoes",
              icon: Settings,
            },
            {
              label: "Atalhos de teclado",
              onSelect: onOpenShortcuts,
              icon: Keyboard,
            },
            {
              label: "Sair",
              href: "/admin/login",
              icon: LogOut,
              tone: "danger",
              separated: true,
            },
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-haspopup="menu"
              className="flex h-9 items-center gap-2 rounded-adm py-1 pl-1 pr-1.5 transition-colors hover:bg-adm-raised"
            >
              <span
                aria-hidden="true"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-adm-nav text-micro font-medium text-white"
              >
                {currentUser.initials}
              </span>
              <span className="hidden min-w-0 text-left leading-tight md:block">
                <span className="block truncate text-[12.5px] font-medium text-adm-ink">
                  {currentUser.name.split(" ")[0]}
                </span>
                <span className="block truncate text-micro capitalize text-adm-ink-3">
                  {currentUser.role}
                </span>
              </span>
              <ChevronDown size={14} className="shrink-0 text-adm-ink-3" />
            </button>
          )}
        />
      </div>
    </header>
  );
}
