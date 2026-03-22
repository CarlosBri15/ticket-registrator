import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Layers,
  UserCircle,
  Pencil,
  Trash2,
  ArrowRight,
  Plane,
} from "lucide-react";
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
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { DepartmentModal } from "../components/DepartmentModal";
import { tokens, radius } from "../../../styles/theme";

export const DepartmentDetailScreen = () => {
  const { id: deptId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();
  const { data: currentUser } = useUserQuery();
  const { can } = usePermissions();

  const companyId = isGlobal ? activeCompanyId : (currentUser?.companyId ?? null);

  const { data: departments, isLoading: loadingDepts } = useDepartmentsQuery(companyId ?? undefined);
  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { data: allReports, isLoading: loadingReports } = useReportsQuery();
  const deleteMutation = useDeleteDepartmentMutation(companyId ?? "");

  const isLoading = loadingDepts || loadingUsers || loadingReports;

  const department = departments?.find((d) => d.id === deptId);
  const members = (users ?? []).filter((u) => u.departmentIds?.includes(deptId ?? ""));
  const memberIds = new Set(members.map((u) => u.id));
  const deptReports = (allReports ?? []).filter((r) => r.user_id && memberIds.has(r.user_id));

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 animate-pulse">
        <div className={`h-8 w-36 bg-slate-100 ${radius.base}`} />
        <div className={`bg-brand ${radius.card} p-8 space-y-4`}>
          <div className={`h-8 w-1/2 bg-white/20 ${radius.base}`} />
          <div className="h-4 w-1/4 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className={`bg-white ${radius.card} border border-slate-200 p-6 space-y-3`}>
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-10 bg-slate-100 ${radius.base}`} />
            ))}
          </div>
          <div className={`bg-white ${radius.card} border border-slate-200 p-6 space-y-3`}>
            {[1, 2].map((i) => (
              <div key={i} className={`h-8 bg-slate-100 ${radius.base}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Layers className="w-12 h-12 text-slate-200 mb-4" />
        <h2 className="text-xl font-semibold text-dark mb-2">Departamento no encontrado</h2>
        <p className="text-slate-400 text-sm mb-6">El departamento que buscas no existe o fue eliminado.</p>
        <button
          type="button"
          onClick={() => navigate("/departments")}
          className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Departamentos
        </button>
      </div>
    );
  }

  const totalReports = deptReports.length;
  const totalRequested = deptReports.reduce((acc, r) => acc + (r.requested_amount ?? 0), 0);
  const pendingCount = deptReports.filter((r) =>
    ["PENDING", "SUBMITTED", "CREATED", "DRAFT"].includes(r.status?.toUpperCase() ?? "")
  ).length;

  const recentReports = [...deptReports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleDelete = () => {
    deleteMutation.mutate(department.id, {
      onSuccess: () => {
        navigate("/departments");
      },
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/departments")}
        className="flex items-center gap-2 text-slate-400 hover:text-dark transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">Departamentos</span>
      </button>

      {/* Hero card */}
      <div className={`bg-brand ${radius.card} p-6 shadow-md`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 bg-white/20 ${radius.base} flex items-center justify-center shrink-0 border border-white/30`}>
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {department.name}
              </h1>
              <span className={`text-xs bg-white/20 text-white px-2.5 py-1 ${radius.full} font-semibold border border-white/20`}>
                {members.length} {members.length === 1 ? "miembro" : "miembros"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {can("edit_departments") && (
              <button
                type="button"
                data-testid="edit-button"
                onClick={() => setIsEditOpen(true)}
                className={`p-2 bg-white/20 hover:bg-white/30 ${radius.base} transition-all border border-white/20 shrink-0`}
                title="Editar departamento"
              >
                <Pencil className="w-4 h-4 text-white" />
              </button>
            )}
            {can("delete_departments") && (
              <button
                type="button"
                data-testid="delete-button"
                onClick={handleDelete}
                className={`p-2 bg-white/20 hover:bg-red-500/30 ${radius.base} transition-all border border-white/20 shrink-0`}
                title="Eliminar departamento"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — Members */}
        <div className={`lg:col-span-2 ${tokens.listSection}`}>
          <div className={`${tokens.listSectionHeader}`}>
            <UserCircle className="w-4 h-4 text-slate-400" />
            <h2 className={tokens.listSectionTitle}>
              Miembros
            </h2>
            <span className={`${tokens.badgeSm} ${tokens.badgeNeutral}`}>
              {members.length}
            </span>
          </div>

          <div className="p-5">
            {members.length === 0 ? (
              <div className="text-center py-10">
                <div className={`w-12 h-12 bg-slate-50 ${radius.base} flex items-center justify-center mx-auto mb-3`}>
                  <UserCircle className="w-6 h-6 text-slate-200" />
                </div>
                <p className="text-sm font-semibold text-slate-400">Sin miembros</p>
                <p className="text-xs text-slate-300 mt-1">
                  Este departamento aún no tiene miembros asignados.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => navigate(`/users/${member.id}`)}
                    className={`w-full text-left group bg-slate-50 hover:bg-white ${radius.base} border border-slate-100 hover:border-brand/20 hover:shadow-sm transition-all p-3.5 flex items-center justify-between`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 bg-brand/10 ${radius.base} flex items-center justify-center shrink-0`}>
                        <span className="text-sm font-semibold text-brand">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-dark text-sm truncate group-hover:text-brand transition-colors">
                          {member.name} {member.surname}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{member.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Stats & recent reports */}
        <div className="space-y-4">
          {/* Stats card */}
          <div className={tokens.card}>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Plane className="w-4 h-4 text-slate-400" />
              <h2 className={tokens.listSectionTitle}>
                Reportes del departamento
              </h2>
            </div>
            <div>
              <p className={tokens.statCardLabel}>Total reportes</p>
              <p className="text-2xl font-bold text-dark mt-1">{totalReports}</p>
            </div>
            <div>
              <p className={tokens.statCardLabel}>Importe solicitado</p>
              <p className="text-xl font-bold text-dark mt-1">{totalRequested.toLocaleString()}</p>
            </div>
            <div>
              <p className={tokens.statCardLabel}>Pendientes</p>
              <p className="text-xl font-bold text-warning mt-1">{pendingCount}</p>
            </div>
          </div>

          {/* Recent reports */}
          {recentReports.length > 0 && (
            <div className={tokens.listSection}>
              <div className={tokens.listSectionHeader}>
                <p className={tokens.listSectionTitle}>
                  Últimos reportes
                </p>
              </div>
              <div className="p-3 space-y-1.5">
                {recentReports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => navigate(`/reports/${report.id}`)}
                    className={`w-full text-left group bg-slate-50 hover:bg-white ${radius.base} border border-slate-100 hover:border-brand/20 transition-all p-3 flex items-center justify-between gap-2`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status={report.status} />
                      <p className="text-xs font-semibold text-dark truncate group-hover:text-brand transition-colors">
                        {report.name}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-dark shrink-0">
                      {(report.requested_amount ?? 0).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
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
