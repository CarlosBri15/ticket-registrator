import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

type StatusConfig = {
  bg: string;
  text: string;
  border: string;
  dot: string;
  pulse?: boolean;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  CREATED:   { bg: "bg-secondary/15", text: "text-brand-hover",  border: "border-secondary/30", dot: "bg-brand",    pulse: true  },
  DRAFT:     { bg: "bg-secondary/15", text: "text-brand-hover",  border: "border-secondary/30", dot: "bg-brand",    pulse: true  },
  PENDING:   { bg: "bg-amber-50",     text: "text-amber-700",    border: "border-amber-200",    dot: "bg-amber-500", pulse: true  },
  SUBMITTED: { bg: "bg-brand/10",     text: "text-brand",        border: "border-brand/20",     dot: "bg-brand",    pulse: true  },
  APPROVED:  { bg: "bg-green-50",     text: "text-green-700",    border: "border-green-200",    dot: "bg-green-500"              },
  REJECTED:  { bg: "bg-red-50",       text: "text-accent",       border: "border-red-200",      dot: "bg-accent"                 },
  PAID:      { bg: "bg-secondary/20", text: "text-brand-hover",  border: "border-secondary/30", dot: "bg-secondary"              },
  DECLINED:  { bg: "bg-red-50",       text: "text-accent",       border: "border-red-200",      dot: "bg-accent"                 },
};

export const StatusBadge = ({ status, size = "sm" }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key = status.toUpperCase();
  const cfg = STATUS_CONFIG[key] ?? STATUS_CONFIG.DRAFT;

  return (
    <span className={`
      inline-flex items-center gap-1.5 font-bold border rounded-full
      ${size === "sm" ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}
      ${cfg.bg} ${cfg.text} ${cfg.border}
    `}>
      <span className={`relative flex w-1.5 h-1.5 shrink-0`}>
        {cfg.pulse && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${cfg.dot}`} />
        )}
        <span className={`relative inline-flex rounded-full w-1.5 h-1.5 ${cfg.dot}`} />
      </span>
      {t(`status.${key}`)}
    </span>
  );
};
