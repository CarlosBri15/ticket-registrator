import { useState } from "react";
import { FileText, Receipt, ArrowRight, Calendar, Search } from "lucide-react";
import { useReportsQuery, useTicketsQuery, type ITicket, type IReport } from "@ticket-registrator/shared";
import { StatusBadge } from "../components/StatusBadge";
import { TicketDetailModal } from "../components/TicketDetailModal";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

// Sub-component that loads tickets for a single report
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
  const { data: tickets, isLoading } = useTicketsQuery(report.id || report._id!);
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
        onClick={() => navigate(`/trips/${report.id || report._id}`)}
        className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-brand transition-colors group ml-1"
      >
        <span>{report.name}</span>
        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
      </button>

      {filtered.map((ticket) => (
        <div
          key={ticket.id}
          onClick={() => onTicketClick(ticket, report.id || report._id!)}
          className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md hover:border-brand/20 transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-brand/5 transition-colors shrink-0">
              <FileText className="w-6 h-6 text-gray-300 group-hover:text-brand transition-colors" />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-dark group-hover:text-brand transition-colors truncate">
                {ticket.location_name || "Ticket"}
              </h4>
              <div className="flex items-center gap-3 mt-0.5">
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {ticket.date ? format(new Date(ticket.date), "dd MMM yyyy", { locale: dateLocale }) : "---"}
                </p>
                {ticket.expense_type && (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    {ticket.expense_type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <p className="font-bold text-dark text-lg leading-tight">
                {ticket.amount ?? "—"} <span className="text-[10px] text-gray-400">{ticket.currency}</span>
              </p>
              <StatusBadge status={ticket.status} />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-brand group-hover:translate-x-1 transition-all" />
          </div>
        </div>
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
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-dark tracking-tight mb-2 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-brand" />
            Todos los Tickets
          </h1>
          <p className="text-gray-500 font-medium">Listado completo de todos tus tickets de gasto.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
        <input
          type="text"
          placeholder="Buscar por establecimiento, categoria o importe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-dark placeholder-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/30 transition-all"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Cargando tickets...</p>
        </div>
      ) : !reports || reports.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Receipt className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-2xl font-black text-dark mb-3">No hay tickets registrados</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            Sube tickets de gasto desde tus viajes para verlos listados aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {reports.map((report) => (
            <ReportTicketGroup
              key={report.id || report._id}
              report={report}
              onTicketClick={handleTicketClick}
              dateLocale={dateLocale}
              search={search}
            />
          ))}
        </div>
      )}

      <TicketDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        ticket={selectedTicket}
        reportId={selectedReportId}
      />
    </div>
  );
};
