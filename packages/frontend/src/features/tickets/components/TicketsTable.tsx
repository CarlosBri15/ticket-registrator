/**
 * TicketsTable — Tabla de tickets dentro de un reporte.
 *
 * Columnas:
 *   - Fecha de subida (createdAt)
 *   - Fecha del ticket (date)
 *   - Comercio (location_name)
 *   - Dirección (location_address)
 *   - Dinero (amount + currency)
 *   - Tipo de pago (payment_type)
 */

import { format, type Locale } from 'date-fns';
import { CreditCard, Banknote } from 'lucide-react';
import { DataTable, type ColumnDef } from '../../../components/ui/DataTable';
import { type ITicket } from '@ticket-registrator/shared';
import { useDateLocale } from '../../../hooks/useDateLocale';
import { BRAND, DARK } from '../../reports/constants';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (value: string | null | undefined, locale: Locale) => {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd MMM yyyy', { locale });
  } catch {
    return '—';
  }
};

const AmountCell = ({ amount, currency }: { amount: number | null; currency: string | null }) => {
  if (amount == null) return <span className="text-dark/30">—</span>;
  return (
    <span className="font-space-bold tabular-nums text-dark">
      {amount.toLocaleString()}
      {currency && (
        <span className="ml-1 text-[10px] font-space text-dark/40">{currency}</span>
      )}
    </span>
  );
};

const PaymentTypeCell = ({ value }: { value: string | null }) => {
  if (!value) return <span className="text-dark/30">—</span>;

  const isCard = value.toLowerCase().includes('card') || value.toLowerCase().includes('tarjeta');
  const Icon = isCard ? CreditCard : Banknote;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-border-main text-[10px] font-space-bold"
      style={{
        backgroundColor: `${BRAND}12`,
        color: BRAND,
        borderColor: `${BRAND}40`,
        boxShadow: `2px 2px 0px ${BRAND}25`,
      }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {value}
    </span>
  );
};

const LocationCell = ({ name }: { name: string | null }) => {
  if (!name) return <span className="text-dark/30">—</span>;
  return (
    <span className="font-space-semibold text-dark truncate max-w-[180px] block">
      {name}
    </span>
  );
};

const AddressCell = ({ address }: { address: string | null }) => {
  if (!address) return <span className="text-dark/30">—</span>;
  return (
    <span
      className="truncate max-w-[200px] block"
      style={{ color: `${DARK}70` }}
      title={address}
    >
      {address}
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TicketsTableProps {
  tickets: ITicket[];
  isLoading?: boolean;
  onTicketClick?: (ticket: ITicket) => void;
}

export const TicketsTable = ({ tickets, isLoading, onTicketClick }: TicketsTableProps) => {
  const dateLocale = useDateLocale();

  const columns: ColumnDef<ITicket>[] = [
    {
      key: 'createdAt',
      header: 'Fecha de subida',
      render: (row) => (
        <span className="text-[12px] text-dark/60 font-space whitespace-nowrap">
          {formatDate(row.createdAt, dateLocale)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Fecha ticket',
      render: (row) => (
        <span className="text-[12px] font-space-semibold text-dark whitespace-nowrap">
          {formatDate(row.date, dateLocale)}
        </span>
      ),
    },
    {
      key: 'location_name',
      header: 'Comercio',
      render: (row) => <LocationCell name={row.location_name} />,
    },
    {
      key: 'location_address',
      header: 'Dirección',
      render: (row) => <AddressCell address={row.location_address} />,
    },
    {
      key: 'amount',
      header: 'Importe',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (row) => <AmountCell amount={row.amount} currency={row.currency} />,
    },
    {
      key: 'payment_type',
      header: 'Tipo de pago',
      render: (row) => <PaymentTypeCell value={row.payment_type} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={tickets}
      rowKey={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="Este reporte no tiene tickets aún."
      onRowClick={onTicketClick}
    />
  );
};
