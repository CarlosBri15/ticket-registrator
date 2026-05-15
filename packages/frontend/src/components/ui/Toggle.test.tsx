import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("renders the label and exposes role=switch", () => {
    render(<Toggle label="Aprobar reportes" isOn={false} onChange={() => {}} />);
    const sw = screen.getByRole("switch", { name: /Aprobar reportes/i });
    expect(sw).toBeInTheDocument();
    expect(sw).toHaveAttribute("aria-checked", "false");
  });

  it("reflects the on state via aria-checked and is-on class", () => {
    const { container } = render(
      <Toggle label="Activado" isOn={true} onChange={() => {}} />,
    );
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    expect(container.querySelector(".toggle-row")?.className).toContain("is-on");
    expect(container.querySelector(".toggle-track")?.className).toContain("is-on");
  });

  it("calls onChange with the inverse value when clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="x" isOn={false} onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange(false) when clicked while on", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="x" isOn={true} onChange={onChange} />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("does not fire onChange when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="x" isOn={false} onChange={onChange} disabled />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not fire onChange while loading", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="x" isOn={false} onChange={onChange} isLoading />);
    await user.click(screen.getByRole("switch"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders a spinner instead of the track while loading", () => {
    const { container } = render(
      <Toggle label="x" isOn={false} onChange={() => {}} isLoading />,
    );
    expect(container.querySelector(".animate-spin")).not.toBeNull();
    expect(container.querySelector(".toggle-track")).toBeNull();
  });

  it("forwards extra className onto the row", () => {
    const { container } = render(
      <Toggle label="x" isOn={false} onChange={() => {}} className="custom-cls" />,
    );
    expect(container.querySelector(".toggle-row")?.className).toContain("custom-cls");
  });

  it("forwards id to the button", () => {
    render(<Toggle id="t1" label="x" isOn={false} onChange={() => {}} />);
    expect(screen.getByRole("switch")).toHaveAttribute("id", "t1");
  });
});
