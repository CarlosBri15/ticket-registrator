/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useReportFilterState } from './useReportFilterState';

describe('useReportFilterState', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useReportFilterState());
    expect(result.current.search).toBe('');
    expect(result.current.statusFilter).toBe('ALL');
    expect(result.current.dateRange).toBeNull();
    expect(result.current.showAllHistory).toBe(false);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('hasActiveFilters is true when search is non-empty', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => { result.current.setSearch('  test  '); });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('hasActiveFilters is false when search is only whitespace', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => { result.current.setSearch('   '); });
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('hasActiveFilters is true when statusFilter is not ALL', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => { result.current.setStatusFilter('APPROVED'); });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('hasActiveFilters is true when dateRange is set', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => { result.current.setDateRange({ start: new Date(), end: null }); });
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('clearFilters resets search, statusFilter and dateRange', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => {
      result.current.setSearch('query');
      result.current.setStatusFilter('PENDING');
      result.current.setDateRange({ start: new Date(), end: new Date() });
    });
    expect(result.current.hasActiveFilters).toBe(true);
    act(() => { result.current.clearFilters(); });
    expect(result.current.search).toBe('');
    expect(result.current.statusFilter).toBe('ALL');
    expect(result.current.dateRange).toBeNull();
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('clearFilters does not affect showAllHistory', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => { result.current.setShowAllHistory(true); });
    act(() => { result.current.clearFilters(); });
    expect(result.current.showAllHistory).toBe(true);
  });

  it('setShowAllHistory toggles independently', () => {
    const { result } = renderHook(() => useReportFilterState());
    act(() => { result.current.setShowAllHistory(true); });
    expect(result.current.showAllHistory).toBe(true);
    act(() => { result.current.setShowAllHistory(false); });
    expect(result.current.showAllHistory).toBe(false);
  });
});
