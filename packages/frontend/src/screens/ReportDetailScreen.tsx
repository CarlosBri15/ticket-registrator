import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ScanLine, FileText, Calendar, Wallet, Banknote, Tag, History, Plus } from "lucide-react";
import { Button } from "../components/Button";
import { StatusBadge } from "../components/StatusBadge";
import { TicketUploadModal } from "../components/TicketUploadModal";
import { useReportQuery } from "@ticket-registrator/shared";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export const ReportDetailScreen = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const { data: report, isLoading, isError } = useReportQuery(id);

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 font-medium">{t('reportDetail.loadingDetails')}</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-dark mb-2">{t('reportDetail.errorLoading')}</h2>
        <p className="text-gray-500 mb-6">{t('reportDetail.errorDesc')}</p>
        <Button onClick={() => navigate('/trips')} className="w-auto px-8">{t('common.cancel')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* 1. Navigation & Header */}
      <div className="flex flex-col gap-6">
        <button 
            onClick={() => navigate('/trips')}
            className="flex items-center gap-2 text-gray-400 hover:text-dark transition-colors w-fit group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-semibold">{t('reportDetail.backToTrips')}</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-bold text-dark tracking-tight">{report.name}</h1>
                    <StatusBadge status={report.status as any} />
                </div>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-gray-500">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand/60" />
                        <span className="text-sm font-medium">
                            {format(new Date(report.start_date), "d MMM", { locale: dateLocale })} - {format(new Date(report.end_date), "d MMM yyyy", { locale: dateLocale })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                        <Tag className="w-4 h-4 text-brand/60" />
                        <span className="text-sm font-medium">{report.type || t('common.loading')}</span>
                    </div>
                    <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
                        <span className="text-xs font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100 text-gray-400">
                            #{id?.substring(0,8)}
                        </span>
                    </div>
                </div>
            </div>
            
            <Button 
                onClick={() => setIsUploadModalOpen(true)} 
                className="w-full md:w-auto px-8 py-4 text-lg shadow-2xl shadow-brand/20 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <ScanLine className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">{t('reportDetail.scanTicket')}</span>
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-dark flex items-center gap-2">
                    {t('reportDetail.ticketsTitle')}
                    <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">0</span>
                </h2>
                <div className="flex items-center gap-1 text-xs font-bold text-brand hover:underline cursor-pointer">
                    <History className="w-3.5 h-3.5" />
                    {t('reportDetail.activityHistory')}
                </div>
              </div>
              
              <div className="bg-white/40 backdrop-blur-sm rounded-[3rem] border border-dashed border-gray-300 p-20 text-center group hover:bg-white hover:border-brand/30 transition-all duration-500">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                      <div className="absolute inset-0 bg-brand/5 rounded-full group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-gray-300 group-hover:text-brand/40 transition-colors" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100 group-hover:rotate-12 transition-transform">
                          <Plus className="w-4 h-4 text-brand" />
                      </div>
                  </div>
                  <h3 className="text-2xl font-bold text-dark mb-3 tracking-tight">{t('reportDetail.startDigitalizing')}</h3>
                  <p className="text-gray-500 text-base mb-10 max-w-sm mx-auto leading-relaxed">
                      {t('reportDetail.digitalizeDesc')}
                  </p>
                  <Button variant="secondary" onClick={() => setIsUploadModalOpen(true)} className="w-auto px-10 rounded-2xl border-2 border-gray-100 hover:border-brand/20">
                      <ScanLine className="w-5 h-5 mr-2" />
                      {t('reportDetail.scanFirstTicket')}
                  </Button>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-2 h-full bg-brand/10 group-hover:bg-brand transition-colors duration-500" />
                  <div className="flex items-center gap-3 mb-8">
                      <div className="w-10 h-10 bg-brand/10 text-brand rounded-xl flex items-center justify-center">
                          <Wallet className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-dark text-lg">{t('reportDetail.financialSummary')}</h3>
                  </div>
                  
                  <div className="space-y-8">
                      <div className="flex flex-col gap-1 p-5 rounded-2xl bg-gray-50/50 border border-gray-100">
                          <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">{t('reportDetail.totalRequested')}</span>
                          <div className="flex items-baseline gap-2">
                              <span className="text-4xl font-extrabold text-dark">{report.requested_amount}</span>
                              <span className="text-sm font-bold text-gray-400">{report.currency}</span>
                          </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-green-50/30 border border-green-100/50">
                              <span className="text-[10px] text-green-700/60 font-bold uppercase tracking-widest block mb-1">{t('reportDetail.approved')}</span>
                              <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-extrabold text-green-600">{report.approved_amount}</span>
                                  <span className="text-[10px] font-bold text-green-600/50">{report.currency}</span>
                              </div>
                          </div>
                          <div className="p-4 rounded-2xl bg-amber-50/30 border border-amber-100/50">
                              <span className="text-[10px] text-amber-700/60 font-bold uppercase tracking-widest block mb-1">{t('reportDetail.inReview')}</span>
                              <div className="flex items-baseline gap-1">
                                  <span className="text-xl font-extrabold text-amber-600">0</span>
                                  <span className="text-[10px] font-bold text-amber-600/50">{report.currency}</span>
                              </div>
                          </div>
                      </div>

                      <div className="pt-4 flex flex-col gap-3 border-t border-gray-50">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium flex items-center gap-2">
                                <Banknote className="w-4 h-4" />
                                {t('reportDetail.estimatedReimbursement')}
                            </span>
                            <span className="font-bold text-dark">{report.approved_amount} {report.currency}</span>
                         </div>
                      </div>
                  </div>
              </div>

              <div className="bg-brand/5 p-6 rounded-[2rem] border border-brand/10">
                  <h4 className="text-sm font-bold text-brand-hover mb-2 flex items-center gap-2">
                      <ScanLine className="w-4 h-4" />
                      {t('reportDetail.aiTipTitle')}
                  </h4>
                  <p className="text-xs text-brand/70 leading-relaxed font-medium">
                      {t('reportDetail.aiTipDesc')}
                  </p>
              </div>
          </div>
      </div>

      <TicketUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        reportId={id!} 
      />
    </div>
  );
};
