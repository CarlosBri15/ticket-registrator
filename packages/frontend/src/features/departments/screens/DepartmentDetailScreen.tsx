import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layers, User, Pencil, Trash2, ChevronRight } from "lucide-react";
import {
  useDepartmentsQuery,
  useUsersQuery,
  useReportsQuery,
  useDeleteDepartmentMutation,
  usePermissions,
  useScope,
  useScopeContext,
  useUserQuery,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui/PageHeader";
import { SectionCard } from "../../../components/ui/SectionCard";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { Button } from "../../../components/ui/Button";
import { DepartmentModal } from "../components/DepartmentModal";

export const DepartmentDetailScreen = () => {
  const { t } = useTranslation();
  const { id: deptId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();
  const { data: currentUser } = useUserQuery();
  const { can } = usePermissions();

  const companyId = isGlobal ? activeCompanyId : currentUser?.companyId ?? null;

  const { data: departments, isLoading: loadingDepts } = useDepartmentsQuery(companyId ?? undefined);
  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { data: allReports, isLoading: loadingReports } = useReportsQuery();
  const deleteMutation = useDeleteDepartmentMutation(companyId ?? "");

  const isLoading = loadingDepts || loadingUsers || loadingReports;

  const department = departments?.find((d) => d.id === deptId);
  const members = (users ?? []).filter((u) => u.departmentIds?.includes(deptId ?? ""));
  const memberIds = new Set(members.map((u) => u.id));
  const deptReports = (allReports ?? []).filter(
    (r) => r.user_id && memberIds.has(r.user_id),
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 animate-pulse">
        <div className="flex flex-col gap-4">
          <div className="h-4 w-32 bg-dark/5 rounded" />
          <div className="h-10 w-64 bg-dark/5 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
          <div className="h-[300px] bg-dark/5 rounded-lg" />
          <div className="h-[200px] bg-dark/5 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          title={t("departments.title", "Departamentos")}
          back={{ label: t("departments.title", "Departamentos"), onClick: () => navigate("/departments") }}
        />
        <div className="flex flex-col items-center py-14 gap-2 text-center">
          <Layers className="w-4 h-4 text-dark/25" aria-hidden={true} />
          <p className="font-sans-medium text-[13px] text-dark/55">
            {t("departments.notFound", "Departamento no encontrado")}
          </p>
        </div>
      </div>
    );
  }

  const totalReports = deptReports.length;
  const totalRequested = deptReports.reduce((acc, r) => acc + (r.requested_amount ?? 0), 0);
  const pendingCount = deptReports.filter((r) =>
    ["PENDING", "SUBMITTED", "CREATED", "DRAFT"].includes(r.status?.toUpperCase() ?? ""),
  ).length;

  const recentReports = [...deptReports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleDelete = () => {
    deleteMutation.mutate(department.id, {
      onSuccess: () => navigate("/departments"),
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={department.name}
        back={{
          label: t("departments.title", "Departamentos"),
          onClick: () => navigate("/departments"),
        }}
        stats={[
          { label: t("departments.members", "Miembros"), value: members.length },
          { label: t("departments.reports", "Reportes"), value: totalReports },
          { label: t("departments.pending", "Pendientes"), value: pendingCount },
        ]}
        actions={
          <div className="flex items-center gap-1">
            {can("edit_departments") && (
              <Button
                variant="secondary"
                size="sm"
                data-testid="edit-button"
                title={t("common.edit", "Editar")}
                onClick={() => setIsEditOpen(true)}
                leftIcon={<Pencil className="w-3.5 h-3.5" />}
              >
                {t("common.edit", "Editar")}
              </Button>
            )}
            {can("delete_departments") && (
              <Button
                variant="ghost-danger"
                size="icon"
                data-testid="delete-button"
                title={t("common.delete", "Eliminar")}
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-start">
        {/* Members list */}
        <SectionCard
          title={t("departments.members", "Miembros")}
          padded={false}
          action={
            <span className="px-1.5 py-0.5 rounded bg-dark/5 text-dark/45 text-[11px] font-sans-bold">
              {members.length}
            </span>
          }
        >
          {members.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-2 text-center">
              <User className="w-4 h-4 text-dark/25" aria-hidden={true} />
              <p className="font-sans-medium text-[13px] text-dark/55">
                {t("departments.noMembers", "Sin miembros")}
              </p>
              <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
                {t("departments.noMembersDesc", "Este departamento aún no tiene miembros asignados.")}
              </p>
            </div>
          ) : (
            <div>
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => navigate(`/users/${member.id}`)}
                  className="group w-full text-left flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border-main)] first:border-t-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
                >
                  <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 shrink-0 group-hover:bg-white">
                    <User className="w-3.5 h-3.5" aria-hidden={true} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
                      {member.name} {member.surname}
                    </p>
                    <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 truncate leading-none">
                      {member.email}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Stats + Recent reports */}
        <div className="flex flex-col gap-4">
          <SectionCard title={t("departments.summary", "Resumen")}>
            <SidebarStat
              label={t("departments.totalReports", "Total reportes")}
              value={totalReports.toString()}
            />
            <SidebarStat
              label={t("departments.totalRequested", "Importe solicitado")}
              value={totalRequested.toLocaleString()}
            />
            <SidebarStat
              label={t("departments.pending", "Pendientes")}
              value={pendingCount.toString()}
              danger={pendingCount > 0}
            />
          </SectionCard>

          {recentReports.length > 0 && (
            <SectionCard title={t("departments.recentReports", "Últimos reportes")} padded={false}>
              <div>
                {recentReports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className="group w-full text-left flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border-main)] first:border-t-0 hover:bg-[var(--color-secondary)] transition-colors duration-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-sans-semibold text-dark text-[13px] truncate leading-snug">
                        {report.name}
                      </p>
                      <p className="font-sans-bold text-dark/70 tabular-nums text-[12px] mt-0.5">
                        {(report.requested_amount ?? 0).toLocaleString()}
                        {report.currency && (
                          <span className="font-sans-medium text-dark/45 ml-1">
                            {report.currency}
                          </span>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={report.status} size="sm" />
                  </button>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>

      {companyId && isEditOpen && (
        <DepartmentModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          companyId={companyId}
          department={department}
        />
      )}
    </div>
  );
};

const SidebarStat = ({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[12px] font-sans-medium text-dark/55">{label}</span>
    <span
      className={`text-[18px] font-sans-bold tabular-nums leading-none ${danger ? "text-warning" : "text-dark"}`}
    >
      {value}
    </span>
  </div>
);
