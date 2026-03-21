import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act, fireEvent } from '@testing-library/react';
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

  it('closes when clicking outside', () => {
    const TestComponent = () => {
      const { open, setOpen, containerRef, triggerRef } = useDropdown({ id: 'test' });
      return (
        <div ref={containerRef}>
          <button ref={triggerRef} onClick={() => setOpen(true)}>Open</button>
          {open && <div>Dropdown Content</div>}
        </div>
      );
    };

    const { getByText, queryByText } = render(<TestComponent />);
    
    // Open it
    act(() => {
      getByText('Open').click();
    });
    expect(getByText('Dropdown Content')).toBeInTheDocument();
    
    // Click outside on document.body
    act(() => {
      fireEvent.mouseDown(document.body);
    });
    
    expect(queryByText('Dropdown Content')).not.toBeInTheDocument();
  });

  it('updates position on scroll and resize', () => {
    // In jsdom, getBoundingClientRect might return all 0s unless mocked
    const mockRect = { bottom: 100, left: 50, width: 200 };
    const { result } = renderHook(() => useDropdown({ id: 'test' }));
    
    // Mock the trigger ref
    const mockTrigger = document.createElement('button');
    mockTrigger.getBoundingClientRect = vi.fn().mockReturnValue(mockRect);
    (result.current.triggerRef as any).current = mockTrigger;

    act(() => {
      result.current.setOpen(true);
    });
    
    // Expect style to be set
    expect(result.current.dropdownStyle).toEqual({
      position: 'fixed',
      top: 106,
      left: 50,
      width: 200,
      zIndex: 9999,
    });

    // Simulate window events
    act(() => {
      globalThis.dispatchEvent(new Event('scroll'));
      globalThis.dispatchEvent(new Event('resize'));
    });
    
    expect(mockTrigger.getBoundingClientRect).toHaveBeenCalled();
  });
});
