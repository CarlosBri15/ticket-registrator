import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryMixBar } from "./CategoryMixBar";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

const seg = (
  partial: Partial<{
    categoryId: string | null;
    categoryName: string;
    categoryColor: string | null;
    categoryIcon: string | null;
    amount: number;
    percentage: number;
  }> = {},
) => ({
  categoryId: "categoryId" in partial ? (partial.categoryId ?? null) : "c1",
  categoryName: partial.categoryName ?? "Meals",
  categoryColor: "categoryColor" in partial ? (partial.categoryColor ?? null) : "#F5C842",
  categoryIcon: "categoryIcon" in partial ? (partial.categoryIcon ?? null) : null,
  amount: partial.amount ?? 50,
  percentage: partial.percentage ?? 50,
});

describe("CategoryMixBar", () => {
  it("renders nothing when segments is undefined", () => {
    const { container } = render(<CategoryMixBar segments={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when segments is empty", () => {
    const { container } = render(<CategoryMixBar segments={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders one bar segment per entry, sized by percentage", () => {
    const { container } = render(
      <CategoryMixBar segments={[seg({ percentage: 60 }), seg({ categoryId: "c2", categoryName: "Lodging", percentage: 40 })]} />,
    );
    const bars = container.querySelectorAll("[role='img'] > div");
    expect(bars).toHaveLength(2);
    expect((bars[0] as HTMLElement).style.width).toBe("60%");
    expect((bars[1] as HTMLElement).style.width).toBe("40%");
  });

  it("falls back to stone color when categoryColor is null", () => {
    const { container } = render(
      <CategoryMixBar segments={[seg({ categoryColor: null, percentage: 100 })]} />,
    );
    const bar = container.querySelector("[role='img'] > div") as HTMLElement;
    expect(bar.getAttribute("style")).toContain("var(--color-stone-400)");
  });

  it("shows up to maxLegendItems names + overflow counter", () => {
    render(
      <CategoryMixBar
        segments={[
          seg({ categoryId: "a", categoryName: "Meals", percentage: 40 }),
          seg({ categoryId: "b", categoryName: "Lodging", percentage: 30 }),
          seg({ categoryId: "c", categoryName: "Travel", percentage: 20 }),
          seg({ categoryId: "d", categoryName: "Other", percentage: 10 }),
          seg({ categoryId: "e", categoryName: "Misc", percentage: 0 }),
        ]}
        maxLegendItems={2}
      />,
    );
    expect(screen.getByText("Meals")).toBeInTheDocument();
    expect(screen.getByText("Lodging")).toBeInTheDocument();
    expect(screen.queryByText("Travel")).not.toBeInTheDocument();
    expect(screen.getByText(/\+3/)).toBeInTheDocument();
  });

  it("uses unique key for uncategorized segments", () => {
    const { container } = render(
      <CategoryMixBar
        segments={[
          seg({ categoryId: null, categoryName: "Uncategorized", categoryColor: null, percentage: 50 }),
          seg({ percentage: 50 }),
        ]}
      />,
    );
    expect(container.querySelectorAll("[role='img'] > div")).toHaveLength(2);
  });
});
