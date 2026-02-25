import { useState } from "react";
import { useReportsQuery } from "@ticket-registrator/shared";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { Modal } from "../components/Modal";
import { ReportForm } from "./ReportForm";
import { Plus, Calendar, ArrowUpRight, Clock, CheckCircle, Plane, Wallet, ChevronRight, BarChart3, MapPin } from "lucide-react";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const SkeletonCard = () => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="h-6 w-24 bg-gray-100 rounded-full" />
      <div className="h-5 w-20 bg-gray-100 rounded-full" />
    </div>
    <div className="h-8 w-3/4 bg-gray-100 rounded-xl mb-4" />
    <div className="flex gap-3 mb-6">
      <div className="h-8 w-36 bg-gray-100 rounded-lg" />
      <div className="h-8 w-24 bg-gray-100 rounded-lg" />
    </div>
    <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
      <div>
        <div className="h-3 w-24 bg-gray-100 rounded mb-2" />
        <div className="h-8 w-32 bg-gray-100 rounded-xl" />
      </div>
      <div className="h-11 w-36 bg-gray-100 rounded-2xl" />
    </div>
  </div>
);

const SkeletonSidebar = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-6 space-y-4">
      <div className="h-16 bg-gray-100 rounded-2xl" />
      <div className="h-16 bg-gray-100 rounded-2xl" />
    </div>
    <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50">
        <div className="h-4 w-20 bg-gray-100 rounded" />
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="p-4 flex justify-between items-center border-b border-gray-50">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
          <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
      ))}
    </div>
  </div>
);

export const ReportsScreen = () => {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: reports, isLoading } = useReportsQuery();
  const navigate = useNavigate();

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  const activeReports = reports?.filter(r => ["CREATED", "DRAFT", "PENDING", "SUBMITTED"].includes(r.status.toUpperCase())) || [];
  const completedReports = reports?.filter(r => ["APPROVED", "PAID", "REJECTED"].includes(r.status.toUpperCase())) || [];

  const historyStats = {
    totalCompleted: completedReports.length,
    totalSpent: completedReports.reduce((acc, curr) => acc + (curr.approved_amount || 0), 0),
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">

      {/* Header */}
      <div className="relative bg-brand rounded-[2rem] px-8 py-6 overflow-hidden shadow-xl shadow-brand/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-white tracking-tight leading-tight">{t("trips.title")}</h1>
              <p className="text-white/50 font-medium text-xs mt-0.5 truncate">{t("home.summary")}</p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="white"
            className="w-auto shrink-0 font-black text-sm px-5 py-2.5"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t("trips.newTripTitle")}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t("trips.newTripTitle")}
      >
        <div className="mb-6 bg-brand/5 p-4 rounded-xl flex items-start gap-3 border border-brand/10">
          <div className="mt-0.5 text-brand">
            <MapPin className="w-5 h-5" />
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

      {/* Empty state - no reports at all */}
      {!isLoading && reports?.length === 0 && (
        <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-inner px-6">
          <div className="w-24 h-24 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Plane className="w-12 h-12 text-brand/30" />
          </div>
          <h3 className="text-3xl font-black text-dark mb-3 tracking-tight">{t("trips.noTickets")}</h3>
          <p className="text-gray-500 mb-10 max-w-md mx-auto text-base leading-relaxed">{t("trips.primerViajeDesc")}</p>
          <Button onClick={() => setIsModalOpen(true)} className="w-auto px-12 py-4 rounded-2xl shadow-xl shadow-brand/20 font-black">
            {t("home.createFirst")}
          </Button>
        </div>
      )}

      {(isLoading || (reports && reports.length > 0)) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Active trips */}
          <section className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
              <h2 className="text-sm font-black text-dark uppercase tracking-widest">{t("home.activeTrip")}</h2>
              {!isLoading && activeReports.length > 0 && (
                <span className="text-[10px] font-black bg-brand/10 text-brand px-2.5 py-1 rounded-full">
                  {activeReports.length}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : activeReports.length > 0 ? (
              <div className="space-y-4">
                {activeReports.map((report, idx) => (
                  <div
                    key={report.id || report._id}
                    onClick={() => navigate(`/trips/${report.id || report._id}`)}
                    className={`group relative bg-white rounded-[2.5rem] border p-8 shadow-sm hover:shadow-xl hover:shadow-brand/8 transition-all duration-500 cursor-pointer overflow-hidden ${
                      idx === 0 ? "border-brand/20" : "border-gray-100"
                    }`}
                  >
                    {idx === 0 && (
                      <div className="absolute top-0 right-0 w-56 h-56 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-brand/8 transition-colors duration-700 pointer-events-none" />
                    )}

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-5">
                        <StatusBadge status={report.status} size="md" />
                        <span className="bg-gray-50 px-3 py-1.5 rounded-full text-[10px] font-mono text-gray-400 border border-gray-100">
                          #{(report.id || report._id || "").substring(0, 8)}
                        </span>
                      </div>

                      <h3 className={`font-black text-dark mb-4 leading-tight group-hover:text-brand transition-colors duration-300 ${
                        idx === 0 ? "text-2xl md:text-3xl" : "text-xl"
                      }`}>
                        {report.name}
                      </h3>

                      <div className="flex flex-wrap gap-2.5">
                        <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 border border-gray-100">
                          <Calendar className="w-3.5 h-3.5 text-brand" />
                          {format(new Date(report.start_date), "dd MMM", { locale: dateLocale })} — {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                        </span>
                        {report.type && (
                          <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 border border-gray-100">
                            <Wallet className="w-3.5 h-3.5 text-brand" />
                            {report.type}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative z-10 pt-6 border-t border-gray-100 mt-6 flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                          {t("reportDetail.totalRequested")}
                        </p>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-black text-dark tracking-tighter">
                            {report.requested_amount?.toLocaleString() ?? "—"}
                          </span>
                          <span className="text-sm font-bold text-gray-400">{report.currency}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full sm:w-auto px-8 rounded-2xl"
                        onClick={(e) => { e.stopPropagation(); navigate(`/trips/${report.id || report._id}`); }}
                      >
                        {t("home.scanTicket")}
                        <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50/80 rounded-[2.5rem] border border-dashed border-gray-200 p-12 flex flex-col items-center justify-center text-center min-h-[280px]">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5 border border-gray-100">
                  <Plane className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-semibold mb-6 max-w-xs text-sm leading-relaxed">{t("trips.noActiveTrips")}</p>
                <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-auto bg-white hover:bg-brand/5 border-gray-200 text-dark font-bold">
                  <Plus className="w-4 h-4 mr-2" />
                  {t("home.createFirst")}
                </Button>
              </div>
            )}
          </section>

          {/* History sidebar */}
          <section className="space-y-5">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-black text-dark uppercase tracking-widest">{t("trips.summary")}</h2>
            </div>

            {isLoading ? (
              <SkeletonSidebar />
            ) : (
              <>
                {/* Stats */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-5 space-y-3">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-green-50/60 border border-green-100/80">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 border border-green-100/50 shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-green-700/60 uppercase tracking-widest">
                        {t("trips.completedTrips")}
                      </p>
                      <p className="text-2xl font-black text-green-900 leading-none mt-0.5">
                        {historyStats.totalCompleted}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand/5 border border-brand/10">
                    <div className="w-11 h-11 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand border border-brand/10 shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-brand/60 uppercase tracking-widest">
                        {t("reportDetail.approved")}
                      </p>
                      <p className="text-xl font-black text-dark leading-none mt-0.5">
                        {historyStats.totalSpent.toLocaleString()}{" "}
                        <span className="text-xs text-gray-400 font-bold">{completedReports[0]?.currency || "EUR"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Completed list */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("trips.history")}</h3>
                  </div>

                  {completedReports.length === 0 ? (
                    <div className="p-8 text-center">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{t("trips.noCompletedTrips")}</p>
                    </div>
                  ) : (
                    <>
                      {completedReports.slice(0, 4).map((report, idx) => (
                        <div
                          key={report.id || report._id}
                          onClick={() => navigate(`/trips/${report.id || report._id}`)}
                          className={`px-5 py-4 hover:bg-gray-50/80 cursor-pointer transition-colors flex items-center gap-3 group ${
                            idx < Math.min(completedReports.length, 4) - 1 ? "border-b border-gray-50" : ""
                          }`}
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand/10 transition-colors">
                            <Plane className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand transition-colors" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-dark text-sm truncate leading-tight">{report.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                              {format(new Date(report.end_date), "dd MMM yyyy", { locale: dateLocale })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-black text-dark">
                              {(report.approved_amount || report.requested_amount || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-400 font-medium">{report.currency}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-brand transition-colors ml-0.5" />
                          </div>
                        </div>
                      ))}
                      {completedReports.length > 4 && (
                        <div className="px-5 py-3 bg-gray-50/80 text-center border-t border-gray-100">
                          <button
                            className="text-[10px] font-black text-brand hover:underline uppercase tracking-widest"
                            onClick={() => navigate("/trips")}
                          >
                            {t("common.viewAll")}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
          </section>

        </div>
      )}
    </div>
  );
};
