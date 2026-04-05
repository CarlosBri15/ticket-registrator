import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const getPages = (): (number | "ellipsis-start" | "ellipsis-end")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "ellipsis-start" | "ellipsis-end")[] = [1];
    if (page > 3) pages.push("ellipsis-start");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("ellipsis-end");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">

      {/* Resumen */}
      <p className="font-space text-dark/40" style={{ fontSize: 12 }}>
        <span className="font-space-semibold text-dark/60">{from}–{to}</span>
        {" "}de{" "}
        <span className="font-space-semibold text-dark/60">{totalItems}</span>
        {" "}resultados
      </p>

      {/* Controles */}
      <div className="flex items-center gap-1">

        {/* Anterior */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-space-bold text-dark/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark/5 hover:text-dark transition-colors duration-100"
          style={{ fontSize: 12 }}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("pagination.previous")}
        </button>

        {/* Páginas */}
        <div className="flex items-center gap-1">
          {getPages().map((p) =>
            typeof p === "string" ? (
              <span
                key={p}
                className="w-8 text-center font-space-bold text-dark/25 select-none"
                style={{ fontSize: 12 }}
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className="w-8 h-8 rounded-full font-space-bold transition-colors duration-100"
                style={{
                  fontSize: 12,
                  backgroundColor: p === page ? 'var(--color-brand)' : 'transparent',
                  color: p === page ? '#fff' : 'rgba(26,26,26,0.45)',
                }}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Siguiente */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full font-space-bold text-dark/50 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-dark/5 hover:text-dark transition-colors duration-100"
          style={{ fontSize: 12 }}
        >
          {t("pagination.next")}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
