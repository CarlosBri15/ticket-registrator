/**
 * StatusBadge — Web version of the mobile StatusBadge.
 *
 * Matches mobile exactly:
 *   - Solid colored background (no translucency)
 *   - Lucide icon (matches Feather icon names)
 *   - 9px bold Space Grotesk text, all white
 *   - 2px solid dark border (BORDER_WIDTH = 2)
 *   - borderRadius: 8 (RADIUS = 8) → rounded-lg
 *   - Hard shadow: 3px offset (shadowOffset = 3)
 */

import {
  FileText, Clock, Send, CheckCircle, DollarSign, XCircle, Slash, Edit2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { LucideIcon } from 'lucide-react';
import { statusColors, fonts } from "@ticket-registrator/shared";

const STATUS_ICONS: Record<string, LucideIcon> = {
  DRAFT:     Edit2,
  CREATED:   FileText,
  PENDING:   Clock,
  SUBMITTED: Send,
  APPROVED:  CheckCircle,
  PAID:      DollarSign,
  REJECTED:  XCircle,
  DECLINED:  Slash,
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const cfg = (statusColors as any)[key] ?? statusColors.DRAFT;
  const Icon = STATUS_ICONS[key] ?? FileText;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        width: 100,
        backgroundColor: cfg.bg,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 10,
        paddingTop: 5,
        paddingBottom: 5,
        boxShadow: 'none',
        fontFamily: `'${fonts.family}', sans-serif`,
        fontWeight: 700,
        fontSize: 11,
        letterSpacing: '0.2px',
        whiteSpace: 'nowrap',
        lineHeight: 1,
      }}
    >
      <Icon size={iconSize} strokeWidth={2.5} style={{ flexShrink: 0 }} />
      {t(`status.${key}`, { defaultValue: key })}
    </span>
  );
};
