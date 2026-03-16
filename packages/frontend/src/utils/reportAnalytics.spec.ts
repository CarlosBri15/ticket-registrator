import { describe, it, expect } from "vitest";
import {
  getMonthlyExpenses,
  getExpensesByType,
  getStatusCounts,
  filterBySearch,
  filterByStatus,
  filterByDateRange,
} from "./reportAnalytics";
import type { IReport } from "@ticket-registrator/shared";

// ---- Helpers ----

const makeReport = (overrides: Partial<IReport>): IReport => ({
  id: "r1",
  user_id: "u1",
  name: "Test Report",
  start_date: "2025-01-01",
  end_date: "2025-01-31",
  currency: "EUR",
  type: "Business Trip",
  requested_amount: 100,
  approved_amount: 0,
  status: "Created" as any,
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
  ...overrides,
});

// ---- getMonthlyExpenses ----

describe("getMonthlyExpenses", () => {
  it("returns empty array for empty input", () => {
    expect(getMonthlyExpenses([])).toEqual([]);
  });

  it("groups reports by month and sums amounts", () => {
    const reports = [
      makeReport({ id: "r1", end_date: "2025-01-15", requested_amount: 100 }),
      makeReport({ id: "r2", end_date: "2025-01-28", requested_amount: 50 }),
      makeReport({ id: "r3", end_date: "2025-02-10", requested_amount: 200 }),
    ];

    const result = getMonthlyExpenses(reports);

    expect(result).toHaveLength(2);
    const jan = result.find((r) => r.monthKey === "2025-01");
    const feb = result.find((r) => r.monthKey === "2025-02");

    expect(jan?.amount).toBe(150);
    expect(jan?.count).toBe(2);
    expect(feb?.amount).toBe(200);
    expect(feb?.count).toBe(1);
  });

  it("sorts oldest month first", () => {
    const reports = [
      makeReport({ id: "r1", end_date: "2025-03-01", requested_amount: 300 }),
      makeReport({ id: "r2", end_date: "2025-01-01", requested_amount: 100 }),
      makeReport({ id: "r3", end_date: "2025-02-01", requested_amount: 200 }),
    ];

    const result = getMonthlyExpenses(reports);
    expect(result.map((r) => r.monthKey)).toEqual(["2025-01", "2025-02", "2025-03"]);
  });

  it("respects maxMonths parameter and returns last N months", () => {
    const reports = [
      makeReport({ id: "r1", end_date: "2024-10-01", requested_amount: 10 }),
      makeReport({ id: "r2", end_date: "2024-11-01", requested_amount: 20 }),
      makeReport({ id: "r3", end_date: "2024-12-01", requested_amount: 30 }),
      makeReport({ id: "r4", end_date: "2025-01-01", requested_amount: 40 }),
    ];

    const result = getMonthlyExpenses(reports, 2);
    expect(result).toHaveLength(2);
    expect(result[0].monthKey).toBe("2024-12");
    expect(result[1].monthKey).toBe("2025-01");
  });

  it("skips reports without end_date", () => {
    const reports = [
      makeReport({ id: "r1", end_date: "", requested_amount: 100 }),
      makeReport({ id: "r2", end_date: "2025-01-01", requested_amount: 50 }),
    ];

    const result = getMonthlyExpenses(reports);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(50);
  });

  it("treats missing requested_amount as 0", () => {
    const reports = [
      makeReport({ id: "r1", end_date: "2025-01-01", requested_amount: undefined as any }),
    ];

    const result = getMonthlyExpenses(reports);
    expect(result[0].amount).toBe(0);
  });
});

// ---- getExpensesByType ----

describe("getExpensesByType", () => {
  it("returns empty array for empty input", () => {
    expect(getExpensesByType([])).toEqual([]);
  });

  it("groups reports by type and sums amounts", () => {
    const reports = [
      makeReport({ id: "r1", type: "Business Trip", requested_amount: 300 }),
      makeReport({ id: "r2", type: "Training", requested_amount: 100 }),
      makeReport({ id: "r3", type: "Business Trip", requested_amount: 200 }),
    ];

    const result = getExpensesByType(reports);
    const bt = result.find((r) => r.type === "Business Trip");
    const tr = result.find((r) => r.type === "Training");

    expect(bt?.amount).toBe(500);
    expect(bt?.count).toBe(2);
    expect(tr?.amount).toBe(100);
    expect(tr?.count).toBe(1);
  });

  it("sorts by amount descending", () => {
    const reports = [
      makeReport({ id: "r1", type: "Training", requested_amount: 100 }),
      makeReport({ id: "r2", type: "Business Trip", requested_amount: 500 }),
      makeReport({ id: "r3", type: "Conference", requested_amount: 300 }),
    ];

    const result = getExpensesByType(reports);
    expect(result.map((r) => r.type)).toEqual(["Business Trip", "Conference", "Training"]);
  });

  it("groups reports with empty type under otherLabel", () => {
    const reports = [
      makeReport({ id: "r1", type: "", requested_amount: 50 }),
      makeReport({ id: "r2", type: undefined as any, requested_amount: 75 }),
    ];

    const result = getExpensesByType(reports, "Other");
    expect(result).toHaveLength(1);
    expect(result[0].type).toBe("Other");
    expect(result[0].amount).toBe(125);
  });

  it("trims whitespace from type", () => {
    const reports = [
      makeReport({ id: "r1", type: "  Training  ", requested_amount: 100 }),
      makeReport({ id: "r2", type: "Training", requested_amount: 200 }),
    ];

    const result = getExpensesByType(reports);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(300);
  });
});

// ---- getStatusCounts ----

describe("getStatusCounts", () => {
  it("returns empty array for empty input", () => {
    expect(getStatusCounts([])).toEqual([]);
  });

  it("counts reports by status", () => {
    const reports = [
      makeReport({ id: "r1", status: "Approved" as any }),
      makeReport({ id: "r2", status: "Approved" as any }),
      makeReport({ id: "r3", status: "Submitted" as any }),
      makeReport({ id: "r4", status: "Created" as any }),
    ];

    const result = getStatusCounts(reports);
    const approved = result.find((r) => r.status === "Approved");
    const submitted = result.find((r) => r.status === "Submitted");
    const created = result.find((r) => r.status === "Created");

    expect(approved?.count).toBe(2);
    expect(submitted?.count).toBe(1);
    expect(created?.count).toBe(1);
  });

  it("sorts by count descending", () => {
    const reports = [
      makeReport({ id: "r1", status: "Created" as any }),
      makeReport({ id: "r2", status: "Approved" as any }),
      makeReport({ id: "r3", status: "Approved" as any }),
      makeReport({ id: "r4", status: "Approved" as any }),
    ];

    const result = getStatusCounts(reports);
    expect(result[0].status).toBe("Approved");
    expect(result[0].count).toBe(3);
  });
});

// ---- filterBySearch ----

describe("filterBySearch", () => {
  const reports = [
    makeReport({ id: "r1", name: "Madrid Conference 2025" }),
    makeReport({ id: "r2", name: "Berlin Training" }),
    makeReport({ id: "r3", name: "Paris Client Visit" }),
  ];

  it("returns all reports for empty query", () => {
    expect(filterBySearch(reports, "")).toHaveLength(3);
    expect(filterBySearch(reports, "   ")).toHaveLength(3);
  });

  it("filters by name case-insensitively", () => {
    expect(filterBySearch(reports, "madrid")).toHaveLength(1);
    expect(filterBySearch(reports, "BERLIN")).toHaveLength(1);
    expect(filterBySearch(reports, "Paris")).toHaveLength(1);
  });

  it("returns multiple matches for partial query", () => {
    // "a" matches Madrid, Training, Paris
    expect(filterBySearch(reports, "a")).toHaveLength(3);
  });

  it("returns empty array when no match", () => {
    expect(filterBySearch(reports, "Tokyo")).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterBySearch([], "madrid")).toHaveLength(0);
  });
});

// ---- filterByStatus ----

describe("filterByStatus", () => {
  const reports = [
    makeReport({ id: "r1", status: "Created" as any }),
    makeReport({ id: "r2", status: "Submitted" as any }),
    makeReport({ id: "r3", status: "Approved" as any }),
    makeReport({ id: "r4", status: "Approved" as any }),
  ];

  it("returns all reports when status is ALL", () => {
    expect(filterByStatus(reports, "ALL")).toHaveLength(4);
  });

  it("returns all reports when status is empty string", () => {
    expect(filterByStatus(reports, "")).toHaveLength(4);
  });

  it("filters by status case-insensitively", () => {
    expect(filterByStatus(reports, "approved")).toHaveLength(2);
    expect(filterByStatus(reports, "APPROVED")).toHaveLength(2);
    expect(filterByStatus(reports, "Submitted")).toHaveLength(1);
    expect(filterByStatus(reports, "Created")).toHaveLength(1);
  });

  it("returns empty array when no match", () => {
    expect(filterByStatus(reports, "Declined")).toHaveLength(0);
  });
});

// ---- filterByDateRange ----

describe("filterByDateRange", () => {
  const reports = [
    makeReport({ id: "r1", end_date: "2025-01-15" }),
    makeReport({ id: "r2", end_date: "2025-03-10" }),
    makeReport({ id: "r3", end_date: "2025-06-20" }),
    makeReport({ id: "r4", end_date: "2025-12-01" }),
  ];

  it("returns all when both from and to are null", () => {
    expect(filterByDateRange(reports, null, null)).toHaveLength(4);
  });

  it("filters by from date (inclusive)", () => {
    const result = filterByDateRange(reports, "2025-03-10", null);
    expect(result.map((r) => r.id)).toEqual(["r2", "r3", "r4"]);
  });

  it("filters by to date (inclusive)", () => {
    const result = filterByDateRange(reports, null, "2025-03-10");
    expect(result.map((r) => r.id)).toEqual(["r1", "r2"]);
  });

  it("filters by both from and to dates", () => {
    const result = filterByDateRange(reports, "2025-03-01", "2025-06-30");
    expect(result.map((r) => r.id)).toEqual(["r2", "r3"]);
  });

  it("returns empty when no reports fall in range", () => {
    expect(filterByDateRange(reports, "2026-01-01", "2026-12-31")).toHaveLength(0);
  });

  it("includes reports without end_date", () => {
    const reportsWithNull = [
      makeReport({ id: "r1", end_date: "" }),
      makeReport({ id: "r2", end_date: "2025-01-15" }),
    ];
    const result = filterByDateRange(reportsWithNull, "2025-01-01", "2025-12-31");
    // r1 (no date) always passes; r2 falls in range
    expect(result).toHaveLength(2);
  });

  it("excludes reports before from date", () => {
    const result = filterByDateRange(reports, "2025-06-01", null);
    expect(result.map((r) => r.id)).toEqual(["r3", "r4"]);
  });

  it("excludes reports after to date", () => {
    const result = filterByDateRange(reports, null, "2025-01-31");
    expect(result.map((r) => r.id)).toEqual(["r1"]);
  });
});
