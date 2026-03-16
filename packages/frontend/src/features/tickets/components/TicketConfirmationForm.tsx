import { useState } from "react";
import { Check, AlertCircle, Cpu, Home, MapPin, Calendar, DollarSign, CreditCard, Tag, List } from "lucide-react";
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
  | "payment_type"
  | "expense_type";

const isExtracted = (value: any): boolean =>
  value !== null && value !== undefined && value !== "";

const FIELD_META: Record<FieldKey, { label: string; placeholder: string; icon: React.ElementType; type?: string; step?: string }> = {
  location_name:    { label: "Establecimiento",    placeholder: "Nombre del comercio",     icon: Home },
  location_address: { label: "Dirección",           placeholder: "Dirección completa",      icon: MapPin },
  date:             { label: "Fecha",               placeholder: "",                        icon: Calendar, type: "date" },
  amount:           { label: "Importe Total",       placeholder: "0.00",                   icon: DollarSign, type: "number", step: "0.01" },
  currency:         { label: "Moneda",              placeholder: "EUR",                    icon: CreditCard },
  payment_type:     { label: "Método de Pago",      placeholder: "Ej: Tarjeta, Efectivo",  icon: CreditCard },
  expense_type:     { label: "Categoría",           placeholder: "Ej: Comida, Transporte", icon: Tag },
};

export const TicketConfirmationForm = ({
  ticket,
  onConfirm,
  onCancel,
  isLoading,
}: TicketConfirmationFormProps) => {
  const [formData, setFormData] = useState<Record<FieldKey, string>>({
    location_name:    ticket.location_name    || "",
    location_address: ticket.location_address || "",
    date:             ticket.date ? new Date(ticket.date).toISOString().split("T")[0] : "",
    amount:           ticket.amount == null   ? "" : ticket.amount.toString(),
    currency:         ticket.currency         || "",
    payment_type:     ticket.payment_type     || "",
    expense_type:     ticket.expense_type     || "",
  });

  const extracted: Record<FieldKey, boolean> = {
    location_name:    isExtracted(ticket.location_name),
    location_address: isExtracted(ticket.location_address),
    date:             isExtracted(ticket.date),
    amount:           ticket.amount !== null && ticket.amount !== undefined,
    currency:         isExtracted(ticket.currency),
    payment_type:     isExtracted(ticket.payment_type),
    expense_type:     isExtracted(ticket.expense_type),
  };

  const allKeys = Object.keys(extracted) as FieldKey[];
  const extractedKeys = allKeys.filter((k) => extracted[k]);
  const missingKeys   = allKeys.filter((k) => !extracted[k]);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onConfirm({
      location_name:    formData.location_name    || null,
      location_address: formData.location_address || null,
      date:             formData.date             || null,
      amount:           formData.amount ? Number.parseFloat(formData.amount) : null,
      currency:         formData.currency         || null,
      payment_type:     formData.payment_type     || null,
      expense_type:     formData.expense_type     || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* AI Confidence Banner */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand/5 border border-brand/10">
        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand/20">
          <Cpu className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-sm font-bold text-brand">
              IA extrajo {extractedKeys.length}/{allKeys.length} campos
            </p>
            <span className="text-xs font-black text-brand/70">{confidencePct}%</span>
          </div>
          <div className="h-1.5 bg-brand/15 rounded-full overflow-hidden">
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
            <Check className="w-3.5 h-3.5 text-green-600" />
            <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">
              Datos extraídos automáticamente
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {extractedKeys.map((key) => {
              const Icon = FIELD_META[key].icon;
              return (
                <div key={key} className="flex items-center gap-3 px-5 py-3.5">
                  <div className="w-7 h-7 bg-green-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {FIELD_META[key].label}
                    </p>
                    <p className="text-sm font-bold text-dark truncate mt-0.5">
                      {formatExtractedValue(key)}
                    </p>
                  </div>
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-600" />
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
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              Completa estos campos
            </p>
          </div>
          <div className="bg-amber-50/50 rounded-2xl border border-amber-100 p-5">
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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 border border-green-100">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-sm font-semibold text-green-700">
            La IA extrajo todos los campos. Revisa la información y confirma.
          </p>
        </div>
      )}

      {/* Items List */}
      {ticket.items && ticket.items.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <List className="w-3.5 h-3.5 text-gray-400" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Resumen de Items
            </p>
          </div>
          <div className="glass-panel p-4 rounded-2xl">
            <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {ticket.items.map((item, index) => (
                <div
                  key={item.id || `${item.name}-${index}`}
                  className="flex justify-between items-center bg-white/80 p-3 rounded-xl border border-white/50 shadow-sm"
                >
                  <span className="text-sm font-medium text-dark truncate mr-3">{item.name}</span>
                  <span className="text-sm font-bold text-brand shrink-0">
                    {item.amount} {item.currency}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading} className="flex-1">
          Descartar
        </Button>
        <Button type="submit" isLoading={isLoading} className="flex-[2] shadow-xl shadow-brand/20">
          <Check className="w-4 h-4 mr-2" />
          Confirmar Ticket
        </Button>
      </div>
    </form>
  );
};
