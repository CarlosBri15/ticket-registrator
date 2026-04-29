describe('theme', () => {
  const { colors, mt } = require('./theme');

  describe('colors', () => {
    it('exports brand color as valid hex', () => {
      expect(colors.brand).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('exports success, warning and danger colors', () => {
      expect(colors.success).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.warning).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.danger).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('mt tokens', () => {
    it('exports mt as an object', () => {
      expect(typeof mt).toBe('object');
    });

    it('screen token includes flex-1', () => {
      expect(mt.screen).toContain('flex-1');
    });

    it('btnPrimary token includes bg-brand', () => {
      expect(mt.btnPrimary).toContain('bg-brand');
    });
  });
});
