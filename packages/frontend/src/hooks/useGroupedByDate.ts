import { useMemo } from "react";
import { startOfDay } from "date-fns";

/**
 * Groups an array of items by their `createdAt` date (most recent day first).
 * Generic over any object that has a `createdAt: string` field.
 */
export function useGroupedByDate<T extends { createdAt: string }>(
  items: T[] | undefined,
): { date: Date; items: T[] }[] {
  return useMemo(() => {
    if (!items || items.length === 0) return [];

    const sorted = [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const groupsMap = new Map<string, { date: Date; items: T[] }>();

    sorted.forEach((item) => {
      const day = startOfDay(new Date(item.createdAt));
      const key = day.toISOString();
      if (!groupsMap.has(key)) {
        groupsMap.set(key, { date: day, items: [] });
      }
      groupsMap.get(key)!.items.push(item);
    });

    return Array.from(groupsMap.values());
  }, [items]);
}
