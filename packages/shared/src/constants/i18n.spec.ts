import { LANGUAGES } from './i18n';
import type { LanguageCode } from './i18n';

describe('i18n constants', () => {
  it('exports exactly two languages', () => {
    expect(LANGUAGES).toHaveLength(2);
  });

  it('first entry is Spanish', () => {
    expect(LANGUAGES[0].code).toBe('es');
    expect(LANGUAGES[0].label).toBe('Español');
  });

  it('second entry is English', () => {
    expect(LANGUAGES[1].code).toBe('en');
    expect(LANGUAGES[1].label).toBe('English');
  });

  it('LanguageCode type covers both codes', () => {
    const es: LanguageCode = 'es';
    const en: LanguageCode = 'en';
    expect([es, en]).toEqual(['es', 'en']);
  });
});
