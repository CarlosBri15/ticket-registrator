import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import {
  Check,
  Clock,
  X,
  Send,
  Wallet,
  Pencil,
  FilePlus,
} from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

interface StatusConfig {
  className: string;
  icon: ReactNode;
}

const ICON_CLASS = "w-3.5 h-3.5 shrink-0";

/**
 * status enum (uppercase) → kit `.st-*` colour class + lucide icon. Matches the
 * inline status pattern from `preview/components-cards.html` (icon + coloured
 * word, no pill, no background) — appropriate for dense list rows.
 */
const STATUS_CONFIG: Record<string, StatusConfig> = {
  DRAFT:     { className: "st-draft",     icon: <Pencil   className={ICON_CLASS} /> },
  CREATED:   { className: "st-created",   icon: <FilePlus className={ICON_CLASS} /> },
  PENDING:   { className: "st-pending",   icon: <Clock    className={ICON_CLASS} /> },
  SUBMITTED: { className: "st-submitted", icon: <Send     className={ICON_CLASS} /> },
  APPROVED:  { className: "st-approved",  icon: <Check    className={ICON_CLASS} /> },
  PAID:      { className: "st-paid",      icon: <Wallet   className={ICON_CLASS} /> },
  REJECTED:  { className: "st-rejected",  icon: <X        className={ICON_CLASS} /> },
  DECLINED:  { className: "st-declined",  icon: <X        className={ICON_CLASS} /> },
};

const FALLBACK: StatusConfig = STATUS_CONFIG.DRAFT;

/**
 * Inline status indicator — lucide icon + colour-coded text, no background.
 * Uses the kit `.status .st-*` primitives. The mobile app keeps its own status
 * rendering in `packages/shared/statusColors`; this component is web-only.
 */
export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const config = STATUS_CONFIG[key] ?? FALLBACK;

  return (
    <span className={`status ${config.className}`}>
      {config.icon}
      {t(`status.${key}`, { defaultValue: key })}
    </span>
  );
};
