import { Sparkles } from "lucide-react";

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
  avatarIcon = <Sparkles className="w-6 h-6" />,
  badgeContent,
  badgeColorClass = "text-brand/70 bg-brand/10",
}: DashboardHeroProps) => {
  return (
    <div className="relative bg-dark rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-secondary/5 rounded-full translate-y-1/2 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className={`w-14 h-14 ${avatarBgColor} rounded-2xl flex items-center justify-center shadow-xl shadow-brand/25 text-white font-black text-xl select-none`}>
              {user?.name?.charAt(0).toUpperCase() ?? avatarIcon}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-dark rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-brand/60">{subtitleIcon}</span>
              <p className="text-[10px] font-black text-brand/60 uppercase tracking-widest">
                {subtitle}
              </p>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              {t(greetingKey, { name: firstName })} 👋
            </h1>
            {(badgeContent || user?.roleName) && (
              <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${badgeColorClass}`}>
                {badgeContent || user?.roleName}
              </span>
            )}
          </div>
        </div>
        {actions && <div className="flex gap-3 shrink-0">{actions}</div>}
      </div>
    </div>
  );
};
