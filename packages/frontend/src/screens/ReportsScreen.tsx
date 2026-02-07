import { useState } from "react";
import { useReportsQuery } from "@ticket-registrator/shared";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";
import { ReportForm } from "./ReportForm";
import { Plus, Calendar, ArrowUpRight, Clock, CheckCircle, Plane, Wallet, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: reports, isLoading } = useReportsQuery();
  const navigate = useNavigate();

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  // Filtrar viajes por estado
  const activeReports = reports?.filter(r => ['CREATED', 'DRAFT', 'PENDING', 'SUBMITTED'].includes(r.status.toUpperCase())) || [];
  const completedReports = reports?.filter(r => ['APPROVED', 'PAID', 'REJECTED'].includes(r.status.toUpperCase())) || [];

  // Tomamos el primer viaje activo como el principal
  const currentTrip = activeReports.length > 0 ? activeReports[0] : null;

  // Cálculo de estadísticas históricas
  const historyStats = {
    totalCompleted: completedReports.length,
    totalSpent: completedReports.reduce((acc, curr) => acc + (curr.approved_amount || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2">{t('trips.title')}</h1>
          <p className="text-gray-500 font-medium max-w-2xl">{t('home.summary')}</p>
        </div>
        {!currentTrip && (
            <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto px-8 py-4 shadow-2xl shadow-brand/20 text-base font-bold">
                <Plus className="w-5 h-5 mr-2" />
                {t('trips.newTripTitle')}
            </Button>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={t('trips.newTripTitle')}
      >
        <div className="mb-6 bg-brand/5 p-4 rounded-xl flex items-start gap-3 border border-brand/10">
            <div className="mt-0.5 text-brand">
                <ArrowUpRight className="w-5 h-5" />
            </div>
            <p className="text-sm text-brand-hover leading-relaxed">
                Define el destino y fechas de tu viaje. Podrás ir añadiendo tickets a medida que se generen los gastos.
            </p>
        </div>
        <ReportForm 
          onSuccess={() => setIsModalOpen(false)} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {isLoading && (
        <div className="text-center py-32 bg-white/50 rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold tracking-wide">{t('common.loading')}</p>
        </div>
      )}

      {!isLoading && reports?.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-inner max-w-4xl mx-auto px-6">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center mx-auto mb-8">
             <Plane className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-3xl font-black text-dark mb-4 tracking-tight">{t('trips.noTickets')}</h3>
          <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">{t('trips.primerViajeDesc')}</p>
          <Button onClick={() => setIsModalOpen(true)} className="w-auto px-12 py-4 rounded-2xl mx-auto shadow-xl">
            {t('home.createFirst')}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. VIAJE EN CURSO (Destacado) */}
        <section className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-dark flex items-center gap-3">
                <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                {t('home.activeTrip')}
            </h2>

            {currentTrip ? (
                <div 
                    onClick={() => navigate(`/trips/${currentTrip.id || currentTrip._id}`)}
                    className="group relative bg-white rounded-[3rem] border border-brand/10 p-8 lg:p-10 shadow-xl shadow-brand/5 hover:shadow-2xl hover:shadow-brand/10 transition-all duration-500 cursor-pointer overflow-hidden min-h-[300px] flex flex-col justify-between"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-brand/10 transition-colors duration-700" />
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <StatusBadge status={currentTrip.status} />
                            <span className="bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-mono text-gray-400 border border-gray-100">
                                #{ (currentTrip.id || currentTrip._id || "").substring(0,8) }
                            </span>
                        </div>

                        <h3 className="text-4xl lg:text-5xl font-black text-dark mb-4 leading-tight group-hover:text-brand transition-colors">
                            {currentTrip.name}
                        </h3>

                        <div className="flex flex-wrap gap-4 text-sm font-medium text-gray-500 mb-8">
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Calendar className="w-4 h-4 text-brand" />
                                {format(new Date(currentTrip.start_date), "dd MMM", { locale: dateLocale })} - {format(new Date(currentTrip.end_date), "dd MMM yyyy", { locale: dateLocale })}
                            </span>
                            <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Wallet className="w-4 h-4 text-brand" />
                                {currentTrip.type || 'Business'}
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-6">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t('reportDetail.totalRequested')}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-dark tracking-tighter">{currentTrip.requested_amount}</span>
                                <span className="text-lg font-bold text-gray-400">{currentTrip.currency}</span>
                            </div>
                        </div>
                        <Button className="w-full sm:w-auto px-8 rounded-2xl group-hover:bg-brand-hover">
                            {t('home.scanTicket')}
                            <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 p-10 flex flex-col items-center justify-center text-center h-[300px]">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                        <Plane className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium mb-6 max-w-xs">{t('trips.noActiveTrips')}</p>
                    <Button onClick={() => setIsModalOpen(true)} variant="outline" className="bg-white hover:bg-gray-50 border-gray-200 text-dark">
                        {t('home.createFirst')}
                    </Button>
                </div>
            )}
        </section>

        {/* 3. RESUMEN HISTÓRICO (Lateral) */}
        <section className="space-y-6">
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                Resumen
            </h2>

            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50/50 border border-green-100/50">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-green-800/60 uppercase tracking-wider">{t('trips.completedTrips')}</p>
                        <p className="text-2xl font-black text-green-900">{historyStats.totalCompleted}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('reportDetail.approved')}</p>
                        <p className="text-2xl font-black text-dark">
                            {historyStats.totalSpent.toLocaleString()} <span className="text-sm text-gray-400 font-bold">{currentTrip?.currency || 'EUR'}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Lista compacta de finalizados */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-dark text-sm uppercase tracking-wide">Historial</h3>
                </div>
                {completedReports.slice(0, 3).map((report) => (
                    <div 
                        key={report.id || report._id}
                        onClick={() => navigate(`/trips/${report.id || report._id}`)}
                        className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-center justify-between group"
                    >
                        <div>
                            <p className="font-bold text-dark text-sm truncate max-w-[120px]">{report.name}</p>
                            <p className="text-xs text-gray-400">{format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand transition-colors" />
                    </div>
                ))}
                {completedReports.length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-xs text-gray-400">{t('trips.noCompletedTrips')}</p>
                    </div>
                )}
                {completedReports.length > 3 && (
                    <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                        <span className="text-xs font-bold text-brand cursor-pointer hover:underline">{t('common.viewAll')}</span>
                    </div>
                )}
            </div>
        </section>

      </div>
    </div>
  );
};
