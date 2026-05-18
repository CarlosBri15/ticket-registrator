import type { IItem } from "../interfaces/tickets/item.interface";
import type { IReportCategoryMix } from "../interfaces/reports/report-category-mix.interface";

const UNCATEGORIZED_KEY = "__uncategorized__";

export const buildCategoryMixFromItems = (
    items: IItem[] | undefined,
    uncategorizedLabel = "Uncategorized",
): IReportCategoryMix[] => {
    if (!items || items.length === 0) return [];

    type Bucket = {
        categoryId: string | null;
        categoryName: string;
        categoryColor: string | null;
        categoryIcon: string | null;
        amount: number;
    };

    const buckets = new Map<string, Bucket>();
    let total = 0;

    for (const item of items) {
        const amount = item.amount ?? 0;
        if (amount <= 0) continue;
        total += amount;

        const key = item.categoryId ?? UNCATEGORIZED_KEY;
        const existing = buckets.get(key);
        if (existing) {
            existing.amount += amount;
            continue;
        }

        buckets.set(key, {
            categoryId: item.categoryId ?? null,
            categoryName: item.categoryName ?? uncategorizedLabel,
            categoryColor: item.categoryColor ?? null,
            categoryIcon: item.categoryIcon ?? null,
            amount,
        });
    }

    if (total === 0) return [];

    return Array.from(buckets.values())
        .sort((a, b) => b.amount - a.amount)
        .map((b) => ({
            ...b,
            percentage: Math.round((b.amount / total) * 1000) / 10,
        }));
};
