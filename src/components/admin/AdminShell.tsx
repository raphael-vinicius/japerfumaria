"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Tags,
  Ticket,
  BarChart3,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: Tags },
  { href: "/admin/cupons", label: "Cupons", icon: Ticket },
  { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-champagne/40 font-display text-sm font-semibold text-champagne-light">
          JA
        </span>
        <div className="leading-none">
          <p className="font-display text-sm font-semibold text-ivory">
            JA Store
          </p>
          <p className="text-2xs uppercase tracking-luxe text-ivory/40">
            Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {nav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={clsx(
                "flex items-center gap-3 rounded-xs px-3.5 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-champagne text-ivory-50"
                  : "text-ivory/60 hover:bg-ivory-50/5 hover:text-ivory",
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xs px-3.5 py-2.5 text-sm font-medium text-ivory/60 transition duration-300 hover:bg-ivory-50/5 hover:text-ivory"
        >
          <ExternalLink size={18} /> Ver a loja
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F2EC]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 bg-ink lg:block">
        {SidebarContent}
      </aside>

      {/* Sidebar mobile */}
      <div
        className={clsx("fixed inset-0 z-50 lg:hidden", open ? "visible" : "invisible")}
      >
        <div
          className={clsx(
            "absolute inset-0 bg-ink/50 transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setOpen(false)}
        />
        <aside
          className={clsx(
            "absolute inset-y-0 left-0 w-64 bg-ink transition-transform duration-300",
            open ? "translate-x-0" : "-translate-x-full",
          )}
        >
          {SidebarContent}
        </aside>
      </div>

      {/* Conteúdo */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-ink/10 bg-ivory-50/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={22} />
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-ink/10 bg-ivory-50 px-4 py-2 sm:flex">
              <Search size={16} className="text-ink-500" />
              <input
                placeholder="Buscar pedidos, clientes…"
                className="w-56 bg-transparent text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-champagne-soft px-3 py-1 text-xs font-semibold text-champagne-deep sm:block">
              Modo demonstração
            </span>
            <button className="relative grid h-10 w-10 place-items-center rounded-full hover:bg-ink/5">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-wine" />
            </button>
            <button className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-ink/5">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-ivory">
                JA
              </span>
              <ChevronDown size={15} className="text-ink-500" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
