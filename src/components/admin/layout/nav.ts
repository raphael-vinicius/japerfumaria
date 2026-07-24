import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  MessageSquareQuote,
  Package,
  Settings,
  ShoppingBag,
  Tags,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Navegação do painel, agrupada pelo trabalho de quem opera a loja
 * — não pela estrutura do banco. "Operação" é o que se abre todo
 * dia; "Configurações" é o que se abre uma vez por mês.
 */

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Chave do contador exibido à direita (pendências). */
  badge?: "pedidos" | "estoque" | "avaliacoes";
  description: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Operação",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        description: "Visão do dia e pendências",
      },
      {
        href: "/admin/pedidos",
        label: "Pedidos",
        icon: ShoppingBag,
        badge: "pedidos",
        description: "Fila de pedidos e status",
      },
      {
        href: "/admin/estoque",
        label: "Estoque",
        icon: Boxes,
        badge: "estoque",
        description: "Saldo, reservas e movimentações",
      },
    ],
  },
  {
    label: "Catálogo",
    items: [
      {
        href: "/admin/produtos",
        label: "Produtos",
        icon: Package,
        description: "Cadastro, preço e publicação",
      },
      {
        href: "/admin/categorias",
        label: "Categorias",
        icon: Tags,
        description: "Organização da vitrine",
      },
    ],
  },
  {
    label: "Relacionamento",
    items: [
      {
        href: "/admin/clientes",
        label: "Clientes",
        icon: Users,
        description: "Histórico e valor por cliente",
      },
      {
        href: "/admin/avaliacoes",
        label: "Avaliações",
        icon: MessageSquareQuote,
        badge: "avaliacoes",
        description: "Moderação e respostas",
      },
      {
        href: "/admin/cupons",
        label: "Cupons",
        icon: Ticket,
        description: "Campanhas e descontos",
      },
    ],
  },
  {
    label: "Análise",
    items: [
      {
        href: "/admin/relatorios",
        label: "Relatórios",
        icon: BarChart3,
        description: "Vendas por período e recorte",
      },
    ],
  },
  {
    label: "Sistema",
    items: [
      {
        href: "/admin/configuracoes",
        label: "Configurações",
        icon: Settings,
        description: "Loja, frete, pagamento e equipe",
      },
    ],
  },
];

export const allNavItems: NavItem[] = navGroups.flatMap((group) => group.items);

/** Item ativo: casa a rota mais específica possível. */
export const isActivePath = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
