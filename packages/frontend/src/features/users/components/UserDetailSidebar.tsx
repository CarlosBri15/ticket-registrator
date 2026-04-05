import React from "react";
import { Clock, Wallet, CheckCircle } from "lucide-react";
import { StatCard } from "../../../components/ui/StatCard";
import { PixelCard } from "../../../components/ui/PixelCard";
import { useTranslation } from "react-i18next";

interface UserDetailSidebarProps {
  totalReports: number;
  avgApproved: string;
  userId: string;
}

export const UserDetailSidebar: React.FC<UserDetailSidebarProps> = ({
  totalReports,
  avgApproved,
  userId,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 gap-4">
        <StatCard
          title={t("users.totalReports", "Total Reportes")}
          value={totalReports.toString()}
          icon={<Clock />}
        />
        <StatCard
          title={t("users.approvedAvg", "Promedio Aprobado")}
          value={avgApproved}
          icon={<Wallet />}
          subtitle={t("users.perReport", "Por reporte")}
        />
        <PixelCard>
          <div className="p-5 flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-space-bold text-dark/30 uppercase tracking-[0.2em]">
                  {t("users.systemId", "ID DEL SISTEMA")}
                </p>
             </div>
             <div className="font-mono text-[11px] text-dark/30 p-3 bg-dark/5 rounded-lg border-2 border-dark/5 break-all">
                {userId}
             </div>
          </div>
        </PixelCard>
      </section>

      {/* Account Status / Alert Area */}
      <section>
         <div className="bg-success/5 border-2 border-success/10 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <h5 className="font-space-bold text-success text-sm leading-none mb-1">Cuenta Activa</h5>
              <p className="text-[11px] font-space-medium text-success/60 leading-tight">
                El usuario tiene todos los permisos habilitados y está vinculado a la sede principal.
              </p>
            </div>
         </div>
      </section>
    </div>
  );
};
