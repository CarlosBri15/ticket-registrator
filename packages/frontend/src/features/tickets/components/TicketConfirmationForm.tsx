import { useState } from "react";
import { Check, AlertCircle, Cpu, Home, MapPin, Calendar, DollarSign, CreditCard, List } from "lucide-react";
import type { ITicket } from "@ticket-registrator/shared";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

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

const isExtracted = (value: unknown): boolean =>
  value !== null && value !== undefined && value !== "";

const FIELD_META: Record<
  FieldKey,
  { label: string; placeholder: string; icon: React.ElementType; type?: string; step?: string }
> = {
  location_name: { label: "Establecimiento", placeholder: "Nombre del comercio", icon: Home },
  location_address: { label: "Dirección", placeholder: "Dirección completa", icon: MapPin },
  date: { label: "Fecha", placeholder: "", icon: Calendar, type: "date" },
  amount: {
    label: "Importe Total",
    placeholder: "0.00",
    icon: DollarSign,
    type: "number",
    step: "0.01",
  },
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
        return new Date(raw).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* AI Confidence Banner */}
      <div className="flex items-center gap-4 p-4 rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)]">
        <div className="w-10 h-10 rounded-md bg-dark text-white flex items-center justify-center shrink-0">
          <Cpu className="w-5 h-5" aria-hidden={true} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] font-sans-semibold text-dark">
              IA extrajo {extractedKeys.length}/{allKeys.length} campos
            </p>
            <span className="text-[12px] font-sans-bold text-dark tabular-nums">
              {confidencePct}%
            </span>
          </div>
          <div className="h-1.5 bg-dark/8 rounded-full overflow-hidden">
            <div
              className="h-full bg-dark rounded-full transition-all duration-700"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Extracted Fields (read-only) */}
      {extractedKeys.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-success" aria-hidden={true} />
            <p className="text-[11px] font-sans-semibold text-success uppercase tracking-wide">
              Datos extraídos automáticamente
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
            {extractedKeys.map((key) => {
              const Icon = FIELD_META[key].icon;
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-md bg-green-50 border border-green-100 flex items-center justify-center text-success shrink-0">
                    <Icon className="w-3.5 h-3.5" aria-hidden={true} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-sans-medium text-dark/50 uppercase tracking-wide">
                      {FIELD_META[key].label}
                    </p>
                    <p className="text-[14px] font-sans-semibold text-dark truncate mt-0.5 leading-snug">
                      {formatExtractedValue(key)}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-success shrink-0" aria-hidden={true} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Fields (editable) */}
      {missingKeys.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" aria-hidden={true} />
            <p className="text-[11px] font-sans-semibold text-amber-700 uppercase tracking-wide">
              Completa estos campos
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-5">
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
        <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-green-100 bg-green-50/50 text-green-700">
          <Check className="w-4 h-4 shrink-0 mt-0.5" aria-hidden={true} />
          <p className="text-[12px] font-sans-medium leading-relaxed">
            La IA extrajo todos los campos. Revisa la información y confirma.
          </p>
        </div>
      )}

      {/* Items List */}
      {ticket.items && ticket.items.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <List className="w-3.5 h-3.5 text-dark/40" aria-hidden={true} />
            <p className="text-[11px] font-sans-semibold text-dark/50 uppercase tracking-wide">
              Resumen de Items
            </p>
          </div>
          <div className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-surface-card)] max-h-48 overflow-y-auto">
            {ticket.items.map((item, index) => (
              <div
                key={item.id || `${item.name}-${index}`}
                className="flex justify-between items-center px-4 py-3 border-b border-[var(--color-border-main)] last:border-b-0"
              >
                <span className="text-[13px] font-sans-medium text-dark truncate mr-4">
                  {item.name}
                </span>
                <span className="text-[13px] font-sans-bold text-dark shrink-0 tabular-nums">
                  {item.amount}
                  <span className="font-sans-medium text-dark/50 ml-1 text-[11px]">
                    {item.currency}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-[var(--color-border-main)]">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Descartar
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
          leftIcon={<Check className="w-3.5 h-3.5" />}
          className="flex-[1.5]"
        >
          Confirmar Ticket
        </Button>
      </div>
    </form>
  );
};
