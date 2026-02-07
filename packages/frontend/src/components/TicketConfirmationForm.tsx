import { useState } from "react";
import { Check, X } from "lucide-react";
import type { ITicket } from "@ticket-registrator/shared";
import { Input } from "./Input";
import { Button } from "./Button";

interface TicketConfirmationFormProps {
  ticket: ITicket;
  onConfirm: (updatedTicket: Partial<ITicket>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const TicketConfirmationForm = ({ 
  ticket, 
  onConfirm, 
  onCancel,
  isLoading 
}: TicketConfirmationFormProps) => {
  const [formData, setFormData] = useState({
    location_name: ticket.location_name || "",
    location_address: ticket.location_address || "",
    date: ticket.date ? new Date(ticket.date).toISOString().split('T')[0] : "",
    amount: ticket.amount || 0,
    currency: ticket.currency || "EUR",
    payment_type: ticket.payment_type || "",
    expense_type: ticket.expense_type || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Establecimiento"
            name="location_name"
            value={formData.location_name}
            onChange={handleChange}
            placeholder="Nombre del comercio"
            required
            autoFocus
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Dirección"
            name="location_address"
            value={formData.location_address}
            onChange={handleChange}
            placeholder="Dirección completa"
          />
        </div>

        <Input
          label="Fecha"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <Input
          label="Importe Total"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={handleChange}
          required
        />

        <Input
          label="Moneda"
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          required
        />

        <Input
          label="Método de Pago"
          name="payment_type"
          value={formData.payment_type}
          onChange={handleChange}
          placeholder="Ej: Card, Cash"
        />

        <Input
          label="Categoría"
          name="expense_type"
          value={formData.expense_type}
          onChange={handleChange}
          placeholder="Ej: Food, Transport"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Resumen de Items</h4>
        <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {ticket.items && ticket.items.length > 0 ? (
            ticket.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-sm font-medium text-dark">{item.name}</span>
                <span className="text-sm font-bold text-brand">{item.amount} {item.currency}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic text-center py-2">No se extrajeron items individuales</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          Descartar
        </Button>
        <Button 
          type="submit" 
          isLoading={isLoading}
          className="flex-1 shadow-xl shadow-brand/20"
        >
          <Check className="w-4 h-4 mr-2" />
          Confirmar Ticket
        </Button>
      </div>
    </form>
  );
};
