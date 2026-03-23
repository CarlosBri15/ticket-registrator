import { useTranslation } from "react-i18next";
import { tokens } from '../../styles/theme';

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

type StatusConfig = {
  classes: string;
  dot: string;
  pulse?: boolean;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  CREATED:   { classes: tokens.badgeNeutral,  dot: "bg-slate-400",  pulse: true  },
  DRAFT:     { classes: tokens.badgeNeutral,  dot: "bg-slate-400",  pulse: true  },
  PENDING:   { classes: tokens.badgeWarning,  dot: "bg-warning",    pulse: true  },
  SUBMITTED: { classes: tokens.badgeBrand,    dot: "bg-brand",      pulse: true  },
  APPROVED:  { classes: tokens.badgeSuccess,  dot: "bg-success"                  },
  REJECTED:  { classes: tokens.badgeDanger,   dot: "bg-danger"                   },
  PAID:      { classes: tokens.badgeSuccess,  dot: "bg-success"                  },
  DECLINED:  { classes: tokens.badgeDanger,   dot: "bg-danger"                   },
};

export const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.DRAFT;

  const sizeClass = size === "sm" ? tokens.badgeSm : tokens.badge;

  return (
    <span className={`${sizeClass} ${cfg.classes}`}>
      <span className="relative flex w-1.5 h-1.5 shrink-0">
        {cfg.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${cfg.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${cfg.dot}`} />
      </span>
      {t(`status.${key}`)}
    </span>
  );
};
