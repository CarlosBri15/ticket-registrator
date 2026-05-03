import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key.replace("status.", ""),
  }),
}));

describe("StatusBadge", () => {
  const STATUSES = ["CREATED", "DRAFT", "PENDING", "SUBMITTED", "APPROVED", "REJECTED", "PAID", "DECLINED"];

  it.each(STATUSES)("renders %s status text", (status) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(status)).toBeInTheDocument();
  });

  it("is case-insensitive (lowercase input)", () => {
    render(<StatusBadge status="approved" />);
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
  });

  it("falls back to st-draft for unknown status", () => {
    const { container } = render(<StatusBadge status="UNKNOWN_STATUS" />);
    expect(container.querySelector("span")?.className).toContain("st-draft");
    expect(screen.getByText("UNKNOWN_STATUS")).toBeInTheDocument();
  });

  it.each([
    ["DRAFT",     "st-draft"],
    ["CREATED",   "st-created"],
    ["PENDING",   "st-pending"],
    ["SUBMITTED", "st-submitted"],
    ["APPROVED",  "st-approved"],
    ["PAID",      "st-paid"],
    ["REJECTED",  "st-rejected"],
    ["DECLINED",  "st-declined"],
  ])("maps %s → .%s", (status, expectedClass) => {
    const { container } = render(<StatusBadge status={status} />);
    expect(container.querySelector("span")?.className).toContain(expectedClass);
  });

  it("always applies the kit .status base class", () => {
    const { container } = render(<StatusBadge status="APPROVED" />);
    expect(container.querySelector("span")?.className).toContain("status");
  });

  it("renders an inline icon (SVG) before the text", () => {
    const { container } = render(<StatusBadge status="APPROVED" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders without pulse animation", () => {
    const { container } = render(<StatusBadge status="PENDING" />);
    expect(container.querySelector(".animate-ping")).not.toBeInTheDocument();
  });
});
