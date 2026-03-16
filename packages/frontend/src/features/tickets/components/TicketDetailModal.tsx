import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { StatusBadge } from "../../../components/ui/StatusBadge";
import { useTicketImageQuery, type ITicket } from "@ticket-registrator/shared";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { MapPin, CreditCard, Tag, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: ITicket | null;
  reportId: string;
}

export const TicketDetailModal = ({ isOpen, onClose, ticket, reportId }: TicketDetailModalProps) => {
  const { t, i18n } = useTranslation();
  const { data: imageData, isLoading: isLoadingImage } = useTicketImageQuery(reportId, ticket?.id || "");

  if (!ticket) return null;

  const dateLocale = i18n.language.startsWith('es') ? es : enUS;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={ticket.location_name || "Detalle del Ticket"}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
            <div className="space-y-1">
                <p className="text-3xl font-bold text-dark">{ticket.amount} <span className="text-sm font-bold text-gray-400">{ticket.currency}</span></p>
                <StatusBadge status={ticket.status} />
            </div>
            <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('reportDetail.date')}</p>
                <p className="text-sm font-semibold text-dark">
                    {ticket.date ? format(new Date(ticket.date), "PPP", { locale: dateLocale }) : "---"}
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('reportDetail.location')}</p>
                        <p className="text-sm font-medium text-dark">{ticket.location_address || "---"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('reportDetail.paymentMethod')}</p>
                        <p className="text-sm font-medium text-dark">{ticket.payment_type || "---"} {ticket.last_four_digits ? `(**** ${ticket.last_four_digits})` : ""}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        <Tag className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('reportDetail.category')}</p>
                        <p className="text-sm font-medium text-dark">{ticket.expense_type || "---"}</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 overflow-hidden flex flex-col items-center justify-center min-h-[200px] border border-gray-100 group relative">
                {isLoadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 text-brand animate-spin" />
                        <p className="text-xs text-gray-400 font-medium">Cargando imagen...</p>
                    </div>
                ) : imageData?.url ? (
                    <>
                        <img
                            src={imageData.url}
                            alt="Ticket"
                            className="max-h-60 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                            onClick={() => window.open(imageData.url, '_blank')}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') window.open(imageData.url, '_blank'); }}
                            role="button"
                            tabIndex={0}
                        />
                        <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                            <a
                                href={imageData.url}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-white text-dark px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                                Ver pantalla completa
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-xs text-gray-400 font-medium">No hay imagen disponible</p>
                    </div>
                )}
            </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{t('reportDetail.items')}</h4>
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {ticket.items && ticket.items.length > 0 ? (
                ticket.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm font-medium text-dark">{item.name}</span>
                    <span className="text-sm font-bold text-brand">{item.amount} {item.currency}</span>
                </div>
                ))
            ) : (
                <p className="text-sm text-gray-400 italic text-center py-2">{t('reportDetail.noItems')}</p>
            )}
            </div>
        </div>

        <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={onClose} className="flex-1">
                {t('common.close')}
            </Button>
        </div>
      </div>
    </Modal>
  );
};
