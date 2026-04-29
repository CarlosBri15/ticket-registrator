/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useListState } from './useListState';

describe('useListState', () => {
  it('initializes with empty search and page 1', () => {
    const { result } = renderHook(() => useListState());
    expect(result.current.search).toBe('');
    expect(result.current.page).toBe(1);
  });

  it('updates search correctly', () => {
    const { result } = renderHook(() => useListState());
    act(() => { result.current.setSearch('hello'); });
    expect(result.current.search).toBe('hello');
  });

  it('resets page to 1 when search changes', () => {
    const { result } = renderHook(() => useListState());
    act(() => { result.current.setPage(3); });
    expect(result.current.page).toBe(3);
    act(() => { result.current.setSearch('changed'); });
    expect(result.current.page).toBe(1);
  });

  it('paginate returns the correct slice and totalPages (default page size 10)', () => {
    const { result } = renderHook(() => useListState());
    const items = Array.from({ length: 25 }, (_, i) => i);
    const { paginated, totalPages } = result.current.paginate(items);
    expect(paginated).toEqual(items.slice(0, 10));
    expect(totalPages).toBe(3);
  });

  it('paginate respects current page', () => {
    const { result } = renderHook(() => useListState());
    const items = Array.from({ length: 25 }, (_, i) => i);
    act(() => { result.current.setPage(2); });
    const { paginated } = result.current.paginate(items);
    expect(paginated).toEqual(items.slice(10, 20));
  });

  it('paginate uses custom pageSize', () => {
    const { result } = renderHook(() => useListState(5));
    const items = Array.from({ length: 12 }, (_, i) => i);
    const { paginated, totalPages } = result.current.paginate(items);
    expect(paginated).toHaveLength(5);
    expect(totalPages).toBe(3);
  });

  it('paginate returns empty array for empty list', () => {
    const { result } = renderHook(() => useListState());
    const { paginated, totalPages } = result.current.paginate([]);
    expect(paginated).toEqual([]);
    expect(totalPages).toBe(0);
  });
});
