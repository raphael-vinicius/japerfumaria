"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Store } from "lucide-react";
import clsx from "clsx";
import { useAdmin } from "@/lib/admin/store";
import { lowStockRows, stockRows } from "@/lib/admin/metrics";
import { isActivePath, navGroups } from "./nav";

/**
 * Barra lateral fixa.
 *
 * Escura de propósito: separa o "chrome" do painel da área de
 * trabalho clara, e deixa a hierarquia óbvia mesmo em telas
 * grandes. Os contadores mostram pendência real (pedidos a
 * separar, estoque baixo, avaliações a moderar) — não notificação
 * decorativa: se está zerado, o número some.
 */
export function Sidebar({
  collapsed,
  onToggleCollapse,
  onNavigate,
}: {
  collapsed: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { orders, products, reviews } = useAdmin();

  const badges = {
    pedidos: orders.filter(
      (order) => order.status === "pago" || order.status === "separando",
    ).length,
    estoque: lowStockRows(stockRows(products, orders)).length,
    avaliacoes: reviews.filter((review) => review.status === "pendente").length,
  };

  return (
    <div className="adm-nav flex h-full flex-col bg-adm-nav text-white">
      {/* Marca */}
      <div
        className={clsx(
          "flex h-14 shrink-0 items-center border-b border-white/[0.07]",
          collapsed ? "justify-center px-2" : "gap-2.5 px-4",
        )}
      >
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          aria-label="JA Store — painel administrativo"
          className="flex items-center gap-2.5 rounded-adm"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-adm border border-champagne/35 font-display text-[13px] font-semibold text-champagne-light"
          >
            JA
          </span>
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-[13px] font-medium text-white">
                JA Store
              </span>
              <span className="block text-micro text-white/40">
                Painel administrativo
              </span>
            </span>
          )}
        </Link>
      </div>

      {/* Navegação */}
      <nav
        aria-label="Navegação principal"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-2 py-3"
      >
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4 last:mb-0">
            {!collapsed && (
              <p className="px-2.5 pb-1.5 text-micro-caps font-medium uppercase text-white/30">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-px">
              {group.items.map((item) => {
                const active = isActivePath(pathname, item.href);
                const count = item.badge ? badges[item.badge] : 0;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      aria-current={active ? "page" : undefined}
                      className={clsx(
                        "group relative flex items-center rounded-adm text-[13px] transition-colors duration-150",
                        collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-2.5 py-2",
                        active
                          ? "bg-white/[0.09] font-medium text-white"
                          : "text-white/55 hover:bg-white/[0.05] hover:text-white/90",
                      )}
                    >
                      {active && (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-1.5 left-0 w-[2px] rounded-full bg-champagne"
                        />
                      )}
                      <item.icon size={16} className="shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {count > 0 && (
                            <span
                              className="shrink-0 rounded-full bg-white/10 px-1.5 py-px text-micro font-medium tabular-nums text-white/70"
                              aria-label={`${count} pendente${count > 1 ? "s" : ""}`}
                            >
                              {count}
                            </span>
                          )}
                        </>
                      )}
                      {collapsed && count > 0 && (
                        <span
                          aria-hidden="true"
                          className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-champagne"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="shrink-0 border-t border-white/[0.07] p-2">
        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? "Ver a loja" : undefined}
          className={clsx(
            "flex items-center rounded-adm py-2 text-[13px] text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white/90",
            collapsed ? "justify-center px-2" : "gap-2.5 px-2.5",
          )}
        >
          <Store size={16} className="shrink-0" />
          {!collapsed && "Ver a loja"}
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            title={collapsed ? "Expandir menu" : "Recolher menu"}
            className={clsx(
              "mt-px hidden w-full items-center rounded-adm py-2 text-[13px] text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/80 lg:flex",
              collapsed ? "justify-center px-2" : "gap-2.5 px-2.5",
            )}
          >
            {collapsed ? (
              <ChevronsRight size={16} />
            ) : (
              <>
                <ChevronsLeft size={16} />
                Recolher
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
