import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { es, enUS } from 'date-fns/locale';

const mockLanguage = { current: 'en' };
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => k,
    i18n: { language: mockLanguage.current },
  }),
}));

import { useDateLocale } from './useDateLocale';

describe('useDateLocale', () => {
  beforeEach(() => {
    mockLanguage.current = 'en';
  });

  it('returns enUS locale for English language', () => {
    mockLanguage.current = 'en';
    const { result } = renderHook(() => useDateLocale());
    expect(result.current).toBe(enUS);
  });

  it('returns es locale for Spanish language', () => {
    mockLanguage.current = 'es';
    const { result } = renderHook(() => useDateLocale());
    expect(result.current).toBe(es);
  });

  it('matches Spanish dialects (es-AR, es-MX)', () => {
    mockLanguage.current = 'es-AR';
    const { result } = renderHook(() => useDateLocale());
    expect(result.current).toBe(es);
  });

  it('falls back to enUS for unknown languages', () => {
    mockLanguage.current = 'fr';
    const { result } = renderHook(() => useDateLocale());
    expect(result.current).toBe(enUS);
  });
});
