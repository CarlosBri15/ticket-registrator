import { colors, UI, SHADOW_HARD } from './theme';

describe('theme constants', () => {
  it('defines brand color correctly', () => {
    expect(colors.brand).toBe('#4D4DFF');
  });

  it('defines UI constants', () => {
    expect(UI.BORDER_WIDTH).toBe(2);
    expect(UI.RADIUS).toBe(8);
  });

  it('defines SHADOW_HARD', () => {
    expect(SHADOW_HARD.shadowColor).toBe(colors.shadow);
    expect(SHADOW_HARD.shadowOffset.width).toBe(UI.SHADOW_OFFSET);
  });
});
