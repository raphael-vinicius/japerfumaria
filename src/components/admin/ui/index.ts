/**
 * Design System do painel — ponto único de importação.
 *
 * As telas importam daqui e só daqui. Se um padrão precisa mudar,
 * muda em um lugar e o painel inteiro acompanha.
 */

export { Button, ButtonLink, IconButton } from "./Button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./Button";

export {
  Field,
  Input,
  Textarea,
  Select,
  Toggle,
  Checkbox,
  FieldSet,
} from "./Field";

export { Badge, StatusBadge, Count } from "./Badge";

export {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardLinkFooter,
  StatsCard,
  DataRow,
  MoneyRow,
} from "./Card";

export {
  Table,
  TableWrap,
  THead,
  TBody,
  Th,
  Tr,
  Td,
  TdLink,
  TableMessage,
} from "./Table";

export {
  EmptyState,
  ErrorState,
  OfflineBanner,
  Skeleton,
  TableSkeleton,
  StatsSkeleton,
  LoadingState,
} from "./States";

export { Modal, Drawer, ConfirmProvider, useConfirm } from "./Overlay";
export { ToastProvider, useToast } from "./Toast";

export { Tabs, Breadcrumb, Pagination, Dropdown } from "./Navigation";
export type { TabItem, Crumb, DropdownItem } from "./Navigation";

export {
  SearchInput,
  FilterBar,
  ActiveFilters,
  DateRangePicker,
  FilterButton,
  buildRange,
} from "./Filters";
export type { DateRange } from "./Filters";

export { TrendChart, RankBars, Sparkline, ShareBar } from "./Chart";
export type { TrendPoint, RankItem } from "./Chart";

export { PageHeader, SectionTitle } from "./PageHeader";

export {
  useEscape,
  useClickOutside,
  useScrollLock,
  useFocusTrap,
  useMounted,
  useHotkey,
  useSort,
  usePagination,
  normalize,
  matchesQuery,
} from "./hooks";
export type { SortState, SortDirection } from "./hooks";
