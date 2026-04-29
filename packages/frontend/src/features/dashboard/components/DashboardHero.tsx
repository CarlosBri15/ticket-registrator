import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ICurrentUser } from "@ticket-registrator/shared";

interface DashboardHeroProps {
  user: ICurrentUser | undefined;
  t: (key: string, options?: Record<string, unknown>) => string;
  greetingKey: string;
  firstName: string;
  subtitle: string;
  subtitleIcon: React.ReactNode;
  actions?: React.ReactNode;
  badgeContent?: React.ReactNode;
}

export const DashboardHero = ({
  user,
  t,
  greetingKey,
  firstName,
  subtitle,
  subtitleIcon,
  badgeContent,
  actions,
}: DashboardHeroProps) => {
  const { i18n } = useTranslation();

  const today = new Date().toLocaleDateString(i18n.language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const fullGreeting: string = t(greetingKey, { name: firstName });
  const nameIndex = fullGreeting.lastIndexOf(firstName);
  const greetingPrefix = nameIndex > 0 ? fullGreeting.slice(0, nameIndex) : "";
  const greetingName = nameIndex > 0 ? fullGreeting.slice(nameIndex) : fullGreeting;

  return (
    <div className="flex items-end justify-between gap-4 pt-1">
      <div className="flex flex-col gap-2 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {subtitleIcon && <span className="shrink-0 text-dark/40">{subtitleIcon}</span>}
          <p className="text-[11px] font-sans-semibold text-dark/45 uppercase tracking-wide">
            {subtitle}
          </p>
          {(badgeContent || user?.roleName) && (
            <span className="text-[10px] font-sans-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-[var(--color-secondary)] text-dark/60">
              {badgeContent || user?.roleName}
            </span>
          )}
        </div>

        <h1 className="text-[36px] font-sans-bold text-dark leading-none tracking-tight">
          <span className="text-dark/40 font-sans-medium">{greetingPrefix}</span>
          {greetingName}
        </h1>

        <p className="text-[12px] font-sans-medium text-dark/45 flex items-center gap-1.5 capitalize mt-0.5">
          <Calendar className="w-3 h-3 text-dark/35" aria-hidden={true} />
          {today}
        </p>
      </div>

      {actions && <div className="shrink-0 flex items-center gap-2">{actions}</div>}
    </div>
  );
};
