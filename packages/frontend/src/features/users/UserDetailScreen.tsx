import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  UserCircle,
  Pencil,
  Plane,
  ArrowRight,
} from "lucide-react";
import {
  useUsersQuery,
  useReportsQuery,
  useRolesQuery,
  useDepartmentsQuery,
  useScope,
  useScopeContext,
  useUserQuery,
  ReportStatus,
} from "@ticket-registrator/shared";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditUserModal } from "./EditUserModal";

export const UserDetailScreen = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();
  const { data: currentUser } = useUserQuery();
  const companyId = isGlobal ? activeCompanyId : (currentUser?.companyId ?? null);

  const { data: users, isLoading: loadingUsers } = useUsersQuery();
  const { data: allReports, isLoading: loadingReports } = useReportsQuery();
  const { data: roles } = useRolesQuery(companyId ?? undefined);
  const { data: departments } = useDepartmentsQuery(companyId ?? undefined);

  const user = users?.find((u) => u.id === userId);
  const userReports = allReports?.filter((r) => r.user_id === userId) ?? [];

  const isLoading = loadingUsers || loadingReports;

  if (isLoading) {
    return (
      <div className="space-y-6 pb-20 animate-pulse">
        {/* Back button skeleton */}
        <div className="h-8 w-28 bg-gray-100 rounded-xl" />
        {/* Hero card skeleton */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-4">
          <div className="flex gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 w-1/2 bg-gray-100 rounded-xl" />
              <div className="h-4 w-1/3 bg-gray-100 rounded" />
              <div className="h-4 w-1/4 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
              <div className="h-4 w-1/2 bg-gray-100 rounded" />
              <div className="h-8 w-3/4 bg-gray-100 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <UserCircle className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-2xl font-black text-dark mb-2">Usuario no encontrado</h2>
        <p className="text-gray-400 mb-6">El usuario que buscas no existe o fue eliminado.</p>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="flex items-center gap-1 text-sm font-bold text-brand hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Usuarios
        </button>
      </div>
    );
  }

  const roleName = roles?.find((r) => r.id === user.roleId)?.name ?? "—";
  const userDepts = departments?.filter((d) => user.departmentIds?.includes(d.id)) ?? [];

  const totalTrips = userReports.length;
  const totalRequested = userReports.reduce((acc, r) => acc + (r.requested_amount ?? 0), 0);
  const totalApproved = userReports
    .filter((r) => r.status.toUpperCase() === ReportStatus.APPROVED.toUpperCase())
    .reduce((acc, r) => acc + (r.approved_amount ?? 0), 0);

  const latestReports = [...userReports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="flex items-center gap-2 text-gray-400 hover:text-dark transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-bold">Usuarios</span>
      </button>

      {/* Profile hero card */}
      <div className="relative bg-brand rounded-2xl p-8 overflow-hidden shadow-xl shadow-brand/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center shrink-0 border border-white/30">
              <span className="text-3xl font-black text-white">{initial}</span>
            </div>

            {/* Info */}
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {user.name} {user.surname}
              </h1>
              <p className="text-white/60 text-sm font-medium">{user.email}</p>
              <p className="text-white/50 text-sm font-medium">@{user.username}</p>

              {/* Role badge */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs bg-white/20 text-white px-3 py-1 rounded-full font-bold border border-white/20">
                  {roleName}
                </span>
                {userDepts.map((dept) => (
                  <span
                    key={dept.id}
                    className="text-xs bg-white/10 text-white/80 px-2.5 py-1 rounded-full font-medium border border-white/10"
                  >
                    {dept.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Edit button */}
          <button
            type="button"
            data-testid="edit-button"
            onClick={() => setIsEditOpen(true)}
            className="p-2.5 bg-white/20 hover:bg-white/30 rounded-xl transition-all border border-white/20 shrink-0"
            title="Editar usuario"
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total viajes</p>
          <p className="text-4xl font-black text-dark tracking-tight">{totalTrips}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Importe solicitado</p>
          <p className="text-4xl font-black text-dark tracking-tight">{totalRequested.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Importe aprobado</p>
          <p className="text-4xl font-black text-green-600 tracking-tight">{totalApproved.toLocaleString()}</p>
        </div>
      </div>

      {/* Reports list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Plane className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-black text-dark uppercase tracking-widest">
            Historial de viajes
          </h2>
          <span className="text-xs font-black bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            {totalTrips}
          </span>
        </div>

        <div className="p-6">
          {latestReports.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Plane className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-sm font-bold text-gray-400">Sin viajes registrados</p>
              <p className="text-xs text-gray-300 mt-1">Este usuario no tiene viajes todavía.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => navigate(`/trips/${report.id}`)}
                  className="w-full text-left group bg-gray-50 hover:bg-white rounded-2xl border border-gray-100 hover:border-brand/20 hover:shadow-md transition-all p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div>
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                        {report.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(report.start_date), "dd MMM", { locale: es })} —{" "}
                        {format(new Date(report.end_date), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-black text-dark">
                        {(report.requested_amount ?? 0).toLocaleString()}
                        <span className="text-xs text-gray-400 font-medium ml-1">{report.currency}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditOpen && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={user}
          companyId={companyId}
        />
      )}
    </div>
  );
};
