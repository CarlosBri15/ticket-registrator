/**
 * RoleBadge — Neobrutalista badge specifically for user roles.
 * 
 * Replicates the same logic as StatusBadge but for user roles.
 */

import { User, Users, Shield, ShieldAlert, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { roleColors, roleBorderColors, fonts, nbTokens } from "@ticket-registrator/shared";

type RoleKey = keyof typeof roleColors;

const ROLE_ICONS: Record<string, LucideIcon> = {
  EMPLOYEE:   User,
  MANAGER:    Users,
  CONTROLLER: ClipboardList,
  ADMIN:      Shield,
  SUPERADMIN: ShieldAlert,
};

interface RoleBadgeProps {
  roleName: string | undefined;
  /** size="sm" is the default; size="md" is larger */
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge = ({ roleName, size = 'sm', className }: RoleBadgeProps) => {
  
  // Map display name to key (Admin -> ADMIN, SuperAdmin -> SUPERADMIN)
  const key = (roleName?.toUpperCase() || 'EMPLOYEE') as RoleKey;
  const cfg = (roleColors as any)[key] ?? roleColors.EMPLOYEE;
  const Icon = ROLE_ICONS[key] ?? User;

  const theme = (roleBorderColors as any)[key] ?? roleBorderColors.EMPLOYEE;
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <span
      className={className}
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
      {roleName || "—"}
    </span>
  );
};
