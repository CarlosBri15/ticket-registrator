import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { tokens } from "../../styles/theme";

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
      {/* Summary */}
      <p className="text-xs font-medium text-slate-400">
        {t("pagination.showing")} <span className="text-dark">{from}</span>{" "}
        {t("pagination.to")} <span className="text-dark">{to}</span>{" "}
        {t("pagination.of")} <span className="text-dark">{totalItems}</span>{" "}
        {t("pagination.results")}
      </p>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={tokens.paginationBtn}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("pagination.previous")}
        </button>

        {getPages().map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-2 text-slate-300 text-xs font-medium select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`${tokens.paginationPage} ${p === page ? tokens.paginationPageActive : tokens.paginationPageIdle}`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={tokens.paginationBtn}
        >
          {t("pagination.next")}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
