describe('theme', () => {
  const { colors, mt } = require('./theme');

  describe('colors', () => {
    it('exports brand color as kit grafito hex', () => {
      expect(colors.brand).toBe('#1C1917');
    });

    it('exports cream surface', () => {
      expect(colors.surface).toBe('#FFFDF8');
    });

    it('exports success, warning and danger as valid hex', () => {
      expect(colors.success).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.warning).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.danger).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('exports the extended Chromatic v2 accent palette', () => {
      expect(colors.accent).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.sage).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(colors.clay).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('mt tokens', () => {
    it('exports mt as an object', () => {
      expect(typeof mt).toBe('object');
    });

    it('screen token includes flex-1', () => {
      expect(mt.screen).toContain('flex-1');
    });

    it('btnPrimary token uses bg-brand', () => {
      expect(mt.btnPrimary).toContain('bg-brand');
    });
  });
});
