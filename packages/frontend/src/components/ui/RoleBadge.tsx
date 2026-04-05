/**
 * RoleBadge — Neobrutalista badge specifically for user roles.
 * 
 * Replicates the same logic as StatusBadge but for user roles.
 */

import { User, Users, Shield, ShieldAlert, ClipboardList } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { roleColors, fonts } from "@ticket-registrator/shared";

const ROLE_ICONS: Record<string, LucideIcon> = {
  EMPLOYEE:   User,
  MANAGER:    Users,
  CONTROLLER: ClipboardList,
  ADMIN:      Shield,
  SUPERADMIN: ShieldAlert,
};

interface RoleBadgeProps {
  roleName: string | undefined;
  size?: 'sm' | 'md';
  className?: string;
}

export const RoleBadge = ({ roleName, size = 'sm', className }: RoleBadgeProps) => {
  const key = roleName?.toUpperCase() || 'EMPLOYEE';
  const cfg = (roleColors as any)[key] ?? roleColors.EMPLOYEE;
  const Icon = ROLE_ICONS[key] ?? User;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        backgroundColor: cfg.bg,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: 10,
        paddingLeft: 10,
        paddingRight: 10,
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
      {roleName || "—"}
    </span>
  );
};
