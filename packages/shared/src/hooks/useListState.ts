import { useState, useEffect, useCallback } from "react";
import { PAGE_SIZE } from "../constants/pagination";

/**
 * Manages search input, current page, and client-side pagination for list screens.
 *
 * Usage:
 *   const { search, setSearch, page, setPage, paginate } = useListState();
 *   const filtered = data?.filter(item => item.name.includes(search));
 *   const { paginated, totalPages } = paginate(filtered ?? []);
 */
export const useListState = (pageSize = PAGE_SIZE) => {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);

  // Reset to page 1 whenever the search term changes
  useEffect(() => { setPage(1); }, [search]);

  const paginate = useCallback(
    <T>(items: T[]) => ({
      paginated:  items.slice((page - 1) * pageSize, page * pageSize),
      totalPages: Math.ceil(items.length / pageSize),
    }),
    [page, pageSize],
  );

  return { search, setSearch, page, setPage, paginate };
};
