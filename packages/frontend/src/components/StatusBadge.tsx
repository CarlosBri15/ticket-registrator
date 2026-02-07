import { useTranslation } from "react-i18next";

interface StatusBadgeProps {
  status: string;
}

const styles: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-600 border-gray-200",
  DRAFT: "bg-gray-100 text-gray-600 border-gray-200",
  PENDING: "bg-blue-50 text-brand border-blue-100",
  SUBMITTED: "bg-blue-50 text-brand border-blue-100",
  APPROVED: "bg-green-50 text-green-700 border-green-100",
  REJECTED: "bg-red-50 text-accent border-red-100",
  PAID: "bg-secondary/20 text-brand-hover border-secondary/30",
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const { t } = useTranslation();
  const normalizedStatus = status.toUpperCase();
  
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[normalizedStatus] || styles.DRAFT}`}>
      {t(`status.${normalizedStatus}`)}
    </span>
  );
};