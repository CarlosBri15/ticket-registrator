import React from "react";
import { CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserDetailSidebarProps {
  totalReports: number;
  avgApproved: string;
  userId: string;
}

const StatBlock = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] p-5 flex flex-col gap-1.5">
    <p className="text-[11px] font-sans-medium text-dark/50 uppercase tracking-wide">{label}</p>
    <p className="text-[26px] font-sans-bold text-dark leading-none tracking-tight">{value}</p>
    {hint && <p className="text-[12px] font-sans-medium text-dark/45 mt-0.5">{hint}</p>}
  </div>
);

export const UserDetailSidebar: React.FC<UserDetailSidebarProps> = ({
  totalReports,
  avgApproved,
  userId,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <StatBlock
        label={t("users.totalReports", "Total reportes")}
        value={totalReports.toString()}
      />
      <StatBlock
        label={t("users.approvedAvg", "Promedio aprobado")}
        value={avgApproved}
        hint={t("users.perReport", "Por reporte")}
      />

      <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] p-5 flex flex-col gap-3">
        <p className="text-[11px] font-sans-medium text-dark/50 uppercase tracking-wide">
          {t("users.systemId", "ID del sistema")}
        </p>
        <code className="font-mono text-[11px] text-dark/55 p-2.5 bg-[var(--color-secondary)] rounded-md border border-[var(--color-border-main)] break-all">
          {userId}
        </code>
      </div>

      <div className="rounded-lg border border-green-100 bg-green-50/50 p-4 flex items-start gap-3">
        <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" aria-hidden={true} />
        <div>
          <h5 className="font-sans-semibold text-success text-[13px] leading-tight">
            {t("users.activeAccount", "Cuenta activa")}
          </h5>
          <p className="text-[12px] font-sans-normal text-success/70 leading-snug mt-1">
            {t(
              "users.activeAccountDesc",
              "El usuario tiene todos los permisos habilitados y está vinculado a la sede principal.",
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
