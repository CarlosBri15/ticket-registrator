import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when isLoading is true", () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows spinner when isLoading", () => {
    const { container } = render(<Button isLoading>Load</Button>);
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("does not show spinner when not loading", () => {
    const { container } = render(<Button>Load</Button>);
    expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("always applies the kit .btn base class", () => {
    const { container } = render(<Button>x</Button>);
    expect(container.querySelector("button")?.className).toContain("btn");
  });

  it("renders with primary variant by default", () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-primary");
  });

  it("renders with secondary variant", () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-secondary");
  });

  it("renders with outline variant", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-outline");
  });

  it("renders with ghost variant", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-ghost");
  });

  it("renders with danger variant", () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-danger");
  });

  it("renders with success variant", () => {
    const { container } = render(<Button variant="success">Success</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-success");
  });

  it("renders with accent variant", () => {
    const { container } = render(<Button variant="accent">Accent</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-accent");
  });

  it("renders ghost-white variant with custom utility classes (non-kit)", () => {
    const { container } = render(<Button variant="ghost-white">Ghost White</Button>);
    expect(container.querySelector("button")?.className).toContain("bg-white/10");
  });

  it("applies the sm size modifier", () => {
    const { container } = render(<Button size="sm">x</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-sm");
  });

  it("applies the lg size modifier", () => {
    const { container } = render(<Button size="lg">x</Button>);
    expect(container.querySelector("button")?.className).toContain("btn-lg");
  });

  it("md size adds no modifier (kit default)", () => {
    const { container } = render(<Button size="md">x</Button>);
    const className = container.querySelector("button")?.className ?? "";
    expect(className).not.toMatch(/\bbtn-sm\b/);
    expect(className).not.toMatch(/\bbtn-lg\b/);
  });

  it("icon size yields a square 40×40 button", () => {
    const { container } = render(<Button size="icon">x</Button>);
    expect(container.querySelector("button")?.className).toContain("w-10 h-10");
  });

  it("renders leftIcon and rightIcon", () => {
    render(
      <Button leftIcon={<span data-testid="li">L</span>} rightIcon={<span data-testid="ri">R</span>}>
        Save
      </Button>,
    );
    expect(screen.getByTestId("li")).toBeInTheDocument();
    expect(screen.getByTestId("ri")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    expect(container.querySelector("button")?.className).toContain("custom-class");
  });

  it("passes extra props to button element", () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });
});
