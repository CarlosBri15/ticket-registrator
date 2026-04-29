/** @jest-environment jsdom */
import { renderHook, act } from '@testing-library/react';
import { useModalState } from './useModalState';

describe('useModalState', () => {
  it('starts closed with no item', () => {
    const { result } = renderHook(() => useModalState<{ id: number }>());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.item).toBeUndefined();
  });

  it('open() without args sets isOpen to true and leaves item undefined (create mode)', () => {
    const { result } = renderHook(() => useModalState<{ id: number }>());
    act(() => { result.current.open(); });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toBeUndefined();
  });

  it('open(item) sets isOpen to true and stores the item (edit mode)', () => {
    const { result } = renderHook(() => useModalState<{ id: number }>());
    act(() => { result.current.open({ id: 42 }); });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.item).toEqual({ id: 42 });
  });

  it('close() sets isOpen to false and clears item', () => {
    const { result } = renderHook(() => useModalState<{ id: number }>());
    act(() => { result.current.open({ id: 1 }); });
    act(() => { result.current.close(); });
    expect(result.current.isOpen).toBe(false);
    expect(result.current.item).toBeUndefined();
  });

  it('can be opened multiple times with different items', () => {
    const { result } = renderHook(() => useModalState<string>());
    act(() => { result.current.open('first'); });
    act(() => { result.current.open('second'); });
    expect(result.current.item).toBe('second');
  });
});
