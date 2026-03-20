import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardHelpers } from './useDashboardHelpers';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('date-fns/locale', () => ({
  es: { code: 'es' },
  enUS: { code: 'en-US' },
}));

describe('useDashboardHelpers', () => {
  it('returns correct greeting key based on hour', () => {
    vi.useFakeTimers();
    
    // We need to re-render or re-call the hook inside the test to pick up timer changes
    const { rerender, result } = renderHook(() => useDashboardHelpers());
    
    vi.setSystemTime(new Date(2024, 0, 1, 9, 0)); // 9 AM
    expect(result.current.getGreetingKey()).toBe('home.greetingMorning');
    
    vi.setSystemTime(new Date(2024, 0, 1, 15, 0)); // 3 PM
    expect(result.current.getGreetingKey()).toBe('home.greetingAfternoon');
    
    vi.setSystemTime(new Date(2024, 0, 1, 21, 0)); // 9 PM
    expect(result.current.getGreetingKey()).toBe('home.greetingEvening');
    
    vi.useRealTimers();
  });

  it('returns es locale when language is es', () => {
    const { result } = renderHook(() => useDashboardHelpers());
    expect(result.current.dateLocale.code).toBe('es');
  });
});
