import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export interface ToggleProps {
  /** Visible row label. */
  label: ReactNode;
  /** Current on/off state (controlled). */
  isOn: boolean;
  /** Fired with the new value when the user toggles. */
  onChange: (next: boolean) => void;
  /** Disable the control entirely. */
  disabled?: boolean;
  /** Show an inline spinner instead of the track (e.g. while a mutation is pending). */
  isLoading?: boolean;
  /** Extra class on the row wrapper (e.g. layout overrides). */
  className?: string;
  /** Optional id forwarded to the underlying button (for label-for / aria associations). */
  id?: string;
}

/**
 * Toggle — wraps the kit `.toggle-row + .toggle-track + .toggle-thumb`
 * primitives. Renders as a `<button role="switch" aria-checked>` so it is
 * keyboard-accessible and recognised by screen readers.
 *
 * Visuals:
 * - off: grey track, thumb at left, muted label.
 * - on: brand-coloured track, thumb at right, full-strength label, soft active surface row.
 * - loading: spinner replaces the track (still keeps row layout).
 */
export const Toggle = ({
  label,
  isOn,
  onChange,
  disabled,
  isLoading,
  className,
  id,
}: ToggleProps) => {
  const interactionDisabled = disabled || isLoading;

  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={isOn}
      disabled={interactionDisabled}
      onClick={() => !interactionDisabled && onChange(!isOn)}
      className={`toggle-row ${isOn ? "is-on" : ""} ${className ?? ""}`.trim()}
    >
      <span className="toggle-row-label">{label}</span>
      {isLoading ? (
        <Loader2 className="w-4 h-4 text-dark/50 animate-spin shrink-0" aria-hidden={true} />
      ) : (
        <span className={`toggle-track ${isOn ? "is-on" : ""}`} aria-hidden={true}>
          <span className="toggle-thumb" />
        </span>
      )}
    </button>
  );
};
