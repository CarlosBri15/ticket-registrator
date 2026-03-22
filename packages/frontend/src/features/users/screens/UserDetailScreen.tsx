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
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EditUserModal } from "../components/EditUserModal";
import { tokens, radius } from "../../../styles/theme";

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
      <div className="space-y-5 pb-16 animate-pulse">
        <div className={`h-7 w-24 ${tokens.skeleton} ${radius.base}`} />
        <div className={`bg-white ${radius.card} border border-slate-200 shadow-sm p-6 space-y-4`}>
          <div className="flex gap-4">
            <div className={`w-16 h-16 ${tokens.skeleton} ${radius.base} shrink-0`} />
            <div className="flex-1 space-y-2.5">
              <div className={`h-5 w-1/2 ${tokens.skeleton} ${radius.base}`} />
              <div className={`h-4 w-1/3 ${tokens.skeleton} ${radius.sm}`} />
              <div className={`h-4 w-1/4 ${tokens.skeleton} ${radius.sm}`} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`bg-white ${radius.card} border border-slate-200 p-5 space-y-2`}>
              <div className={`h-3 w-1/2 ${tokens.skeleton} ${radius.sm}`} />
              <div className={`h-7 w-3/4 ${tokens.skeleton} ${radius.base}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <UserCircle className="w-14 h-14 text-slate-200 mb-4" />
        <h2 className="text-xl font-semibold text-dark mb-2">Usuario no encontrado</h2>
        <p className="text-slate-400 text-sm mb-5">El usuario que buscas no existe o fue eliminado.</p>
        <button
          type="button"
          onClick={() => navigate("/users")}
          className="flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
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
    <div className="space-y-5 animate-in fade-in duration-300 pb-16">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/users")}
        className="flex items-center gap-1.5 text-slate-400 hover:text-dark transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span className="text-sm font-semibold">Usuarios</span>
      </button>

      {/* Profile hero card */}
      <div className={`relative bg-brand ${radius.card} p-6 overflow-hidden shadow-md`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className={`w-16 h-16 bg-white/20 ${radius.base} flex items-center justify-center shrink-0 border border-white/30`}>
              <span className="text-2xl font-bold text-white">{initial}</span>
            </div>

            {/* Info */}
            <div className="space-y-1.5">
              <h1 className="text-xl font-semibold text-white tracking-tight">
                {user.name} {user.surname}
              </h1>
              <p className="text-white/60 text-sm font-medium">{user.email}</p>
              <p className="text-white/50 text-sm font-medium">@{user.username}</p>

              {/* Role badge */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className={`text-xs bg-white/20 text-white px-2.5 py-0.5 ${radius.full} font-semibold border border-white/20`}>
                  {roleName}
                </span>
                {userDepts.map((dept) => (
                  <span
                    key={dept.id}
                    className={`text-xs bg-white/10 text-white/80 px-2 py-0.5 ${radius.full} font-medium border border-white/10`}
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
            className={`p-2 bg-white/20 hover:bg-white/30 ${radius.base} transition-all border border-white/20 shrink-0`}
            title="Editar usuario"
          >
            <Pencil className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={tokens.statCard}>
          <p className={tokens.statCardLabel}>Total viajes</p>
          <p className={tokens.statCardValue}>{totalTrips}</p>
        </div>
        <div className={tokens.statCard}>
          <p className={tokens.statCardLabel}>Importe solicitado</p>
          <p className={tokens.statCardValue}>{totalRequested.toLocaleString()}</p>
        </div>
        <div className={tokens.statCard}>
          <p className={tokens.statCardLabel}>Importe aprobado</p>
          <p className={`${tokens.statCardValue} !text-success`}>{totalApproved.toLocaleString()}</p>
        </div>
      </div>

      {/* Reports list */}
      <div className={tokens.listSection}>
        <div className={tokens.listSectionHeader}>
          <Plane className="w-4 h-4 text-slate-400" />
          <h2 className={tokens.listSectionTitle}>
            Historial de viajes
          </h2>
          <span className={`${tokens.badgeSm} ${tokens.badgeNeutral}`}>
            {totalTrips}
          </span>
        </div>

        <div className="p-5">
          {latestReports.length === 0 ? (
            <div className="text-center py-12">
              <div className={`w-14 h-14 bg-slate-50 ${radius.card} flex items-center justify-center mx-auto mb-3`}>
                <Plane className="w-7 h-7 text-slate-200" />
              </div>
              <p className="text-sm font-medium text-slate-400">Sin viajes registrados</p>
              <p className="text-xs text-slate-300 mt-0.5">Este usuario no tiene viajes todavía.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {latestReports.map((report) => (
                <button
                  key={report.id}
                  type="button"
                  onClick={() => navigate(`/reports/${report.id}`)}
                  className={`w-full text-left group bg-slate-50 hover:bg-white ${radius.base} border border-slate-200 hover:border-brand/20 hover:shadow-sm transition-all p-3.5 flex items-center justify-between`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div>
                      <StatusBadge status={report.status} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-dark text-sm truncate group-hover:text-brand transition-colors">
                        {report.name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(report.start_date), "dd MMM", { locale: es })} —{" "}
                        {format(new Date(report.end_date), "dd MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-dark">
                        {(report.requested_amount ?? 0).toLocaleString()}
                        <span className="text-xs text-slate-400 font-medium ml-1">{report.currency}</span>
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
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
