import { buildCategoryMixFromItems } from "./categoryMix";
import type { IItem } from "../interfaces/tickets/item.interface";
import { ItemStatus } from "../statuses/item-status";

const item = (overrides: Partial<IItem> = {}): IItem => ({
    id: overrides.id ?? "i-1",
    name: overrides.name ?? "X",
    amount: overrides.amount ?? 0,
    currency: overrides.currency ?? "EUR",
    status: overrides.status ?? ItemStatus.PENDING,
    categoryId: overrides.categoryId ?? null,
    categoryName: overrides.categoryName ?? null,
    categoryColor: overrides.categoryColor ?? null,
});

describe("buildCategoryMixFromItems", () => {
    it("returns empty when items is undefined", () => {
        expect(buildCategoryMixFromItems(undefined)).toEqual([]);
    });

    it("returns empty when items is empty", () => {
        expect(buildCategoryMixFromItems([])).toEqual([]);
    });

    it("returns empty when every item has zero or null amount", () => {
        const items = [
            item({ categoryId: "c1", amount: 0 }),
            item({ categoryId: "c2", amount: null }),
        ];
        expect(buildCategoryMixFromItems(items)).toEqual([]);
    });

    it("groups items by categoryId, sorts desc, computes percentage", () => {
        const items = [
            item({ id: "a", categoryId: "c1", categoryName: "Meals", categoryColor: "#F5C842", amount: 30 }),
            item({ id: "b", categoryId: "c2", categoryName: "Lodging", categoryColor: "#8A5E89", amount: 70 }),
            item({ id: "c", categoryId: "c1", categoryName: "Meals", categoryColor: "#F5C842", amount: 20 }),
        ];
        expect(buildCategoryMixFromItems(items)).toEqual([
            { categoryId: "c2", categoryName: "Lodging", categoryColor: "#8A5E89", amount: 70, percentage: 58.3 },
            { categoryId: "c1", categoryName: "Meals", categoryColor: "#F5C842", amount: 50, percentage: 41.7 },
        ]);
    });

    it("collects items without category under the uncategorized label", () => {
        const items = [
            item({ id: "a", categoryId: null, categoryName: null, amount: 40 }),
            item({ id: "b", categoryId: "c1", categoryName: "Meals", categoryColor: "#F5C842", amount: 60 }),
        ];
        expect(buildCategoryMixFromItems(items, "Sin categoria")).toEqual([
            { categoryId: "c1", categoryName: "Meals", categoryColor: "#F5C842", amount: 60, percentage: 60 },
            { categoryId: null, categoryName: "Sin categoria", categoryColor: null, amount: 40, percentage: 40 },
        ]);
    });

    it("falls back to default uncategorized label when not provided", () => {
        const items = [item({ categoryId: null, categoryName: null, amount: 10 })];
        expect(buildCategoryMixFromItems(items)).toEqual([
            { categoryId: null, categoryName: "Uncategorized", categoryColor: null, amount: 10, percentage: 100 },
        ]);
    });

    it("ignores negative amounts (skips them, no contribution)", () => {
        const items = [
            item({ id: "a", categoryId: "c1", categoryName: "Meals", amount: -5 }),
            item({ id: "b", categoryId: "c2", categoryName: "Lodging", amount: 100 }),
        ];
        const mix = buildCategoryMixFromItems(items);
        expect(mix).toHaveLength(1);
        expect(mix[0].percentage).toBe(100);
    });
});
