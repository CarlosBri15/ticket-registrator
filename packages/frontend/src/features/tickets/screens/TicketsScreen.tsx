import { useState } from "react";
import { FileText, Receipt, ArrowRight, Calendar, Search } from "lucide-react";
import { useReportsQuery, useTicketsQuery, type ITicket, type IReport } from "@ticket-registrator/shared";
import type { Locale } from "date-fns";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { TicketDetailModal } from "../components/TicketDetailModal";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { tokens, radius } from "../../../styles/theme";

const ReportTicketGroup = ({
  report,
  onTicketClick,
  dateLocale,
  search,
}: {
  report: IReport;
  onTicketClick: (ticket: ITicket, reportId: string) => void;
  dateLocale: Locale;
  search: string;
}) => {
  const { data: tickets, isLoading } = useTicketsQuery(report.id);
  const navigate = useNavigate();

  const filtered = tickets?.filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.location_name?.toLowerCase().includes(q) ||
      t.expense_type?.toLowerCase().includes(q) ||
      String(t.amount).includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="py-4 flex justify-center">
        <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!filtered || filtered.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Report label */}
      <button
        onClick={() => navigate(`/reports/${report.id}`)}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wide hover:text-brand transition-colors group ml-1"
      >
        <span>{report.name}</span>
        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </button>

      {filtered.map((ticket) => (
        <button
          key={ticket.id}
          type="button"
          onClick={() => onTicketClick(ticket, report.id)}
          className={tokens.listItem}
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 bg-slate-50 ${radius.base} flex items-center justify-center group-hover:bg-brand/5 transition-colors shrink-0`}>
              <FileText className="w-5 h-5 text-slate-300" />
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-dark text-sm truncate">
                {ticket.location_name || "Ticket"}
              </h4>
              <div className="flex items-center gap-2.5 mt-0.5">
                <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ticket.date ? format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale }) : "---"}
                </p>
                {ticket.expense_type && (
                  <span className={`text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 ${radius.full} font-medium uppercase tracking-wide`}>
                    {ticket.expense_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-semibold text-dark text-base leading-tight">
                {ticket.amount ?? "—"} <span className="text-[10px] text-slate-400">{ticket.currency}</span>
              </p>
              <StatusBadge status={ticket.status} />
            </div>
            <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-brand transition-colors" />
          </div>
        </button>
      ))}
    </div>
  );
};

export const AllTicketsScreen = () => {
  const { i18n } = useTranslation();
  const { data: reports, isLoading } = useReportsQuery();
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string>("");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dateLocale = i18n.language.startsWith("es") ? es : enUS;

  const handleTicketClick = (ticket: ITicket, reportId: string) => {
    setSelectedTicket(ticket);
    setSelectedReportId(reportId);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-xl font-semibold text-dark tracking-tight mb-1 flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-brand" />
            Todos los Tickets
          </h1>
          <p className="text-sm text-slate-500 font-medium">Listado completo de todos tus tickets de gasto.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        <input
          type="text"
          placeholder="Buscar por establecimiento, categoria o importe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={tokens.searchInput}
        />
      </div>

      {/* Content */}
      {(() => {
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 font-medium text-sm">Cargando tickets...</p>
            </div>
          );
        }

        if (!reports || reports.length === 0) {
          return (
            <div className={`text-center py-24 bg-white ${radius.card} border border-dashed border-slate-200`}>
              <div className={`w-16 h-16 bg-slate-50 ${radius.full} flex items-center justify-center mx-auto mb-5`}>
                <Receipt className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-dark mb-2">No hay tickets registrados</h3>
              <p className="text-slate-400 max-w-sm mx-auto text-sm">
                Sube tickets de gasto desde tus viajes para verlos listados aqui.
              </p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {reports.map((report) => (
              <ReportTicketGroup
                key={report.id}
                report={report}
                onTicketClick={handleTicketClick}
                dateLocale={dateLocale}
                search={search}
              />
            ))}
          </div>
        );
      })()}

      <TicketDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ticket={selectedTicket}
        reportId={selectedReportId}
      />
    </div>
  );
};
