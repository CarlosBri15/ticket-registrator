import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useUpdateItemStatusMutation: vi.fn(),
    useUpdateAllItemsStatusMutation: vi.fn(),
  };
});

import {
  useUpdateItemStatusMutation,
  useUpdateAllItemsStatusMutation,
  type ITicket,
} from '@ticket-registrator/shared';
import { useItemApproval } from './useItemApproval';

const buildTicket = (items: any[] = []): ITicket =>
  ({ id: 'tk1', items } as unknown as ITicket);

describe('useItemApproval', () => {
  let mutate: ReturnType<typeof vi.fn>;
  let mutateAll: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = vi.fn();
    mutateAll = vi.fn();
    (useUpdateItemStatusMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate,
      isPending: false,
    });
    (useUpdateAllItemsStatusMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mutateAll,
      isPending: false,
    });
  });

  it('returns the original status when no optimistic override is set', () => {
    const ticket = buildTicket([{ id: 'i1', status: 'Pending' }]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r1'));
    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Pending');
  });

  it('approve() flips status optimistically and hits the per-item endpoint', () => {
    const ticket = buildTicket([{ id: 'i1', status: 'Pending', amount: 10 }]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r1'));

    act(() => result.current.approve('i1'));

    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Approved');
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate).toHaveBeenCalledWith({
      reportId: 'r1',
      ticketId: 'tk1',
      itemId: 'i1',
      status: 'Approved',
    });
  });

  it('reject() flips status optimistically and hits the per-item endpoint', () => {
    const ticket = buildTicket([{ id: 'i1', status: 'Pending' }]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r2'));

    act(() => result.current.reject('i1'));

    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Rejected');
    expect(mutate).toHaveBeenCalledWith({
      reportId: 'r2',
      ticketId: 'tk1',
      itemId: 'i1',
      status: 'Rejected',
    });
  });

  it('toggling approve → reject fires a second mutation with the new status', () => {
    const ticket = buildTicket([{ id: 'i1', status: 'Pending' }]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r1'));

    act(() => result.current.approve('i1'));
    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Approved');

    act(() => result.current.reject('i1'));
    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Rejected');
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[1][0]).toMatchObject({ itemId: 'i1', status: 'Rejected' });
  });

  it('does nothing when ticket is null (modal not yet anchored)', () => {
    const { result } = renderHook(() => useItemApproval(null, 'r1'));
    act(() => result.current.approve('i1'));
    expect(mutate).not.toHaveBeenCalled();
  });

  it('keeps the optimistic override until the ticket prop reflects the new server status', () => {
    const initialTicket = buildTicket([{ id: 'i1', status: 'Pending' }]);
    const { result, rerender } = renderHook(
      ({ t }: { t: ITicket | null }) => useItemApproval(t, 'r1'),
      { initialProps: { t: initialTicket } },
    );

    act(() => result.current.approve('i1'));
    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Approved');

    // Refetch lands with the new status — the override drops, but the
    // rendered status stays Approved through the prop now.
    const refetched = buildTicket([{ id: 'i1', status: 'Approved' }]);
    rerender({ t: refetched });

    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Approved' } as any),
    ).toBe('Approved');
  });

  it('exposes isSaving from either underlying mutation', () => {
    (useUpdateItemStatusMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });
    (useUpdateAllItemsStatusMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    const ticket = buildTicket([{ id: 'i1', status: 'Pending' }]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r1'));
    expect(result.current.isSaving).toBe(true);
  });

  it('approveAll() optimistically flips every item and hits the bulk endpoint', () => {
    const ticket = buildTicket([
      { id: 'i1', status: 'Pending' },
      { id: 'i2', status: 'Rejected' },
    ]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r1'));

    act(() => result.current.approveAll());

    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Pending' } as any),
    ).toBe('Approved');
    expect(
      result.current.getItemStatus({ id: 'i2', status: 'Rejected' } as any),
    ).toBe('Approved');
    expect(mutateAll).toHaveBeenCalledWith({
      reportId: 'r1',
      ticketId: 'tk1',
      status: 'Approved',
    });
  });

  it('rejectAll() optimistically flips every item and hits the bulk endpoint', () => {
    const ticket = buildTicket([
      { id: 'i1', status: 'Approved' },
      { id: 'i2', status: 'Pending' },
    ]);
    const { result } = renderHook(() => useItemApproval(ticket, 'r2'));

    act(() => result.current.rejectAll());

    expect(
      result.current.getItemStatus({ id: 'i1', status: 'Approved' } as any),
    ).toBe('Rejected');
    expect(mutateAll).toHaveBeenCalledWith({
      reportId: 'r2',
      ticketId: 'tk1',
      status: 'Rejected',
    });
  });

  it('approveAll() is a no-op when the ticket has no items', () => {
    const { result } = renderHook(() =>
      useItemApproval(buildTicket([]), 'r1'),
    );
    act(() => result.current.approveAll());
    expect(mutateAll).not.toHaveBeenCalled();
  });
});
