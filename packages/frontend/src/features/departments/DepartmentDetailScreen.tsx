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
import { StatusBadge } from "../../components/ui/StatusBadge";
import { DepartmentModal } from "./DepartmentModal";

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
        <div className="h-8 w-36 bg-gray-100 rounded-xl" />
        <div className="bg-brand rounded-2xl p-8 space-y-4">
          <div className="h-8 w-1/2 bg-white/20 rounded-xl" />
          <div className="h-4 w-1/4 bg-white/10 rounded" />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Layers className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-2xl font-black text-dark mb-2">Departamento no encontrado</h2>
        <p className="text-gray-400 mb-6">El departamento que buscas no existe o fue eliminado.</p>
        <button
          type="button"
          onClick={() => navigate("/departments")}
          className="flex items-center gap-1 text-sm font-bold text-brand hover:underline"
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
        className="flex items-center gap-2 text-gray-400 hover:text-dark transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Departamentos</span>
      </button>

      {/* Hero card */}
      <div className="relative bg-brand rounded-2xl p-8 overflow-hidden shadow-xl shadow-brand/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {department.name}
              </h1>
              <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-bold border border-white/20">
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
                className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/20 shrink-0"
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
                className="p-2.5 bg-white/20 hover:bg-red-500/30 rounded-xl transition-all border border-white/20 shrink-0"
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
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <UserCircle className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-black text-dark uppercase tracking-widest">
              Miembros
            </h2>
            <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              {members.length}
            </span>
          </div>

          <div className="p-6">
            {members.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <UserCircle className="w-7 h-7 text-gray-200" />
                </div>
                <p className="text-sm font-bold text-gray-400">Sin miembros</p>
                <p className="text-xs text-gray-300 mt-1">
                  Este departamento aún no tiene miembros asignados.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => navigate(`/users/${member.id}`)}
                    className="w-full text-left group bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-brand/20 hover:shadow-md transition-all p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-brand/10 rounded-2xl flex items-center justify-center shrink-0">
                        <span className="text-sm font-black text-brand">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                          {member.name} {member.surname}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{member.email}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col — Stats & recent reports */}
        <div className="space-y-4">
          {/* Stats card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Plane className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-black text-dark uppercase tracking-widest">
                Reportes del departamento
              </h2>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Total reportes
              </p>
              <p className="text-3xl font-black text-dark">{totalReports}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Importe solicitado
              </p>
              <p className="text-2xl font-black text-dark">{totalRequested.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Pendientes
              </p>
              <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
            </div>
          </div>

          {/* Recent reports */}
          {recentReports.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-black text-dark uppercase tracking-widest">
                  Últimos reportes
                </p>
              </div>
              <div className="p-3 space-y-2">
                {recentReports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => navigate(`/trips/${report.id}`)}
                    className="w-full text-left group bg-gray-50 hover:bg-white rounded-xl border border-gray-100 hover:border-brand/20 transition-all p-3 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StatusBadge status={report.status} />
                      <p className="text-xs font-bold text-dark truncate group-hover:text-brand transition-colors">
                        {report.name}
                      </p>
                    </div>
                    <p className="text-xs font-black text-dark shrink-0">
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
