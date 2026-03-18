import { describe, it, expect, vi } from 'vitest';

vi.mock('i18next-browser-languagedetector', () => ({
  default: {
    type: 'languageDetector' as const,
    init: () => {},
    detect: () => 'en',
    cacheUserLanguage: () => {},
  },
}));

describe('i18n module', () => {
  it('loads and exports an i18n instance', async () => {
    const i18n = await import('./i18n');
    expect(i18n.default).toBeDefined();
    expect(typeof i18n.default.t).toBe('function');
  }, 30000);
});
