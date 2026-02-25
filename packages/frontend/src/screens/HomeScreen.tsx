import {
  Wallet,
  Plane,
  AlertCircle,
  Plus,
  FileText,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Clock,
  Calendar,
  Receipt,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { useReportsQuery, useUserQuery, useTicketsQuery, ReportStatus } from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

// Sub-component: carga y muestra tickets del viaje activo
const ActiveTripCard = ({ currentTrip, navigate, dateLocale, t }: {
  currentTrip: any;
  navigate: (path: string) => void;
  dateLocale: Locale;
  t: (key: string, opts?: any) => string;
}) => {
  const tripId = currentTrip.id || currentTrip._id;
  const { data: tickets } = useTicketsQuery(tripId);
  const ticketCount = tickets?.length ?? 0;
  const totalAmount = tickets?.reduce((acc: number, tk: any) => acc + (tk.amount || 0), 0) ?? 0;

  return (
    <div
      onClick={() => navigate(`/trips/${tripId}`)}
      className="relative bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/10 overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500"
    >
      <div className="absolute top-0 right-0 w-60 h-60 bg-brand/5 rounded-full -translate-y-1/3 translate-x-1/3 group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full translate-y-1/2 -translate-x-1/4" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <StatusBadge status={currentTrip.status} size="md" />
            <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase font-mono">
              #{tripId.substring(0, 8)}
            </span>
          </div>
          <div className="w-10 h-10 bg-brand/5 rounded-2xl flex items-center justify-center group-hover:bg-brand transition-all duration-300">
            <ArrowUpRight className="w-5 h-5 text-brand group-hover:text-white transition-colors" />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black text-dark tracking-tight group-hover:text-brand transition-colors duration-300 leading-tight">
            {currentTrip.name}
          </h3>
          <p className="text-gray-400 font-medium flex items-center gap-2 mt-2 text-sm">
            <Calendar className="w-4 h-4 text-brand/50" />
            {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })} —{" "}
            {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
          </p>
        </div>

        <div className="flex items-end justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100">
            <Receipt className="w-4 h-4 text-brand/60" />
            <span className="text-sm font-black text-dark">{ticketCount}</span>
            <span className="text-xs text-gray-400 font-medium">{t('home.processedTickets')}</span>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('home.currentExpense')}</p>
            <p className="text-3xl font-black text-brand tracking-tighter leading-none">
              {totalAmount > 0 ? totalAmount.toFixed(2) : currentTrip.requested_amount}
              <span className="text-base font-bold text-brand/50 ml-1">{currentTrip.currency}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading } = useReportsQuery();

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;
  const activeReports = reports?.filter(r => ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED'].includes(r.status.toUpperCase())) || [];
  const completedReports = reports?.filter(r => ['APPROVED', 'PAID', 'REJECTED'].includes(r.status.toUpperCase())) || [];
  const currentTrip = activeReports.length > 0 ? activeReports[0] : null;

  const stats = {
    pendingAmount: reports?.reduce((acc, r) => acc + (r.status === ReportStatus.SUBMITTED ? r.requested_amount : 0), 0) || 0,
    activeCount: activeReports.length,
    rejectedCount: reports?.filter(r => r.status === ReportStatus.DECLINED).length || 0,
  };

  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? 'home.greetingMorning' : hour < 19 ? 'home.greetingAfternoon' : 'home.greetingEvening';
  const firstName = user?.name?.split(' ')[0] || 'Usuario';

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <div className="h-28 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
        <div className="grid grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white rounded-[2rem] border border-gray-100 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-3 gap-10">
          <div className="col-span-2 h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
          <div className="h-72 bg-white rounded-[2.5rem] border border-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">

      {/* 1. HEADER CARD */}
      <div className="relative bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-secondary/5 rounded-full translate-y-2/3 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/25 text-white font-black text-xl select-none">
                {user?.name?.charAt(0).toUpperCase() ?? <Sparkles className="w-6 h-6" />}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-400 mb-0.5 capitalize">
                {new Date().toLocaleDateString(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <h1 className="text-2xl font-black text-dark tracking-tight">
                {t(greetingKey, { name: firstName })} 👋
              </h1>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Button variant="secondary" className="w-auto px-6" onClick={() => navigate('/trips')}>
              <FileText className="w-4 h-4 mr-2" />
              {t('trips.title')}
            </Button>
            <Button className="w-auto px-6 shadow-xl shadow-brand/20" onClick={() => navigate('/trips')}>
              <Plus className="w-4 h-4 mr-2" />
              {t('home.newTrip')}
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          variant="primary"
          title={t('home.pendingReimbursement')}
          value={`${stats.pendingAmount.toFixed(2)} €`}
          icon={<Wallet className="w-5 h-5" />}
          trend={stats.pendingAmount > 0 ? t('home.inProcess') : t('home.upToDate')}
          trendUp={false}
        />
        <StatCard
          title={t('home.activeTrips')}
          value={stats.activeCount.toString()}
          icon={<Plane className="w-5 h-5" />}
          subtitle={stats.activeCount === 1 ? "viaje en curso" : "viajes en curso"}
        />
        <div className={`relative overflow-hidden rounded-[2rem] p-6 flex flex-col gap-4 border shadow-sm transition-all duration-300 ${
          stats.rejectedCount > 0 ? "bg-accent/5 border-accent/20" : "bg-white border-gray-100"
        }`}>
          {stats.rejectedCount > 0 && (
            <div className="absolute top-0 right-0 w-36 h-36 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          )}
          <div className="relative z-10 flex items-start justify-between">
            <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${stats.rejectedCount > 0 ? "text-accent/70" : "text-gray-400"}`}>
              {t('home.rejectedItems')}
            </p>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${stats.rejectedCount > 0 ? "bg-accent/10 text-accent" : "bg-gray-50 text-gray-300"}`}>
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className={`relative z-10 text-3xl font-black tracking-tighter ${stats.rejectedCount > 0 ? "text-accent" : "text-dark"}`}>
            {stats.rejectedCount}
          </h3>
          <p className={`relative z-10 text-xs font-bold ${stats.rejectedCount > 0 ? "text-accent/60" : "text-gray-400"}`}>
            {stats.rejectedCount > 0 ? t('home.requiresAttention') : t('home.noIncidents')}
          </p>
        </div>
      </div>

      {/* 3. MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Active Trip Section */}
        <section className="lg:col-span-2 space-y-5">
          <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
            <div className="w-7 h-7 bg-brand/10 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-brand" />
            </div>
            {t('home.activeTrip')}
          </h2>

          {currentTrip ? (
            <ActiveTripCard currentTrip={currentTrip} navigate={navigate} dateLocale={dateLocale} t={t} />
          ) : (
            <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-14 text-center flex flex-col items-center min-h-[280px] justify-center hover:border-brand/30 hover:bg-gray-50/30 transition-all duration-300 group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-5 group-hover:bg-brand/5 transition-colors">
                <Plane className="w-8 h-8 text-gray-300 group-hover:text-brand/40 transition-colors" />
              </div>
              <p className="text-gray-400 font-semibold mb-6 max-w-xs leading-relaxed">{t('trips.noActiveTrips')}</p>
              <Button variant="secondary" className="w-auto bg-white border-gray-200" onClick={() => navigate('/trips')}>
                <Plus className="w-4 h-4 mr-2" />
                {t('home.createFirst')}
              </Button>
            </div>
          )}
        </section>

        {/* Recent Activity Section */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-dark flex items-center gap-3 tracking-tight">
              <div className="w-7 h-7 bg-gray-100 rounded-xl flex items-center justify-center">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              {t('home.recentActivity')}
            </h2>
            <button onClick={() => navigate('/trips')} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline underline-offset-2">
              {t('common.viewAll')}
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            {completedReports.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-gray-400 font-medium">{t('trips.noCompletedTrips')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {completedReports.slice(0, 5).map((report) => (
                  <div
                    key={report.id || report._id}
                    onClick={() => navigate(`/trips/${report.id || report._id}`)}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                        report.status === ReportStatus.APPROVED ? 'bg-green-50 text-green-600' :
                        report.status === ReportStatus.DECLINED ? 'bg-red-50 text-accent' : 'bg-gray-50 text-gray-400'
                      }`}>
                        {report.name.charAt(0).toUpperCase()}
                      </div>
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
                      <div className="text-right">
                        <span className="font-black text-dark text-sm block leading-none">
                          {report.approved_amount || report.requested_amount}
                          <span className="text-[9px] font-bold text-gray-400 ml-0.5">{report.currency}</span>
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
