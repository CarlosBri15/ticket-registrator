import { useMemo } from "react";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Wallet,
  Clock,
  ChevronRight,
  Calendar,
  Sparkles,
  Shield,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import {
  useReportsQuery,
  useUserQuery,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format, isThisWeek } from "date-fns";
import { es, enUS } from "date-fns/locale";

// ── Sub-components ──────────────────────────────────────────────────

const ControllerSkeleton = () => (
  <div className="space-y-8 pb-10">
    <div className="h-28 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />
      ))}
    </div>
    <div className="grid grid-cols-3 gap-10">
      <div className="col-span-2 h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
      <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
    </div>
  </div>
);

const ControllerHero = ({ t, user, greetingKey, firstName, navigate }: any) => (
  <div className="relative bg-dark rounded-[2.5rem] p-8 overflow-hidden shadow-2xl">
    <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
    <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-secondary/5 rounded-full translate-y-1/2 pointer-events-none" />
    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/25 text-white font-black text-xl select-none">
            {user?.name?.charAt(0).toUpperCase() ?? <Sparkles className="w-6 h-6" />}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-dark rounded-full" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3.5 h-3.5 text-amber-400/60" />
            <p className="text-[10px] font-black text-amber-400/60 uppercase tracking-widest">
              Panel de Control · Aprobaciones
            </p>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {t(greetingKey, { name: firstName })} {"👋"}
          </h1>
          {user?.roleName && (
            <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-widest text-amber-400/70 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
              {user.roleName}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-3 shrink-0">
        <Button
          className="w-auto px-5 shadow-xl shadow-amber-500/30"
          onClick={() => navigate("/trips")}
        >
          <FileText className="w-4 h-4 mr-2" />
          Ver todos los viajes
        </Button>
      </div>
    </div>
  </div>
);

const PendingStatsCard = ({ pendingCount }: { pendingCount: number }) => (
  <div
    className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${
      pendingCount > 0 ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"
    }`}
  >
    {pendingCount > 0 && (
      <div className="absolute top-0 right-0 w-36 h-36 bg-amber-100/50 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
    )}
    <div className="relative z-10 flex items-start justify-between">
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${pendingCount > 0 ? "text-amber-600" : "text-gray-400"}`}>
        Pendientes
      </p>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${pendingCount > 0 ? "bg-amber-100 text-amber-600" : "bg-gray-50 text-gray-300"}`}>
        <AlertCircle className="w-5 h-5" />
      </div>
    </div>
    <h3 data-testid="pending-count" className={`relative z-10 text-3xl font-black tracking-tighter ${pendingCount > 0 ? "text-amber-700" : "text-dark"}`}>
      {pendingCount}
    </h3>
    <p className={`relative z-10 text-xs font-bold ${pendingCount > 0 ? "text-amber-600/70" : "text-gray-400"}`}>
      {pendingCount > 0 ? "Requieren revisión" : "Todo al día"}
    </p>
  </div>
);

const WeeklyStatsCard = ({ title, count, icon, colorClass, subtitle }: any) => {
  const getColors = () => {
    if (colorClass === "green") return "bg-green-50 text-green-500";
    if (count > 0) return "bg-red-100 text-red-600";
    return "bg-gray-50 text-gray-300";
  };

  const getContainerClass = () => {
    if (colorClass === "red" && count > 0) return "bg-red-50 border-red-200";
    return "bg-white border-gray-100";
  };

  return (
    <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${getContainerClass()}`}>
      <div className="relative z-10 flex items-start justify-between">
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${colorClass === "red" && count > 0 ? "text-red-600" : "text-gray-400"}`}>
          {title}
        </p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getColors()}`}>
          {icon}
        </div>
      </div>
      <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${colorClass === "red" && count > 0 ? "text-red-700" : "text-dark"}`}>
        {count}
      </h3>
      <p className={`relative z-10 text-xs font-bold ${colorClass === "red" && count > 0 ? "text-red-600/70" : "text-gray-400"}`}>
        {subtitle}
      </p>
    </div>
  );
};

const PendingAmountCard = ({ amount }: { amount: number }) => (
  <div className="relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm bg-white border-gray-100">
    <div className="relative z-10 flex items-start justify-between">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        Importe pendiente
      </p>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-50 text-gray-400">
        <Wallet className="w-5 h-5" />
      </div>
    </div>
    <h3 className="relative z-10 text-3xl font-black tracking-tighter text-dark">
      {amount.toFixed(2)}
      <span className="text-[10px] font-bold text-gray-400 ml-1">€</span>
    </h3>
    <p className="relative z-10 text-xs font-bold text-gray-400">
      Total por revisar
    </p>
  </div>
);

const ApprovalQueue = ({ pending, navigate, dateLocale }: any) => (
  <section className="lg:col-span-2 space-y-5" data-testid="approval-queue">
    <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
      <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${pending.length > 0 ? "bg-amber-100" : "bg-gray-100"}`}>
        <Clock className={`w-4 h-4 ${pending.length > 0 ? "text-amber-600" : "text-gray-400"}`} />
      </div>
      Cola de aprobación
      {pending.length > 0 && (
        <span className="ml-1 text-xs font-black bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full">
          {pending.length}
        </span>
      )}
    </h2>

    {pending.length === 0 ? (
      <div data-testid="empty-queue" className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <p className="text-gray-400 font-semibold max-w-xs leading-relaxed">
          Todo al día · Sin pendientes
        </p>
      </div>
    ) : (
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="divide-y divide-gray-50">
          {pending.map((report: any) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/trips/${report.id}`)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-amber-50/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center font-black text-sm text-amber-600 shrink-0">
                  {report.name?.charAt(0).toUpperCase() || "R"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-dark text-sm truncate group-hover:text-amber-600 transition-colors">
                    {report.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-2">
                <span className="font-black text-dark text-sm">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                </span>
                <StatusBadge status={report.status} size="sm" />
                <span className="text-xs font-black text-amber-600 group-hover:underline">
                  Revisar →
                </span>
                <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </button>
          ))}
        </div>
        {pending.length > 8 && (
          <div className="p-4 border-t border-gray-50 text-center">
            <button
              onClick={() => navigate("/trips?status=SUBMITTED")}
              className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
            >
              Ver todos ({pending.length})
            </button>
          </div>
        )}
      </div>
    )}
  </section>
);

const RecentlyProcessed = ({ recentProcessed, navigate, dateLocale }: any) => (
  <section className="space-y-5">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
        <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
          <Clock className="w-4 h-4 text-gray-400" />
        </div>
        Procesados recientemente
      </h2>
    </div>

    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      {recentProcessed.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-400 font-medium">Sin reportes procesados aún</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {recentProcessed.map((report: any) => (
            <button
              key={report.id}
              type="button"
              onClick={() => navigate(`/trips/${report.id}`)}
              className="w-full text-left p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <StatusBadge status={report.status} size="sm" />
                <div className="min-w-0">
                  <p className="font-bold text-dark text-sm truncate group-hover:text-brand transition-colors">
                    {report.name}
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                <span className="font-black text-dark text-sm">
                  {report.requested_amount.toFixed(2)}
                  <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  </section>
);

// ── Main Component ──────────────────────────────────────────────────

export const ControllerDashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading } = useReportsQuery();

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  // ── Helpers ──────────────────────────────────────────────────────────
  const getGreetingKey = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "home.greetingMorning";
    if (hour < 19) return "home.greetingAfternoon";
    return "home.greetingEvening";
  };

  const filteredReports = reports ?? [];
  const pending = useMemo(
    () => filteredReports.filter((r) => r.status.toUpperCase() === "SUBMITTED"),
    [filteredReports],
  );

  const approvedThisWeek = useMemo(
    () =>
      filteredReports.filter((r) => {
        const d = new Date(r.updatedAt);
        return r.status.toUpperCase() === "APPROVED" && isThisWeek(d);
      }),
    [filteredReports],
  );

  const declinedThisWeek = useMemo(
    () =>
      filteredReports.filter((r) => {
        const d = new Date(r.updatedAt);
        const status = r.status.toUpperCase();
        return (
          (status === "DECLINED" || status === "REJECTED") && isThisWeek(d)
        );
      }),
    [filteredReports],
  );

  const pendingAmount = useMemo(
    () => pending.reduce((acc, r) => acc + r.requested_amount, 0),
    [pending],
  );

  const recentProcessed = useMemo(
    () =>
      filteredReports
        .filter((r) =>
          ["APPROVED", "DECLINED", "REJECTED"].includes(r.status.toUpperCase()),
        )
        .slice(0, 5),
    [filteredReports],
  );

  const firstName = user?.name?.split(" ")[0] || "Usuario";

  if (isLoading) {
    return <ControllerSkeleton />;
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* Hero Section */}
      <ControllerHero 
        t={t} 
        user={user} 
        greetingKey={getGreetingKey()} 
        firstName={firstName} 
        navigate={navigate} 
      />

      {/* Stats Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5" data-testid="controller-stats">
        <PendingStatsCard pendingCount={pending.length} />
        <WeeklyStatsCard 
          title="Aprobados esta semana" 
          count={approvedThisWeek.length} 
          icon={<CheckCircle className="w-5 h-5" />}
          colorClass="green"
          subtitle="Aprobados en 7 días"
        />
        <WeeklyStatsCard 
          title="Rechazados esta semana" 
          count={declinedThisWeek.length} 
          icon={<XCircle className="w-5 h-5" />}
          colorClass="red"
          subtitle={declinedThisWeek.length > 0 ? "Requieren atención" : "Sin rechazos"}
        />
        <PendingAmountCard amount={pendingAmount} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <ApprovalQueue 
          pending={pending} 
          navigate={navigate} 
          dateLocale={dateLocale} 
        />
        <RecentlyProcessed 
          recentProcessed={recentProcessed} 
          navigate={navigate} 
          dateLocale={dateLocale} 
        />
      </div>
    </div>
  );
};
