import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import { userIcon } from "@ticket-registrator/shared/assets";
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
    <div className="flex items-center justify-between gap-4 pb-6 mb-1">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white overflow-hidden border-2 border-border-main shadow-hard">
          <img src={userIcon} alt="avatar" className="w-10 h-10 object-contain" />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {subtitleIcon && <div className="shrink-0">{subtitleIcon}</div>}
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">{subtitle}</p>
            {(badgeContent || user?.roleName) && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/15">
                {badgeContent || user?.roleName}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
            <span className="text-slate-400 font-medium">{greetingPrefix}</span>
            {greetingName}
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5 capitalize">
            <Calendar className="w-3 h-3" />
            {today}
          </p>
        </div>
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
};
