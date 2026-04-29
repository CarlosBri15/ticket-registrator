/**
 * StatusBadge — Web version.
 *
 * Pill sin dot. Colores cálidos/muted que encajan con el estilo
 * blanco-crema-grafito. Las definiciones de color son web-only;
 * mobile mantiene su propio sistema en shared/statusColors.
 */
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

// Paleta warm-muted para el web. No tocar shared/statusColors (mobile).
const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  DRAFT:     { bg: '#F2F0ED', color: '#6B6560' },
  CREATED:   { bg: '#EEEDF8', color: '#4A47A0' },
  PENDING:   { bg: '#FEF9EC', color: '#8A5C0A' },
  SUBMITTED: { bg: '#FEF3E8', color: '#8A4810' },
  APPROVED:  { bg: '#EDFAF3', color: '#1A6A40' },
  PAID:      { bg: '#E8FAF0', color: '#1A6040' },
  REJECTED:  { bg: '#FDF0EF', color: '#A03A3A' },
  DECLINED:  { bg: '#FDF0EF', color: '#A03A3A' },
};

const FALLBACK = STATUS_STYLES.DRAFT;

export const StatusBadge = ({ status, size = 'sm' }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const key    = status.toUpperCase();
  const style  = STATUS_STYLES[key] ?? FALLBACK;

  return (
    <span
      className="inline-flex items-center font-sans-medium whitespace-nowrap rounded-md"
      style={{
        backgroundColor: style.bg,
        color:           style.color,
        fontSize:        size === 'sm' ? 11 : 12,
        padding:         size === 'sm' ? '2px 7px' : '3px 8px',
      }}
    >
      {t(`status.${key}`, { defaultValue: key })}
    </span>
  );
};
