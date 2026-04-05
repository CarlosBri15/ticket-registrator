import { useState } from "react";
import { Check, AlertCircle, Cpu, Home, MapPin, Calendar, DollarSign, CreditCard, List } from "lucide-react";
import type { ITicket } from "@ticket-registrator/shared";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { tokens, radius } from "../../../styles/theme";

interface TicketConfirmationFormProps {
  ticket: ITicket;
  onConfirm: (updatedTicket: Partial<ITicket>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FieldKey =
  | "location_name"
  | "location_address"
  | "date"
  | "amount"
  | "currency"
  | "payment_type";

const isExtracted = (value: any): boolean =>
  value !== null && value !== undefined && value !== "";

const FIELD_META: Record<FieldKey, { label: string; placeholder: string; icon: React.ElementType; type?: string; step?: string }> = {
  location_name: { label: "Establecimiento", placeholder: "Nombre del comercio", icon: Home },
  location_address: { label: "Dirección", placeholder: "Dirección completa", icon: MapPin },
  date: { label: "Fecha", placeholder: "", icon: Calendar, type: "date" },
  amount: { label: "Importe Total", placeholder: "0.00", icon: DollarSign, type: "number", step: "0.01" },
  currency: { label: "Moneda", placeholder: "EUR", icon: CreditCard },
  payment_type: { label: "Método de Pago", placeholder: "Ej: Tarjeta, Efectivo", icon: CreditCard },
};

export const TicketConfirmationForm = ({
  ticket,
  onConfirm,
  onCancel,
  isLoading,
}: TicketConfirmationFormProps) => {
  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    location_name: ticket.location_name || "",
    location_address: ticket.location_address || "",
    date: ticket.date ? new Date(ticket.date).toISOString().split("T")[0] : "",
    amount: ticket.amount == null ? "" : ticket.amount.toString(),
    currency: ticket.currency || "",
    payment_type: ticket.payment_type || "",
  });

  const extracted: Record<FieldKey, boolean> = {
    location_name: isExtracted(ticket.location_name),
    location_address: isExtracted(ticket.location_address),
    date: isExtracted(ticket.date),
    amount: ticket.amount !== null && ticket.amount !== undefined,
    currency: isExtracted(ticket.currency),
    payment_type: isExtracted(ticket.payment_type),
  };

  const allKeys = Object.keys(extracted) as FieldKey[];
  const extractedKeys = allKeys.filter((k) => extracted[k]);
  const missingKeys = allKeys.filter((k) => !extracted[k]);
  const confidencePct = Math.round((extractedKeys.length / allKeys.length) * 100);

  const formatExtractedValue = (key: FieldKey): string => {
    const raw = formData[key];
    if (!raw) return "—";
    if (key === "date") {
      try {
        return new Date(raw).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
      } catch {
        return raw;
      }
    }
    if (key === "amount") {
      const n = Number.parseFloat(raw);
      return Number.isNaN(n) ? raw : `${n.toFixed(2)} ${formData.currency || ""}`;
    }
    return raw;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as FieldKey]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onConfirm({
      location_name: formData.location_name || null,
      location_address: formData.location_address || null,
      date: formData.date || null,
      amount: formData.amount ? Number.parseFloat(formData.amount) : null,
      currency: formData.currency || null,
      payment_type: formData.payment_type || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* AI Confidence Banner */}
      <div className={`flex items-center gap-5 p-5 ${radius.card} bg-brand/5 border-2 border-border-main shadow-hard-sm`}>
        <div className={`w-12 h-12 bg-brand border-2 border-border-main rounded-xl flex items-center justify-center shrink-0 shadow-hard-sm`}>
          <Cpu className="w-6 h-6 text-surface-card" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-space-bold text-brand uppercase tracking-wider">
              IA extrajo {extractedKeys.length}/{allKeys.length} campos
            </p>
            <span className="text-sm font-space-bold text-brand">{confidencePct}%</span>
          </div>
          <div className="h-2.5 bg-brand/10 border border-brand/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-700"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Extracted Fields (read-only) */}
      {extractedKeys.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-3.5 h-3.5 text-success" />
            <p className="text-[10px] font-semibold text-success uppercase tracking-widest">
              Datos extraídos automáticamente
            </p>
          </div>
          <div className={`${tokens.listSection} divide-y divide-dark/5`}>
            {extractedKeys.map((key) => {
              const Icon = FIELD_META[key].icon;
              return (
                <div key={key} className="flex items-center gap-4 px-6 py-4">
                  <div className={`w-9 h-9 bg-success/5 border-2 border-success/20 rounded-xl flex items-center justify-center shrink-0 shadow-hard-sm`}>
                    <Icon className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={tokens.statCardLabel}>{FIELD_META[key].label}</p>
                    <p className="text-sm font-space-bold text-dark truncate mt-0.5" style={{ fontSize: 14 }}>
                      {formatExtractedValue(key)}
                    </p>
                  </div>
                  <div className="w-6 h-6 bg-success/15 border border-success/30 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 text-success" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Fields (editable) */}
      {missingKeys.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-3.5 h-3.5 text-warning" />
            <p className="text-[10px] font-space-bold text-warning uppercase tracking-widest">
              Completa estos campos
            </p>
          </div>
          <div className={`bg-warning/5 ${radius.card} border-2 border-warning/20 p-6 shadow-hard-sm`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingKeys.map((key) => {
                const meta = FIELD_META[key];
                const isFullWidth = key === "location_name" || key === "location_address";
                return (
                  <div key={key} className={isFullWidth ? "md:col-span-2" : ""}>
                    <Input
                      label={`${meta.label} *`}
                      name={key}
                      type={meta.type || "text"}
                      step={meta.step}
                      value={formData[key]}
                      onChange={handleChange}
                      placeholder={meta.placeholder}
                      autoFocus={missingKeys[0] === key}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* All fields extracted */}
      {missingKeys.length === 0 && (
        <div className={`${tokens.alert} ${tokens.alertSuccess}`}>
          <Check className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">
            La IA extrajo todos los campos. Revisa la información y confirma.
          </p>
        </div>
      )}

      {/* Items List */}
      {ticket.items && ticket.items.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <List className="w-3.5 h-3.5 text-slate-400" />
            <p className={tokens.listSectionTitle}>Resumen de Items</p>
          </div>
          <div className={`bg-surface border-2 border-border-main ${radius.card} p-5 shadow-hard-sm`}>
            <div className="max-h-48 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {ticket.items.map((item, index) => (
                <div
                  key={item.id || `${item.name}-${index}`}
                  className={`flex justify-between items-center bg-[var(--color-surface-card)] p-4 ${radius.sm} border-2 border-border-main shadow-hard-sm`}
                >
                  <span className="text-sm font-space-bold text-dark truncate mr-4">{item.name}</span>
                  <span className="text-sm font-space-bold text-brand shrink-0">
                    {item.amount} {item.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-6 border-t-2 border-border-main/10">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading} className="flex-1">
          Descartar
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-[1.5]">
          <Check className="w-4 h-4 mr-2" />
          Confirmar Ticket
        </Button>
      </div>
    </form>
  );
};
