import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDropdown } from './useDropdown';

describe('useDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with open=false', () => {
    const { result } = renderHook(() => useDropdown({ id: 'test' }));
    expect(result.current.open).toBe(false);
  });

  it('toggles open state', () => {
    const { result } = renderHook(() => useDropdown({ id: 'test' }));
    act(() => {
      result.current.setOpen(true);
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.setOpen(false);
    });
    expect(result.current.open).toBe(false);
  });

  it('handles Escape key to close', () => {
    const { result } = renderHook(() => useDropdown({ id: 'test' }));
    act(() => {
      result.current.setOpen(true);
    });
    
    act(() => {
      result.current.handleKeyDown({ key: 'Escape' } as any);
    });
    
    expect(result.current.open).toBe(false);
  });

  it('handles Enter key to toggle', () => {
    const { result } = renderHook(() => useDropdown({ id: 'test' }));
    const preventDefault = vi.fn();
    
    act(() => {
      result.current.handleKeyDown({ key: 'Enter', preventDefault } as any);
    });
    expect(result.current.open).toBe(true);
    expect(preventDefault).toHaveBeenCalled();
    
    act(() => {
      result.current.handleKeyDown({ key: 'Enter', preventDefault } as any);
    });
    expect(result.current.open).toBe(false);
  });
});
