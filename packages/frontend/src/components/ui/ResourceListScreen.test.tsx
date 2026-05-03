import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResourceListScreen, type ResourceListMessages } from "./ResourceListScreen";

const baseMessages: ResourceListMessages = {
  emptyTitle: "No items yet",
  emptyDescription: "Create the first one using the action above.",
  noResults: "No matches",
  clearFilters: "Clear filters",
  loading: "Loading…",
};

interface Item {
  id: string;
  name: string;
}

const renderShell = (overrides: Partial<React.ComponentProps<typeof ResourceListScreen<Item>>> = {}) =>
  render(
    <ResourceListScreen<Item>
      title="Resources"
      gridTemplate="32px 1fr"
      columns={[{ label: "Name" }]}
      items={[]}
      total={0}
      filteredTotal={0}
      isLoading={false}
      renderRow={(item) => <p>{item.name}</p>}
      keyOf={(item) => item.id}
      messages={baseMessages}
      {...overrides}
    />,
  );

describe("ResourceListScreen", () => {
  it("renders the title as the page heading", () => {
    renderShell();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Resources");
  });

  it("renders subtitle when provided", () => {
    renderShell({ subtitle: "All your stuff" });
    expect(screen.getByText("All your stuff")).toBeInTheDocument();
  });

  it("renders stats when provided", () => {
    renderShell({ stats: [{ label: "Total", value: 42 }] });
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders header actions slot", () => {
    renderShell({ headerActions: <button>Create</button> });
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders the toolbar slot above the table", () => {
    renderShell({ toolbar: <input placeholder="Search" /> });
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("renders column labels via TableHeader", () => {
    renderShell({ columns: [{ label: "Name" }, { label: "Created", align: "right" }] });
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Created")).toBeInTheDocument();
  });

  it("renders the loading spinner with the loading label", () => {
    const { container } = renderShell({ isLoading: true });
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("hides the loading label when messages.loading is undefined", () => {
    renderShell({ isLoading: true, messages: { ...baseMessages, loading: undefined } });
    expect(screen.queryByText("Loading…")).not.toBeInTheDocument();
  });

  it("renders custom loadingSkeleton when provided", () => {
    const { container } = renderShell({
      isLoading: true,
      loadingSkeleton: <div data-testid="skel">my skeleton</div>,
    });
    expect(screen.getByTestId("skel")).toBeInTheDocument();
    // Default spinner is replaced
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("shows the empty state when total is 0 and not loading", () => {
    renderShell();
    expect(screen.getByText("No items yet")).toBeInTheDocument();
    expect(screen.getByText("Create the first one using the action above.")).toBeInTheDocument();
  });

  it("shows the no-results state when total > 0 but filteredTotal === 0", () => {
    renderShell({ total: 5, filteredTotal: 0 });
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("renders clear-filters button when onClearFilters is provided in no-results state", () => {
    const onClearFilters = vi.fn();
    renderShell({ total: 5, filteredTotal: 0, onClearFilters });
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClearFilters).toHaveBeenCalledTimes(1);
  });

  it("omits clear-filters button when onClearFilters is undefined", () => {
    renderShell({ total: 5, filteredTotal: 0 });
    expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();
  });

  it("renders rows via renderRow when items exist", () => {
    renderShell({
      items: [{ id: "a", name: "Alpha" }, { id: "b", name: "Beta" }],
      total: 2,
      filteredTotal: 2,
    });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    renderShell({ footer: <p>Showing 1–5 of 25</p> });
    expect(screen.getByText("Showing 1–5 of 25")).toBeInTheDocument();
  });

  it("does not render rows when isLoading is true even if items are provided", () => {
    renderShell({
      isLoading: true,
      items: [{ id: "a", name: "Alpha" }],
      total: 1,
      filteredTotal: 1,
    });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });
});
