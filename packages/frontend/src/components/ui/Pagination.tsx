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

  // Build page number array with ellipsis logic (show at most 5 page buttons)
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
      <p className="text-xs font-bold text-gray-400">
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
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-black text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          {t("pagination.previous")}
        </button>

        {getPages().map((p) =>
          typeof p === "string" ? (
            <span key={p} className="px-2 text-gray-300 text-xs font-bold select-none">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${p === page
                  ? "bg-brand text-white shadow-sm shadow-brand/20"
                  : "border border-gray-100 text-gray-400 hover:border-brand/30 hover:text-brand hover:bg-brand/5"
                }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-100 text-xs font-black text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:border-brand/30 hover:text-brand hover:bg-brand/5 transition-all"
        >
          {t("pagination.next")}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
