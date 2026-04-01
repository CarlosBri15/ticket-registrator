import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { TicketDetailModal } from './TicketDetailModal';
import type { ITicket } from '@ticket-registrator/shared';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useTicketImageQuery: jest.fn(),
  useUpdateTicketMutation: jest.fn(),
  colors: { brand: '#336b87' },
}));

beforeEach(() => {
  const shared = require('@ticket-registrator/shared');
  (shared.useTicketImageQuery as jest.Mock).mockReturnValue({ data: null, isLoading: false });
  (shared.useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: false });
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

const baseTicket = {
  id: 'ticket-1',
  status: 'CREATED' as any,
  location_name: 'Restaurante Test',
  location_address: 'Calle Mayor 1',
  date: '2024-03-15T00:00:00.000Z',
  amount: 42.5,
  currency: 'EUR',
  payment_type: 'Tarjeta',
  expense_type: 'Comida',
  last_four_digits: '1234',
  items: [
    { id: 'i1', name: 'Menú', amount: 30, currency: 'EUR', status: 'PAID' as any, expense_type: 'Food' },
    { id: 'i2', name: 'Bebida', amount: 12.5, currency: 'EUR', status: 'PAID' as any, expense_type: 'Food' },
  ],
} as unknown as ITicket;

describe('TicketDetailModal — read-only view', () => {
  it('does not render when ticket is null', () => {
    const { queryByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={null} reportId="r1" />,
    );
    expect(queryByText('Restaurante Test')).toBeNull();
  });

  it('renders ticket name and amount', () => {
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    expect(getByText('Restaurante Test')).toBeTruthy();
    expect(getByText(/42[.,]5/)).toBeTruthy();
  });

  it('renders items list', () => {
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    expect(getByText('Menú')).toBeTruthy();
    expect(getByText('Bebida')).toBeTruthy();
  });

  it('shows noImage when no image data', () => {
    const { getByText, UNSAFE_queryByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    // Open image modal
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_queryByType(Pressable);
    fireEvent.press(buttons!);

    expect(getByText('ticketDetail.noImage')).toBeTruthy();
  });

  it('shows loading indicator when image is loading', () => {
    const shared = require('@ticket-registrator/shared');
    (shared.useTicketImageQuery as jest.Mock).mockReturnValue({ data: null, isLoading: true });
    const { UNSAFE_getAllByType, UNSAFE_queryByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    // Open image modal
    const { Pressable, ActivityIndicator } = require('react-native');
    const buttons = UNSAFE_queryByType(Pressable);
    fireEvent.press(buttons!);

    const indicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  });

  it('renders ticket image when imageData.url is present', () => {
    const shared = require('@ticket-registrator/shared');
    (shared.useTicketImageQuery as jest.Mock).mockReturnValue({
      data: { url: 'https://example.com/image.jpg' },
      isLoading: false,
    });
    const { UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    const { Image } = require('react-native');
    const images = UNSAFE_getAllByType(Image);
    expect(images[0].props.source.uri).toBe('https://example.com/image.jpg');
  });

  it('calls onClose when X button is pressed', () => {
    const onClose = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={onClose} ticket={baseTicket} reportId="r1" />,
    );
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    // The X button is the last one in the header actions in this case
    fireEvent.press(buttons[2]); 
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows reportDetail.items section when ticket has items', () => {
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    expect(getByText('reportDetail.items')).toBeTruthy();
  });

  it('uses fallback name when location_name is null', () => {
    const ticket = { ...baseTicket, location_name: null };
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" />,
    );
    expect(getByText('reportDetail.noTicketName')).toBeTruthy();
  });

  it('shows --- for date when ticket.date is null', () => {
    const ticket = { ...baseTicket, date: null };
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" />,
    );
    expect(getByText('---')).toBeTruthy();
  });

  it('shows last_four_digits when present', () => {
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    expect(getByText(/\*\*\*\* 1234/)).toBeTruthy();
  });

  it('does not show edit button when isEditable is false', () => {
    const { queryByTestId } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={false} />,
    );
    expect(queryByTestId('icon-edit-2')).toBeNull();
  });

  it('shows edit button when isEditable is true', () => {
    const { UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    // Header has 3 buttons in this case (Camera, Edit, Close)
    expect(buttons.length).toBe(3);
  });
});

describe('TicketDetailModal — edit flow', () => {
  it('enters edit mode when edit button is pressed', () => {
    const { UNSAFE_getAllByType, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    fireEvent.press(buttons[1]); // Edit button
    expect(getByDisplayValue('Restaurante Test')).toBeTruthy();
  });

  it('pre-populates edit form with ticket data', () => {
    const { UNSAFE_getAllByType, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    fireEvent.press(buttons[1]); // Edit button
    expect(getByDisplayValue('Restaurante Test')).toBeTruthy();
    expect(getByDisplayValue('EUR')).toBeTruthy();
    expect(getByDisplayValue('Tarjeta')).toBeTruthy();
  });

  it('pre-populates amount as string', () => {
    const { UNSAFE_getAllByType, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    fireEvent.press(buttons[1]); // Edit button
    expect(getByDisplayValue('42.5')).toBeTruthy();
  });

  it('handles null amount as empty string in edit form', () => {
    const ticket = { ...baseTicket, amount: null } as any;
    const { UNSAFE_getAllByType, queryByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    // Should show placeholder 0.00 with empty value
    expect(queryByDisplayValue('null')).toBeNull();
  });

  it('updates location_name when user types', () => {
    const { UNSAFE_getAllByType, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    const input = getByDisplayValue('Restaurante Test');
    fireEvent.changeText(input, 'Nuevo Restaurante');
    expect(getByDisplayValue('Nuevo Restaurante')).toBeTruthy();
  });

  it('updates currency when user types', () => {
    const { UNSAFE_getAllByType, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    const input = getByDisplayValue('EUR');
    fireEvent.changeText(input, 'USD');
    expect(getByDisplayValue('USD')).toBeTruthy();
  });

  it('calls updateTicket mutate when save is pressed', () => {
    const mutate = jest.fn();
    const shared = require('@ticket-registrator/shared');
    (shared.useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { UNSAFE_getAllByType, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    fireEvent.press(getByText('common.save'));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('passes parsed float amount to mutate', () => {
    const mutate = jest.fn();
    const shared = require('@ticket-registrator/shared');
    (shared.useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { UNSAFE_getAllByType, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    fireEvent.press(getByText('common.save'));
    const callData = mutate.mock.calls[0][0].data;
    expect(callData.amount).toBe(42.5);
  });

  it('passes null for empty string fields when saving', () => {
    const ticket = { ...baseTicket, location_name: null, payment_type: null, expense_type: null, amount: null } as any;
    const mutate = jest.fn();
    const shared = require('@ticket-registrator/shared');
    (shared.useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate, isPending: false });

    const { UNSAFE_getAllByType, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    fireEvent.press(getByText('common.save'));
    const callData = mutate.mock.calls[0][0].data;
    expect(callData.location_name).toBeNull();
    expect(callData.amount).toBeNull();
  });

  it('returns to read-only mode when cancel is pressed', () => {
    const { UNSAFE_getAllByType, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    fireEvent.press(getByText('common.cancel'));
    // In read-only mode, the X button is buttons[2]
    expect(UNSAFE_getAllByType(Pressable).length).toBe(3);
  });

  it('shows ActivityIndicator instead of save text when isSaving', () => {
    const shared = require('@ticket-registrator/shared');
    (shared.useUpdateTicketMutation as jest.Mock).mockReturnValue({ mutate: jest.fn(), isPending: true });

    const { UNSAFE_getAllByType, queryByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable, ActivityIndicator } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    expect(queryByText('common.save')).toBeNull();
    const indicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  });

  it('exits edit mode when onSuccess callback is invoked', () => {
    let capturedOnSuccess: (() => void) | undefined;
    const shared = require('@ticket-registrator/shared');
    (shared.useUpdateTicketMutation as jest.Mock).mockImplementation(
      ({ onSuccess }: { onSuccess: () => void }) => {
        capturedOnSuccess = onSuccess;
        return { mutate: jest.fn(), isPending: false };
      },
    );

    const { UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    act(() => { capturedOnSuccess?.(); });
    // Check we are back to 3 buttons
    expect(UNSAFE_getAllByType(Pressable).length).toBe(3);
  });

  it('calls onClose from X button while in edit mode', () => {
    const onClose = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={onClose} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    fireEvent.press(buttons[1]); // Edit button
    // After entering edit mode, the X button is still in the header (buttons[2])
    fireEvent.press(UNSAFE_getAllByType(Pressable)[2]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates location_address when user types', () => {
    const { UNSAFE_getAllByType, getByPlaceholderText, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    const input = getByPlaceholderText('confirmForm.addressPlaceholder');
    fireEvent.changeText(input, 'Calle Nueva 99');
    expect(getByDisplayValue('Calle Nueva 99')).toBeTruthy();
  });

  it('updates amount when user types', () => {
    const { UNSAFE_getAllByType, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    const input = getByDisplayValue('42.5');
    fireEvent.changeText(input, '99.99');
    expect(getByDisplayValue('99.99')).toBeTruthy();
  });

  it('updates payment_type when user types', () => {
    const { UNSAFE_getAllByType, getByPlaceholderText, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    const { Pressable } = require('react-native');
    fireEvent.press(UNSAFE_getAllByType(Pressable)[1]);
    const input = getByPlaceholderText('confirmForm.paymentMethodPlaceholder');
    fireEvent.changeText(input, 'Efectivo');
    expect(getByDisplayValue('Efectivo')).toBeTruthy();
  });

  // expense_type is not editable in current form UI, removing test
});
