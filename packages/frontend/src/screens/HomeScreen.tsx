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
  Calendar
} from "lucide-react";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { StatusBadge } from "../components/StatusBadge";
import { useReportsQuery, useUserQuery } from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";

export const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: user } = useUserQuery();
  const { data: reports, isLoading } = useReportsQuery();

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  // Lógica de datos reales
  const activeReports = reports?.filter(r => ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED'].includes(r.status.toUpperCase())) || [];
  const completedReports = reports?.filter(r => ['APPROVED', 'PAID', 'REJECTED'].includes(r.status.toUpperCase())) || [];
  
  const currentTrip = activeReports.length > 0 ? activeReports[0] : null;

  const stats = {
    pendingAmount: reports?.reduce((acc, r) => acc + (r.status === 'SUBMITTED' || r.status === 'PENDING' ? r.requested_amount : 0), 0) || 0,
    activeCount: activeReports.length,
    rejectedCount: reports?.filter(r => r.status === 'REJECTED').length || 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      
      {/* 1. HEADER & WELCOME */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tight">
            {t('home.greeting', { name: user?.name?.split(' ')[0] || 'Usuario' })}
          </h1>
          <p className="text-gray-500 font-medium">{t('home.summary')}</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="w-auto px-6" onClick={() => navigate('/trips')}>
                <FileText className="w-4 h-4 mr-2" />
                {t('trips.title')}
            </Button>
            <Button className="w-auto px-6 shadow-xl shadow-brand/20" onClick={() => navigate('/trips')}>
                <Plus className="w-4 h-4 mr-2" />
                {t('home.newTrip')}
            </Button>
        </div>
      </div>

      {/* 2. KPIS / METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title={t('home.pendingReimbursement')}
          value={`${stats.pendingAmount.toFixed(2)} €`} 
          icon={<Wallet className="w-6 h-6" />}
          trend={stats.pendingAmount > 0 ? "En proceso" : "Al día"}
          trendUp={stats.pendingAmount > 0}
        />
        <StatCard 
          title={t('home.activeTrips')}
          value={stats.activeCount.toString()} 
          icon={<Plane className="w-6 h-6" />}
        />
        <div className={`p-6 rounded-[2rem] border flex items-start justify-between transition-all ${
            stats.rejectedCount > 0 
            ? "bg-red-50 border-red-100" 
            : "bg-white border-gray-100 shadow-sm"
        }`}>
           <div>
             <p className={`text-sm font-bold uppercase tracking-wider mb-1 ${stats.rejectedCount > 0 ? "text-accent/80" : "text-gray-400"}`}>
                {t('home.rejectedItems')}
             </p>
             <h3 className={`text-3xl font-black ${stats.rejectedCount > 0 ? "text-accent" : "text-dark"}`}>
                {stats.rejectedCount}
             </h3>
             <p className="text-xs mt-2 font-medium text-gray-400">
                {stats.rejectedCount > 0 ? "Requieren tu atención" : "Sin incidencias"}
             </p>
           </div>
           <div className={`p-3 rounded-2xl ${stats.rejectedCount > 0 ? "bg-white/50 text-accent" : "bg-gray-50 text-gray-300"}`}>
             <AlertCircle className="w-6 h-6" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 3. VIAJE ACTIVO (Highlight) */}
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-dark flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-brand" />
            {t('home.activeTrip')}
          </h2>
          
          {currentTrip ? (
            <div 
                onClick={() => navigate(`/trips/${currentTrip.id || (currentTrip as any)._id}`)}
                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-brand/10 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500"
            >
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-700"></div>

                <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                    <StatusBadge status={currentTrip.status} />
                    <span className="text-[10px] font-black text-gray-300 tracking-widest uppercase">
                        #{(currentTrip.id || (currentTrip as any)._id || "").substring(0,8)}
                    </span>
                    </div>
                    <h3 className="text-3xl font-black text-dark leading-tight group-hover:text-brand transition-colors">
                        {currentTrip.name}
                    </h3>
                    <p className="text-gray-500 font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand/60" />
                    {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })} - {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Gasto Actual</p>
                    <p className="text-4xl font-black text-brand tracking-tighter">{currentTrip.requested_amount} €</p>
                </div>
                </div>

                <div className="mt-10 flex items-center justify-between pt-8 border-t border-gray-50">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                                <FileText className="w-3 h-3" />
                            </div>
                        ))}
                        <div className="pl-4 self-center text-xs font-bold text-gray-400">
                            Tickets procesados
                        </div>
                    </div>
                    <Button className="w-auto px-8 rounded-2xl">
                        {t('home.addExpense')}
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                    <Plane className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium mb-6">{t('trips.noActiveTrips')}</p>
                <Button variant="outline" className="bg-white" onClick={() => navigate('/trips')}>
                    {t('home.createFirst')}
                </Button>
            </div>
          )}
        </section>

        {/* 4. HISTORIAL RECIENTE */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                {t('home.recentActivity')}
            </h2>
            <button onClick={() => navigate('/trips')} className="text-xs font-black text-brand uppercase tracking-widest hover:underline">
                {t('common.viewAll')}
            </button>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {completedReports.slice(0, 5).map((report) => (
              <div 
                key={report.id || (report as any)._id} 
                onClick={() => navigate(`/trips/${report.id || (report as any)._id}`)}
                className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                      report.status === 'APPROVED' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {report.name.substring(0, 1).toUpperCase()}
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
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <span className="font-black text-dark text-sm block leading-none">{report.approved_amount || report.requested_amount} €</span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Liquidado</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
            {completedReports.length === 0 && (
                <div className="p-10 text-center">
                    <p className="text-sm text-gray-400 font-medium">{t('trips.noCompletedTrips')}</p>
                </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};
