import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "./Pagination";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "pagination.previous": "Previous",
        "pagination.next": "Next",
        "pagination.showing": "Showing",
        "pagination.to": "to",
        "pagination.of": "of",
        "pagination.results": "results",
      };
      return map[key] ?? key;
    },
  }),
}));

const defaultProps = {
  page: 1,
  totalPages: 5,
  totalItems: 50,
  pageSize: 10,
  onPageChange: vi.fn(),
};

describe("Pagination", () => {
  it("renders null when totalPages <= 1", () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} totalItems={8} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders null when totalPages is 0", () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={0} totalItems={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders summary text with correct from/to/total", () => {
    render(<Pagination {...defaultProps} page={2} totalItems={50} pageSize={10} />);
    // Range and total are rendered as "11–20" and "50" in spans
    expect(screen.getByText("11–20")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("computes correct 'to' on last page with fewer items", () => {
    render(<Pagination {...defaultProps} page={5} totalPages={5} totalItems={48} pageSize={10} />);
    // page 5: from=41, to=min(50,48)=48 — rendered as "41–48"
    expect(screen.getByText("41–48")).toBeInTheDocument();
    expect(screen.getByText("48")).toBeInTheDocument();
  });

  it("renders Previous button disabled on first page", () => {
    render(<Pagination {...defaultProps} page={1} />);
    const prev = screen.getByRole("button", { name: /previous/i });
    expect(prev).toBeDisabled();
  });

  it("renders Next button disabled on last page", () => {
    render(<Pagination {...defaultProps} page={5} totalPages={5} />);
    const next = screen.getByRole("button", { name: /next/i });
    expect(next).toBeDisabled();
  });

  it("Previous button is enabled when not on first page", () => {
    render(<Pagination {...defaultProps} page={3} />);
    const prev = screen.getByRole("button", { name: /previous/i });
    expect(prev).not.toBeDisabled();
  });

  it("Next button is enabled when not on last page", () => {
    render(<Pagination {...defaultProps} page={3} totalPages={5} />);
    const next = screen.getByRole("button", { name: /next/i });
    expect(next).not.toBeDisabled();
  });

  it("calls onPageChange with page-1 when Previous is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange with page+1 when Next is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange with correct page when a page button is clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination {...defaultProps} page={1} totalPages={5} onPageChange={onPageChange} />);
    // Page buttons 1-5 are rendered (totalPages <= 7)
    const pageButtons = screen.getAllByRole("button").filter((b) => /^\d+$/.test(b.textContent ?? ""));
    // Click page 3
    fireEvent.click(pageButtons[2]);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders all page numbers when totalPages <= 7", () => {
    render(<Pagination {...defaultProps} page={1} totalPages={7} totalItems={70} />);
    for (let i = 1; i <= 7; i++) {
      expect(screen.getByRole("button", { name: String(i) })).toBeInTheDocument();
    }
  });

  it("shows ellipsis when totalPages > 7 and page is in the middle", () => {
    render(<Pagination {...defaultProps} page={5} totalPages={10} totalItems={100} />);
    const ellipses = screen.getAllByText("…");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("always shows first and last page button when totalPages > 7", () => {
    render(<Pagination {...defaultProps} page={5} totalPages={10} totalItems={100} />);
    expect(screen.getByRole("button", { name: "1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10" })).toBeInTheDocument();
  });

  it("highlights the current page button", () => {
    render(<Pagination {...defaultProps} page={3} totalPages={5} />);
    const activeBtn = screen.getByRole("button", { name: "3" });
    expect(activeBtn.className).toContain("bg-[var(--color-dark)]");
    expect(activeBtn.className).toContain("text-white");
  });
});
