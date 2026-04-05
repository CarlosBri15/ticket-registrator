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
import { statusColors, statusBorderColors, fonts, nbTokens } from "@ticket-registrator/shared";

type StatusKey = keyof typeof statusColors;

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
  /** size="sm" is the default (matches mobile StatusBadge); size="md" is larger */
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase() as StatusKey;
  const cfg = statusColors[key] ?? statusColors.DRAFT;
  const Icon = STATUS_ICONS[key] ?? FileText;

  const theme = statusBorderColors[key] ?? statusBorderColors.DRAFT;
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: cfg.bg,
        color: cfg.text,
        border: `2px solid ${theme.border}`,
        borderRadius: nbTokens.radiusBadge,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 3,
        paddingBottom: 3,
        boxShadow: `${nbTokens.shadowBadge}px ${nbTokens.shadowBadge}px 0px ${theme.shadow}`,
        fontFamily: `'${fonts.family}', sans-serif`,
        fontWeight: 700,
        fontSize: 9,
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
