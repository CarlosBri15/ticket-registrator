import { useTranslation } from "react-i18next";
import { Users, Building2, Layers, Lock, Shield } from "lucide-react";

export const QuickActionsGrid = ({
  navigate,
  can,
}: {
  navigate: (path: string) => void;
  can: (p: any) => boolean;
}) => {
  const { t } = useTranslation();
  const links = [
    { labelKey: "layout.users", icon: Users, path: "/users", permission: "view_users" },
    { labelKey: "layout.departments", icon: Building2, path: "/departments", permission: "view_departments" },
    { labelKey: "layout.roles", icon: Layers, path: "/roles", permission: "view_roles" },
    { labelKey: "layout.permissions", icon: Lock, path: "/permissions", permission: "view_permissions" },
    { labelKey: "layout.organizations", icon: Shield, path: "/organizations", permission: "view_company" },
  ].filter((l) => can(l.permission as any));

  if (links.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
          <Layers className="w-4 h-4 text-gray-400" />
        </div>
        {t("layout.management")}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {links.map(({ labelKey, icon: Icon, path }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:shadow-brand/5 hover:border-brand/20 transition-all duration-300 flex flex-col items-center gap-3 group"
          >
            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-brand group-hover:bg-brand/10 transition-colors">
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-dark tracking-tight group-hover:text-brand transition-colors">
              {t(labelKey)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
