import { useTranslation } from "react-i18next";
import { Users, Building2, Layers, Lock, Shield } from "lucide-react";
import { radius, text } from "../../../styles/theme";

export const QuickActionsGrid = ({
  navigate,
  can,
}: {
  navigate: (path: string) => void;
  can: (permission: string) => boolean;
}) => {
  const { t } = useTranslation();
  const links = [
    { labelKey: "layout.users", icon: Users, path: "/users", permission: "view_users" },
    { labelKey: "layout.departments", icon: Building2, path: "/departments", permission: "view_departments" },
    { labelKey: "layout.roles", icon: Layers, path: "/roles", permission: "view_roles" },
    { labelKey: "layout.permissions", icon: Lock, path: "/permissions", permission: "view_permissions" },
    { labelKey: "layout.organizations", icon: Shield, path: "/organizations", permission: "view_company" },
  ].filter((l) => can(l.permission));

  if (links.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-base font-semibold text-dark flex items-center gap-2.5">
        <div className={`w-6 h-6 bg-slate-100 ${radius.sm} flex items-center justify-center`}>
          <Layers className="w-3.5 h-3.5 text-slate-400" />
        </div>
        {t("layout.management")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {links.map(({ labelKey, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`bg-white ${radius.card} p-4 border border-slate-200 shadow-sm hover:shadow-md hover:border-brand/20 transition-all duration-200 flex flex-col items-center gap-2.5 group`}
          >
            <div className={`w-9 h-9 bg-brand/5 ${radius.sm} flex items-center justify-center text-brand group-hover:bg-brand/10 transition-colors`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className={`${text.caption} !text-dark font-semibold group-hover:text-brand transition-colors text-center`}>
              {t(labelKey)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
