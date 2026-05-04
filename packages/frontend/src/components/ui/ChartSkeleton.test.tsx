import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChartSkeleton } from "./ChartSkeleton";

describe("ChartSkeleton", () => {
  it("uses kit pulse + bg classes", () => {
    const { container } = render(<ChartSkeleton />);
    const skeleton = container.firstElementChild as HTMLElement;
    expect(skeleton.className).toContain("animate-pulse");
    expect(skeleton.className).toContain("bg-dark/5");
  });

  it("applies the default height of 200px", () => {
    const { container } = render(<ChartSkeleton />);
    expect((container.firstElementChild as HTMLElement).style.height).toBe("200px");
  });

  it("respects a custom height", () => {
    const { container } = render(<ChartSkeleton height={320} />);
    expect((container.firstElementChild as HTMLElement).style.height).toBe("320px");
  });

  it("forwards extra className", () => {
    const { container } = render(<ChartSkeleton className="rounded-2xl" />);
    expect((container.firstElementChild as HTMLElement).className).toContain("rounded-2xl");
  });

  it("hides itself from assistive tech", () => {
    const { container } = render(<ChartSkeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });
});
