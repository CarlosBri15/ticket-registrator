import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUpdateTicketMutation: vi.fn(),
  };
});

import { useUpdateTicketMutation, type ITicket } from '@ticket-registrator/shared';
import { useItemApproval } from './useItemApproval';

const buildTicket = (items: any[] = []): ITicket =>
  ({ id: 'tk1', items } as unknown as ITicket);

describe('useItemApproval', () => {
  let mutate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = vi.fn();
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isPending: false,
    });
  });

  it('starts with no item changes', () => {
    const { result } = renderHook(() => useItemApproval());
    expect(result.current.hasItemChanges).toBe(false);
  });

  it('returns the original status when no override is set', () => {
    const { result } = renderHook(() => useItemApproval());
    const status = result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any);
    expect(status).toBe('Pending');
  });

  it('approve() overrides the status to Approved', () => {
    const { result } = renderHook(() => useItemApproval());
    act(() => result.current.approve('i1'));
    expect(result.current.hasItemChanges).toBe(true);
    expect(result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any)).toBe('Approved');
  });

  it('reject() overrides the status to Rejected', () => {
    const { result } = renderHook(() => useItemApproval());
    act(() => result.current.reject('i1'));
    expect(result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any)).toBe('Rejected');
  });

  it('reset() clears all overrides', () => {
    const { result } = renderHook(() => useItemApproval());
    act(() => {
      result.current.approve('i1');
      result.current.reject('i2');
    });
    expect(result.current.hasItemChanges).toBe(true);
    act(() => result.current.reset());
    expect(result.current.hasItemChanges).toBe(false);
  });

  it('save() merges overrides into the ticket items and clears state', () => {
    const { result } = renderHook(() => useItemApproval());
    const ticket = buildTicket([
      { id: 'i1', status: 'Pending' },
      { id: 'i2', status: 'Pending' },
      { id: 'i3', status: 'Pending' },
    ]);

    act(() => {
      result.current.approve('i1');
      result.current.reject('i2');
    });
    act(() => result.current.save(ticket, 'r1'));

    expect(mutate).toHaveBeenCalledWith({
      reportId: 'r1',
      ticketId: 'tk1',
      data: {
        items: [
          { id: 'i1', status: 'Approved' },
          { id: 'i2', status: 'Rejected' },
          { id: 'i3', status: 'Pending' },
        ],
      },
    });
    expect(result.current.hasItemChanges).toBe(false);
  });

  it('save() handles a ticket with no items array', () => {
    const { result } = renderHook(() => useItemApproval());
    const ticket = { id: 'tk1' } as unknown as ITicket;
    act(() => result.current.save(ticket, 'r1'));
    expect(mutate).toHaveBeenCalledWith({
      reportId: 'r1',
      ticketId: 'tk1',
      data: { items: [] },
    });
  });

  it('exposes isSaving from mutation', () => {
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });
    const { result } = renderHook(() => useItemApproval());
    expect(result.current.isSaving).toBe(true);
  });
});
