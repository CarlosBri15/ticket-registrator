import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stat } from "./Stat";

describe("Stat", () => {
  it("renders label and value", () => {
    render(<Stat label="Total" value="1,234" />);
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("uses kit .stat class on root", () => {
    const { container } = render(<Stat label="x" value="0" />);
    expect(container.firstElementChild?.className).toContain("stat");
  });

  it("renders currency suffix when provided", () => {
    render(<Stat label="Revenue" value="500" currency="EUR" />);
    expect(screen.getByText("EUR")).toBeInTheDocument();
  });

  it("does not render currency suffix when omitted", () => {
    const { container } = render(<Stat label="Revenue" value="500" />);
    expect(container.querySelector(".stat-currency")).toBeNull();
  });

  it("renders delta value (up direction by default)", () => {
    const { container } = render(<Stat label="x" value="1" delta={{ value: "+12%" }} />);
    expect(screen.getByText("+12%")).toBeInTheDocument();
    expect(container.querySelector(".stat-delta")).not.toHaveClass("down");
  });

  it("applies down modifier on negative delta", () => {
    const { container } = render(<Stat label="x" value="1" delta={{ value: "-3%", direction: "down" }} />);
    expect(container.querySelector(".stat-delta")).toHaveClass("down");
  });

  it("renders icon to the left of label", () => {
    const { container } = render(
      <Stat label="x" value="1" icon={<span data-testid="ico">i</span>} />,
    );
    const labelEl = container.querySelector(".stat-label");
    expect(labelEl?.firstElementChild?.getAttribute("data-testid")).toBe("ico");
  });

  it("forwards extra className", () => {
    const { container } = render(<Stat label="x" value="0" className="my-extra" />);
    expect(container.firstElementChild?.className).toContain("my-extra");
  });
});
