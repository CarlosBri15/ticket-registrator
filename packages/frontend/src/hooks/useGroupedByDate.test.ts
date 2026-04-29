import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGroupedByDate } from './useGroupedByDate';

interface TestItem {
  id: string;
  createdAt: string;
}

describe('useGroupedByDate', () => {
  it('returns an empty array for undefined input', () => {
    const { result } = renderHook(() => useGroupedByDate<TestItem>(undefined));
    expect(result.current).toEqual([]);
  });

  it('returns an empty array for an empty list', () => {
    const { result } = renderHook(() => useGroupedByDate<TestItem>([]));
    expect(result.current).toEqual([]);
  });

  it('groups items that share the same calendar day', () => {
    const items: TestItem[] = [
      { id: 'a', createdAt: '2024-01-15T08:00:00.000Z' },
      { id: 'b', createdAt: '2024-01-15T18:30:00.000Z' },
    ];
    const { result } = renderHook(() => useGroupedByDate(items));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].items.map((i) => i.id).sort()).toEqual(['a', 'b']);
  });

  it('orders groups with most recent day first', () => {
    const items: TestItem[] = [
      { id: 'old', createdAt: '2024-01-10T12:00:00.000Z' },
      { id: 'new', createdAt: '2024-01-20T12:00:00.000Z' },
      { id: 'mid', createdAt: '2024-01-15T12:00:00.000Z' },
    ];
    const { result } = renderHook(() => useGroupedByDate(items));
    expect(result.current).toHaveLength(3);
    expect(result.current[0].items[0].id).toBe('new');
    expect(result.current[1].items[0].id).toBe('mid');
    expect(result.current[2].items[0].id).toBe('old');
  });

  it('preserves descending intra-day ordering by createdAt', () => {
    const items: TestItem[] = [
      { id: 'morning', createdAt: '2024-01-15T08:00:00.000Z' },
      { id: 'evening', createdAt: '2024-01-15T20:00:00.000Z' },
      { id: 'noon', createdAt: '2024-01-15T12:00:00.000Z' },
    ];
    const { result } = renderHook(() => useGroupedByDate(items));
    expect(result.current).toHaveLength(1);
    expect(result.current[0].items.map((i) => i.id)).toEqual(['evening', 'noon', 'morning']);
  });

  it('returns groups with a Date for the day key (start of day)', () => {
    const items: TestItem[] = [{ id: 'a', createdAt: '2024-01-15T18:30:00.000Z' }];
    const { result } = renderHook(() => useGroupedByDate(items));
    const day = result.current[0].date;
    expect(day).toBeInstanceOf(Date);
    expect(day.getHours()).toBe(0);
    expect(day.getMinutes()).toBe(0);
    expect(day.getSeconds()).toBe(0);
  });

  it('memoises results when input is unchanged', () => {
    const items: TestItem[] = [{ id: 'a', createdAt: '2024-01-15T18:30:00.000Z' }];
    const { result, rerender } = renderHook((p: TestItem[]) => useGroupedByDate(p), {
      initialProps: items,
    });
    const first = result.current;
    rerender(items);
    expect(result.current).toBe(first);
  });
});
