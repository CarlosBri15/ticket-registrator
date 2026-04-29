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
import { useTicketForm } from './useTicketForm';

const buildTicket = (overrides: Partial<ITicket> = {}): ITicket =>
  ({
    id: 'tk1',
    location_name: 'Sol',
    location_address: 'Calle 1',
    date: '2024-01-15T10:00:00.000Z',
    amount: 25.5,
    currency: 'EUR',
    payment_type: 'CASH',
    ...overrides,
  } as unknown as ITicket);

describe('useTicketForm', () => {
  let mutate: ReturnType<typeof vi.fn>;
  let capturedOnSuccess: (() => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = vi.fn();
    capturedOnSuccess = undefined;
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate, isPending: false };
    });
  });

  it('initialises with isEditing=false and empty form data', () => {
    const { result } = renderHook(() => useTicketForm());
    expect(result.current.isEditing).toBe(false);
    expect(result.current.formData).toEqual({
      location_name: '',
      location_address: '',
      date: '',
      amount: '',
      currency: '',
      payment_type: '',
    });
  });

  it('startEdit() populates the form and enters edit mode', () => {
    const { result } = renderHook(() => useTicketForm());
    act(() => result.current.startEdit(buildTicket()));
    expect(result.current.isEditing).toBe(true);
    expect(result.current.formData).toEqual({
      location_name: 'Sol',
      location_address: 'Calle 1',
      date: '2024-01-15',
      amount: '25.5',
      currency: 'EUR',
      payment_type: 'CASH',
    });
  });

  it('startEdit() handles ticket fields with null/undefined values', () => {
    const { result } = renderHook(() => useTicketForm());
    const ticket = buildTicket({
      location_name: null as any,
      location_address: null as any,
      date: null as any,
      amount: null as any,
      currency: null as any,
      payment_type: null as any,
    });
    act(() => result.current.startEdit(ticket));
    expect(result.current.formData).toEqual({
      location_name: '',
      location_address: '',
      date: '',
      amount: '',
      currency: '',
      payment_type: '',
    });
  });

  it('cancelEdit() exits edit mode', () => {
    const { result } = renderHook(() => useTicketForm());
    act(() => result.current.startEdit(buildTicket()));
    expect(result.current.isEditing).toBe(true);
    act(() => result.current.cancelEdit());
    expect(result.current.isEditing).toBe(false);
  });

  it('handleChange() updates a single form field', () => {
    const { result } = renderHook(() => useTicketForm());
    act(() => {
      result.current.handleChange({
        target: { name: 'location_name', value: 'Hotel' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.formData.location_name).toBe('Hotel');
  });

  it('save() fires the update mutation with parsed values', () => {
    const { result } = renderHook(() => useTicketForm());
    act(() => result.current.startEdit(buildTicket()));
    act(() => result.current.save('r1', 'tk1'));
    expect(mutate).toHaveBeenCalledWith({
      reportId: 'r1',
      ticketId: 'tk1',
      data: {
        location_name: 'Sol',
        location_address: 'Calle 1',
        date: '2024-01-15',
        amount: 25.5,
        currency: 'EUR',
        payment_type: 'CASH',
      },
    });
  });

  it('save() converts empty strings to null', () => {
    const { result } = renderHook(() => useTicketForm());
    act(() => result.current.save('r1', 'tk1'));
    expect(mutate).toHaveBeenCalledWith({
      reportId: 'r1',
      ticketId: 'tk1',
      data: {
        location_name: null,
        location_address: null,
        date: null,
        amount: null,
        currency: null,
        payment_type: null,
      },
    });
  });

  it('exits edit mode on mutation success', () => {
    const { result } = renderHook(() => useTicketForm());
    act(() => result.current.startEdit(buildTicket()));
    expect(result.current.isEditing).toBe(true);
    act(() => capturedOnSuccess?.());
    expect(result.current.isEditing).toBe(false);
  });

  it('exposes isSaving from the mutation', () => {
    (useUpdateTicketMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });
    const { result } = renderHook(() => useTicketForm());
    expect(result.current.isSaving).toBe(true);
  });
});
