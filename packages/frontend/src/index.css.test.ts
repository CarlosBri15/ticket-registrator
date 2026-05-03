import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it, expect } from "vitest";

const CSS_PATH = resolve(__dirname, "./index.css");
const css = readFileSync(CSS_PATH, "utf-8");

describe("index.css — design system contract", () => {
  describe("kit semantic tokens", () => {
    it.each([
      ["--brand", "#1C1917"],
      ["--brand-hover", "#2A2724"],
      ["--accent", "#F5C842"],
      ["--accent-hover", "#E8B82A"],
      ["--accent-faint", "#FDF7E1"],
      ["--fg-primary", "#1C1917"],
      ["--surface", "#FFFFFF"],
      ["--surface-sunken", "#F7F6F3"],
      ["--surface-sidebar", "#F5F4F0"],
      ["--border", "#E5E4E0"],
      ["--success", "#16A34A"],
      ["--success-bg", "#F0FDF4"],
      ["--warning", "#D97706"],
      ["--danger", "#DC2626"],
      ["--info", "#2563EB"],
    ])("defines %s = %s", (token, value) => {
      const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const re = new RegExp(`${token}:\\s*${escapedValue}`);
      expect(css).toMatch(re);
    });

    it("defines fg-secondary/tertiary/quaternary as alpha rgba", () => {
      expect(css).toMatch(/--fg-secondary:\s*rgba\(28,\s*25,\s*23,\s*0\.55\)/);
      expect(css).toMatch(/--fg-tertiary:\s*rgba\(28,\s*25,\s*23,\s*0\.45\)/);
      expect(css).toMatch(/--fg-quaternary:\s*rgba\(28,\s*25,\s*23,\s*0\.30\)/);
    });

    it("defines all status dot colors", () => {
      ["--dot-draft", "--dot-created", "--dot-pending", "--dot-submitted", "--dot-approved", "--dot-paid", "--dot-rejected"].forEach((dot) => {
        expect(css).toMatch(new RegExp(`${dot}:`));
      });
    });

    it("defines stone-50 through stone-900 scale", () => {
      ["50", "100", "150", "200", "300", "400", "500", "600", "700", "800", "900"].forEach((step) => {
        expect(css).toMatch(new RegExp(`--color-stone-${step}:`));
      });
    });

    it("defines extended palette (sol/olive/sage/sky/plum/clay)", () => {
      ["sol", "olive", "sage", "sky", "plum", "clay"].forEach((hue) => {
        expect(css).toMatch(new RegExp(`--color-${hue}:`));
        expect(css).toMatch(new RegExp(`--color-${hue}-soft:`));
        expect(css).toMatch(new RegExp(`--color-${hue}-bg:`));
      });
    });
  });

  describe("kit component classes (@layer components)", () => {
    it.each([
      ".app",
      ".app-main",
      ".app-content",
      ".sb",
      ".sb-item",
      ".sb-section",
      ".btn",
      ".btn-primary",
      ".btn-secondary",
      ".btn-outline",
      ".btn-ghost",
      ".btn-success",
      ".btn-danger",
      ".btn-accent",
      ".btn-sm",
      ".btn-lg",
      ".icon-btn",
      ".input",
      ".field",
      ".card",
      ".alert",
      ".alert-error",
      ".alert-success",
      ".alert-warning",
      ".alert-info",
      ".modal-overlay",
      ".modal-backdrop",
      ".modal-container",
      ".modal-header",
      ".modal-title",
      ".modal-subtitle",
      ".modal-body",
      ".modal-close",
      ".field-error",
      ".select-trigger",
      ".select-dropdown",
      ".select-option",
      ".stat",
      ".stat-value",
      ".status",
      ".st-draft",
      ".st-created",
      ".st-pending",
      ".st-submitted",
      ".st-approved",
      ".st-paid",
      ".st-rejected",
      ".st-declined",
      ".list-row",
      ".list-head",
      ".toolbar",
      ".chip",
      ".tabs",
      ".tab",
      ".ai-pill",
      ".ai-banner",
      ".login-shell",
      ".login-aside",
      ".section-head",
      ".activity",
    ])("declares %s", (cls) => {
      const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(css).toMatch(new RegExp(`${escaped}\\s*{`));
    });
  });

  describe("kit geometry — buttons are slightly rounded rectangles, not pills", () => {
    it(".btn uses 6px border-radius (kit decision: not pill)", () => {
      // Match `.btn { ... border-radius: 6px ... }` within the same rule.
      expect(css).toMatch(/\.btn\s*{[^}]*border-radius:\s*6px/);
    });

    it(".btn-sm uses 5px border-radius", () => {
      expect(css).toMatch(/\.btn-sm\s*{[^}]*border-radius:\s*5px/);
    });

    it(".btn-lg uses 8px border-radius", () => {
      expect(css).toMatch(/\.btn-lg\s*{[^}]*border-radius:\s*8px/);
    });
  });

  describe("kit geometry — status (list row pattern)", () => {
    it(".status uses 13px font with 7px gap (kit list-row spec)", () => {
      expect(css).toMatch(/\.status\s*{[^}]*font-size:\s*13px/);
      expect(css).toMatch(/\.status\s*{[^}]*gap:\s*7px/);
    });

    it(".status svg is sized to 14px", () => {
      expect(css).toMatch(/\.status\s+svg\s*{[^}]*width:\s*14px/);
    });

    it("does NOT define legacy .badge primitives (removed — no consumer)", () => {
      expect(css).not.toMatch(/\.badge\s*{/);
      expect(css).not.toMatch(/\.badge-approved\s*{/);
    });
  });

  describe("design system typography utilities", () => {
    it.each([".ds-display", ".ds-h1", ".ds-h2", ".ds-h3", ".ds-body", ".ds-body-sm", ".ds-caption", ".ds-micro", ".ds-mono", ".ds-num"])(
      "declares %s",
      (cls) => {
        const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        expect(css).toMatch(new RegExp(`${escaped}\\s*{`));
      },
    );
  });

  describe("backward compatibility — preserves utilities used across the app", () => {
    it.each([".font-sans-normal", ".font-sans-medium", ".font-sans-semibold", ".font-sans-bold", ".font-space", ".font-space-medium", ".font-space-semibold", ".font-space-bold", ".btn-press", ".btn-press-sm", ".btn-press-lg", ".custom-scrollbar", ".animate-slide-up"])(
      "still declares %s",
      (cls) => {
        const escaped = cls.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        expect(css).toMatch(new RegExp(`${escaped}\\s*{`));
      },
    );

    it("font-space-* are now aliased to Manrope + tabular-nums (kit convention)", () => {
      expect(css).toMatch(/\.font-space\s*{[^}]*Manrope[^}]*tabular-nums/);
      expect(css).toMatch(/\.font-space-bold\s*{[^}]*Manrope[^}]*tabular-nums/);
    });
  });

  describe("Manrope-only — IBM Plex Mono removed per kit decision", () => {
    it("does not reference IBM Plex Mono anywhere", () => {
      expect(css).not.toMatch(/IBM Plex Mono/);
    });

    it("aliases --font-mono to Manrope", () => {
      expect(css).toMatch(/--font-mono:\s*'Manrope'/);
    });
  });
});
