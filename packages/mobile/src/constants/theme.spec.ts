import { colors, UI, SHADOW_HARD } from './theme';

describe('theme constants', () => {
  it('re-exports the shared kit brand colour', () => {
    expect(colors.brand).toBe('#1C1917');
  });

  it('exposes Chromatic v2 cream surface + white card', () => {
    expect(colors.surface).toBe('#FFFDF8');
    expect(colors.surfaceCard).toBe('#FFFFFF');
  });

  it('exposes semantic foreground opacity tokens (no hardcoded rgba at call-sites)', () => {
    expect(colors.fgPrimary).toBe('#1C1917');
    expect(colors.fgSecondary).toMatch(/^rgba/);
    expect(colors.fgTertiary).toMatch(/^rgba/);
    expect(colors.fgOnBrand).toBe('#FFFFFF');
  });

  it('exposes overlay tokens for hover/sheet tints', () => {
    expect(colors.overlayLight).toMatch(/^rgba/);
    expect(colors.overlayStrong).toMatch(/^rgba/);
    expect(colors.overlaySidebar).toMatch(/^rgba\(255/);
  });

  it('keeps UI radius aligned with kit card radius', () => {
    expect(UI.BORDER_WIDTH).toBe(1);
    expect(UI.RADIUS).toBe(14);
  });

  it('defines a soft (not hard pixel) shadow', () => {
    expect(SHADOW_HARD.shadowColor).toBe(colors.fgPrimary);
    expect(SHADOW_HARD.shadowOpacity).toBeLessThanOrEqual(1);
    expect(SHADOW_HARD.shadowRadius).toBeGreaterThan(0);
  });
});
