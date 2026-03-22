import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TicketConfirmationForm } from './TicketConfirmationForm';
import type { ITicket } from '@ticket-registrator/shared';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'confirmForm.establishment': 'Establecimiento',
        'confirmForm.establishmentPlaceholder': 'Nombre del local',
        'confirmForm.address': 'Dirección',
        'confirmForm.addressPlaceholder': 'Dirección',
        'confirmForm.date': 'Fecha',
        'confirmForm.amount': 'Importe',
        'confirmForm.currency': 'Moneda',
        'confirmForm.paymentMethod': 'Método de pago',
        'confirmForm.paymentMethodPlaceholder': 'Efectivo, tarjeta...',
        'confirmForm.category': 'Categoría',
        'confirmForm.categoryPlaceholder': 'Comida, transporte...',
        'confirmForm.itemsSummary': 'Líneas del ticket',
      };
      return map[key] ?? key;
    },
  }),
}));

const fullyExtractedTicket: ITicket = {
  id: 'ticket-1',
  status: 'CREATED',
  location_name: 'Restaurante El Sol',
  location_address: 'Calle Mayor 5',
  date: '2024-06-15T00:00:00.000Z',
  amount: 55.0,
  currency: 'EUR',
  payment_type: 'Tarjeta',
  expense_type: 'Comida',
  last_four_digits: null,
  items: [
    { name: 'Menú del día', amount: 15, currency: 'EUR' },
    { name: 'Postre', amount: 5, currency: 'EUR' },
  ],
};

const emptyTicket: ITicket = {
  id: 'ticket-2',
  status: 'CREATED',
  location_name: null,
  location_address: null,
  date: null,
  amount: null,
  currency: null,
  payment_type: null,
  expense_type: null,
  last_four_digits: null,
  items: [],
};

describe('TicketConfirmationForm', () => {
  // ── AI Confidence Banner ───────────────────────────────────────────────────

  it('shows extraction count 7/7 for fully extracted ticket', () => {
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('IA extrajo 7/7 campos')).toBeTruthy();
  });

  it('shows extraction count 0/7 for empty ticket', () => {
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={emptyTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('IA extrajo 0/7 campos')).toBeTruthy();
  });

  // ── Extracted Fields ───────────────────────────────────────────────────────

  it('renders extracted field labels for fully-populated ticket', () => {
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('Establecimiento')).toBeTruthy();
    expect(getByText('Importe')).toBeTruthy();
    expect(getByText('Moneda')).toBeTruthy();
  });

  it('renders extracted amount formatted with currency', () => {
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('55.00 EUR')).toBeTruthy();
  });

  it('renders extracted location name', () => {
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('Restaurante El Sol')).toBeTruthy();
  });

  // ── Missing Fields (editable) ──────────────────────────────────────────────

  it('renders editable inputs for missing fields', () => {
    const { getByPlaceholderText } = render(
      <TicketConfirmationForm
        ticket={emptyTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByPlaceholderText('Nombre del local')).toBeTruthy();
    expect(getByPlaceholderText('0.00')).toBeTruthy();
    expect(getByPlaceholderText('EUR')).toBeTruthy();
  });

  it('allows typing in a missing field', () => {
    const { getByPlaceholderText } = render(
      <TicketConfirmationForm
        ticket={emptyTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    const input = getByPlaceholderText('Nombre del local');
    fireEvent.changeText(input, 'Nuevo Restaurante');
    expect(input.props.value).toBe('Nuevo Restaurante');
  });

  // ── Items Section ──────────────────────────────────────────────────────────

  it('renders items when ticket has items', () => {
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(getByText('Menú del día')).toBeTruthy();
    expect(getByText('Postre')).toBeTruthy();
    expect(getByText('Líneas del ticket')).toBeTruthy();
  });

  it('does not render items section when ticket has no items', () => {
    const { queryByText } = render(
      <TicketConfirmationForm
        ticket={emptyTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );
    expect(queryByText('Líneas del ticket')).toBeNull();
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  it('calls onConfirm with form data when Confirmar is pressed', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Confirmar Ticket'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(
      expect.objectContaining({
        location_name: 'Restaurante El Sol',
        amount: 55,
        currency: 'EUR',
      }),
    );
  });

  it('calls onCancel when Descartar is pressed', () => {
    const onCancel = jest.fn();
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );
    fireEvent.press(getByText('Descartar'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when isLoading is true', () => {
    const { UNSAFE_getAllByType } = render(
      <TicketConfirmationForm
        ticket={fullyExtractedTicket}
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
        isLoading
      />,
    );
    const { TouchableOpacity } = require('react-native');
    const buttons = UNSAFE_getAllByType(TouchableOpacity);
    const disabledButtons = buttons.filter(b => b.props.disabled === true);
    expect(disabledButtons.length).toBeGreaterThanOrEqual(2);
  });

  it('passes null for empty string fields to onConfirm', () => {
    const onConfirm = jest.fn();
    const { getByText } = render(
      <TicketConfirmationForm
        ticket={emptyTicket}
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );
    fireEvent.press(getByText('Confirmar Ticket'));
    const called = onConfirm.mock.calls[0][0];
    expect(called.location_name).toBeNull();
    expect(called.amount).toBeNull();
  });
});
