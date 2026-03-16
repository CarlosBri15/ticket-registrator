import { describe, it, expect } from 'vitest';

describe('i18n module', () => {
  it('loads and exports an i18n instance', async () => {
    const i18n = await import('./i18n');
    expect(i18n.default).toBeDefined();
    expect(typeof i18n.default.t).toBe('function');
  });
});
