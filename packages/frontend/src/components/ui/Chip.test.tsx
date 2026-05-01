import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Chip } from "./Chip";

describe("Chip", () => {
  it("renders children", () => {
    render(<Chip>All</Chip>);
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
  });

  it("uses kit .chip class on the button", () => {
    const { container } = render(<Chip>All</Chip>);
    expect(container.querySelector("button")?.className).toContain("chip");
  });

  it("does not include .active when inactive", () => {
    const { container } = render(<Chip>All</Chip>);
    const className = container.querySelector("button")?.className ?? "";
    expect(className).not.toMatch(/\bactive\b/);
  });

  it("includes .active class when active", () => {
    const { container } = render(<Chip active>All</Chip>);
    const className = container.querySelector("button")?.className ?? "";
    expect(className).toMatch(/\bactive\b/);
  });

  it("reflects active state via aria-pressed", () => {
    render(<Chip active>All</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("aria-pressed=false when inactive", () => {
    render(<Chip>All</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>All</Chip>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("defaults type to button to prevent form submission", () => {
    render(<Chip>All</Chip>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("renders leftIcon when provided", () => {
    render(<Chip leftIcon={<span data-testid="ico">★</span>}>Starred</Chip>);
    expect(screen.getByTestId("ico")).toBeInTheDocument();
  });

  it("forwards extra className", () => {
    const { container } = render(<Chip className="my-extra">x</Chip>);
    expect(container.querySelector("button")?.className).toContain("my-extra");
  });
});
