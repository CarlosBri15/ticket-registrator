import { Sparkles } from "lucide-react";
import { radius } from "../../../styles/design-tokens";

interface DashboardHeroProps {
  user: any;
  t: (key: string, options?: any) => string;
  greetingKey: string;
  firstName: string;
  subtitle: string;
  subtitleIcon: React.ReactNode;
  actions?: React.ReactNode;
  avatarBgColor?: string;
  avatarIcon?: React.ReactNode;
  badgeContent?: React.ReactNode;
  badgeColorClass?: string;
}

export const DashboardHero = ({
  user,
  t,
  greetingKey,
  firstName,
  subtitle,
  subtitleIcon,
  actions,
  avatarBgColor = "bg-brand",
  avatarIcon = <Sparkles className="w-5 h-5" />,
  badgeContent,
  badgeColorClass = "text-brand/70 bg-brand/10",
}: DashboardHeroProps) => {
  return (
    <div className={`relative bg-dark ${radius.card} p-6 overflow-hidden shadow-lg`}>
      {/* Subtle decorative bg */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand/8 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-secondary/5 rounded-full translate-y-1/2 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className={`w-12 h-12 ${avatarBgColor} ${radius.base} flex items-center justify-center shadow-md text-white font-bold text-lg select-none`}>
              {user?.name?.charAt(0).toUpperCase() ?? avatarIcon}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success border-2 border-dark rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-brand/60">{subtitleIcon}</span>
              <p className="text-[10px] font-medium text-brand/60 uppercase tracking-widest">
                {subtitle}
              </p>
            </div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {t(greetingKey, { name: firstName })}
            </h1>
            {(badgeContent || user?.roleName) && (
              <span className={`inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 ${radius.full} ${badgeColorClass}`}>
                {badgeContent || user?.roleName}
              </span>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-2.5 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
