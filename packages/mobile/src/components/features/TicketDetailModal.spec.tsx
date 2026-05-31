import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

jest.mock('@ticket-registrator/shared', () => ({
  useTicketImageQuery: jest.fn(),
  useUpdateTicketMutation: jest.fn(),
  colors: { brand: '#336b87' },
  FALLBACK_CATEGORY_ICON_NAME: 'Tag',
  statusInlineColors: {
    DRAFT: '#78716C',
    CREATED: '#1D4ED8',
    PENDING: '#D97706',
    SUBMITTED: '#D97706',
    APPROVED: '#16A34A',
    PAID: '#047857',
    REJECTED: '#DC2626',
    DECLINED: '#DC2626',
  },
}));

jest.mock('../ui/CategoryIcon', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    CategoryIcon: (props: any) =>
      React.createElement(View, { testID: `cat-icon-${props.iconName ?? 'fallback'}` }),
  };
});

jest.mock('@ticket-registrator/shared/assets', () => ({
  ticketIcon: 1,
  locationIcon: 2,
  commerceIcon: 3,
  paymentMethodIcon: 4,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('expo-image', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { Image: (props: any) => React.createElement(View, { testID: props.testID ?? 'expo-image', accessibilityLabel: props.source?.uri }) };
});

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name: string) => {
    const C = (props: any) => React.createElement(View, { testID: props.testID ?? `icon-${name}` });
    C.displayName = name;
    return C;
  };
  return {
    Camera: stub('camera'),
    Pencil: stub('edit'),
    X: stub('x'),
    Calendar: stub('calendar'),
    Upload: stub('upload'),
    Folder: stub('folder'),
    List: stub('list'),
    Coffee: stub('coffee'),
    ShoppingBag: stub('shopping-bag'),
    Navigation: stub('navigation'),
    Home: stub('smart-home'),
    Monitor: stub('device-desktop'),
    Music: stub('music'),
    Sun: stub('sun'),
    Heart: stub('heart'),
    Image: stub('photo'),
  };
});

import { TicketDetailModal } from './TicketDetailModal';

const baseTicket: any = {
  id: 'ticket-1',
  report_id: 'report-1',
  lifecycle: 'Draft',
  version: 1,
  status: 'Pending',
  cgs_bucket_link: null,
  location_name: 'Restaurante Test',
  location_address: 'Calle Mayor 1',
  date: '2024-03-15T00:00:00.000Z',
  amount: 42.5,
  currency: 'EUR',
  converted_amount: null,
  converted_currency: null,
  cgs_bucket_link_justification: null,
  payment_type: 'Tarjeta',
  last_four_digits: '1234',
  image_id: null,
  flag: false,
  llm_comment: null,
  items: [
    { id: 'i1', name: 'Menú', amount: 30, currency: 'EUR', status: 'Pending', categoryId: 'cat1', categoryName: 'Comida' },
    { id: 'i2', name: 'Bebida', amount: 12.5, currency: 'EUR', status: 'Pending', categoryId: 'cat1', categoryName: 'Comida' },
  ],
  createdAt: '2024-03-15T00:00:00.000Z',
  updatedAt: '2024-03-15T00:00:00.000Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  const shared = require('@ticket-registrator/shared');
  shared.useTicketImageQuery.mockReturnValue({ data: null, isLoading: false });
  shared.useUpdateTicketMutation.mockReturnValue({ mutate: jest.fn(), isPending: false });
});

describe('TicketDetailModal — read-only view', () => {
  it('does not render when ticket is null', () => {
    const { queryByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={null} reportId="r1" />,
    );
    expect(queryByText('Restaurante Test')).toBeNull();
  });

  it('renders ticket name (header) and amount', () => {
    const { getAllByText, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    // location_name appears in header title and in "Comercio" detail row
    expect(getAllByText('Restaurante Test').length).toBeGreaterThanOrEqual(1);
    expect(getByText(/42[.,]5/)).toBeTruthy();
  });

  it('renders items list', () => {
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    expect(getByText('Menú')).toBeTruthy();
    expect(getByText('Bebida')).toBeTruthy();
    expect(getByText('reportDetail.items')).toBeTruthy();
  });

  it('shows noImage placeholder when imageData has no url', () => {
    const { getByText, getByTestId } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    fireEvent.press(getByTestId('icon-camera'));
    expect(getByText('ticketDetail.noImage')).toBeTruthy();
  });

  it('shows ActivityIndicator when image is loading', () => {
    const shared = require('@ticket-registrator/shared');
    shared.useTicketImageQuery.mockReturnValue({ data: null, isLoading: true });

    const { getByTestId, UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    fireEvent.press(getByTestId('icon-camera'));
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThanOrEqual(1);
  });

  it('renders ticket image when imageData.url is present', () => {
    const shared = require('@ticket-registrator/shared');
    shared.useTicketImageQuery.mockReturnValue({
      data: { url: 'https://example.com/image.jpg' },
      isLoading: false,
    });
    const { getByTestId, queryAllByLabelText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    fireEvent.press(getByTestId('icon-camera'));
    expect(queryAllByLabelText('https://example.com/image.jpg').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onClose when the header X is pressed', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <TicketDetailModal visible={true} onClose={onClose} ticket={baseTicket} reportId="r1" />,
    );
    fireEvent.press(getByTestId('icon-x'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('uses fallback name when location_name is null', () => {
    const ticket = { ...baseTicket, location_name: null };
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" />,
    );
    expect(getByText('reportDetail.noTicketName')).toBeTruthy();
  });

  it('shows em dash for date when ticket.date is null', () => {
    const ticket = { ...baseTicket, date: null };
    const { getAllByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" />,
    );
    // Em dash appears in DetailRow placeholder; multiple rows can render it
    expect(getAllByText('—').length).toBeGreaterThan(0);
  });

  it('shows last_four_digits when present', () => {
    const { getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" />,
    );
    expect(getByText(/Tarjeta.*1234/)).toBeTruthy();
  });

  it('does not show edit icon when isEditable is false', () => {
    const { queryByTestId } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={false} />,
    );
    expect(queryByTestId('icon-edit')).toBeNull();
  });

  it('shows edit icon when isEditable is true', () => {
    const { getByTestId } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    expect(getByTestId('icon-edit')).toBeTruthy();
  });
});

describe('TicketDetailModal — edit flow', () => {
  it('enters edit mode when the edit icon is pressed', () => {
    const { getByTestId, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    expect(getByDisplayValue('Restaurante Test')).toBeTruthy();
  });

  it('pre-populates the edit form with ticket fields', () => {
    const { getByTestId, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    expect(getByDisplayValue('Restaurante Test')).toBeTruthy();
    expect(getByDisplayValue('Calle Mayor 1')).toBeTruthy();
    expect(getByDisplayValue('EUR')).toBeTruthy();
    expect(getByDisplayValue('Tarjeta')).toBeTruthy();
    expect(getByDisplayValue('42.5')).toBeTruthy();
  });

  it('handles null amount as empty string in the edit form', () => {
    const ticket = { ...baseTicket, amount: null } as any;
    const { getByTestId, queryByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    expect(queryByDisplayValue('null')).toBeNull();
  });

  it('updates location_name when the user types', () => {
    const { getByTestId, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    const input = getByDisplayValue('Restaurante Test');
    fireEvent.changeText(input, 'Nuevo Restaurante');
    expect(getByDisplayValue('Nuevo Restaurante')).toBeTruthy();
  });

  it('updates currency when the user types', () => {
    const { getByTestId, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    const input = getByDisplayValue('EUR');
    fireEvent.changeText(input, 'USD');
    expect(getByDisplayValue('USD')).toBeTruthy();
  });

  it('calls updateTicket.mutate when save is pressed', () => {
    const mutate = jest.fn();
    const shared = require('@ticket-registrator/shared');
    shared.useUpdateTicketMutation.mockReturnValue({ mutate, isPending: false });

    const { getByTestId, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    fireEvent.press(getByText('common.save'));
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it('passes the parsed float amount to mutate', () => {
    const mutate = jest.fn();
    const shared = require('@ticket-registrator/shared');
    shared.useUpdateTicketMutation.mockReturnValue({ mutate, isPending: false });

    const { getByTestId, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    fireEvent.press(getByText('common.save'));
    expect(mutate.mock.calls[0][0].data.amount).toBe(42.5);
  });

  it('passes null for empty string fields when saving', () => {
    const ticket = { ...baseTicket, location_name: null, payment_type: null, items: [], amount: null };
    const mutate = jest.fn();
    const shared = require('@ticket-registrator/shared');
    shared.useUpdateTicketMutation.mockReturnValue({ mutate, isPending: false });

    const { getByTestId, getByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={ticket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    fireEvent.press(getByText('common.save'));
    const data = mutate.mock.calls[0][0].data;
    expect(data.location_name).toBeNull();
    expect(data.amount).toBeNull();
    expect(data.payment_type).toBeNull();
  });

  it('returns to read-only mode when cancel is pressed', () => {
    const { getByTestId, getByText, queryByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    expect(getByText('common.save')).toBeTruthy();
    fireEvent.press(getByText('common.cancel'));
    expect(queryByText('common.save')).toBeNull();
  });

  it('shows ActivityIndicator instead of save text while saving', () => {
    const shared = require('@ticket-registrator/shared');
    shared.useUpdateTicketMutation.mockReturnValue({ mutate: jest.fn(), isPending: true });

    const { getByTestId, queryByText, UNSAFE_getAllByType } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    expect(queryByText('common.save')).toBeNull();
    const { ActivityIndicator } = require('react-native');
    expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThanOrEqual(1);
  });

  it('exits edit mode when onSuccess callback fires', () => {
    let capturedOnSuccess: (() => void) | undefined;
    const shared = require('@ticket-registrator/shared');
    shared.useUpdateTicketMutation.mockImplementation(({ onSuccess }: { onSuccess: () => void }) => {
      capturedOnSuccess = onSuccess;
      return { mutate: jest.fn(), isPending: false };
    });

    const { getByTestId, queryByText } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    expect(queryByText('common.save')).toBeTruthy();
    act(() => { capturedOnSuccess?.(); });
    expect(queryByText('common.save')).toBeNull();
  });

  it('calls onClose from header X while in edit mode', () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <TicketDetailModal visible={true} onClose={onClose} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    fireEvent.press(getByTestId('icon-x'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('updates location_address when the user types', () => {
    const { getByTestId, getByPlaceholderText, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    const input = getByPlaceholderText('confirmForm.addressPlaceholder');
    fireEvent.changeText(input, 'Calle Nueva 99');
    expect(getByDisplayValue('Calle Nueva 99')).toBeTruthy();
  });

  it('updates amount when the user types', () => {
    const { getByTestId, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    const input = getByDisplayValue('42.5');
    fireEvent.changeText(input, '99.99');
    expect(getByDisplayValue('99.99')).toBeTruthy();
  });

  it('updates payment_type when the user types', () => {
    const { getByTestId, getByPlaceholderText, getByDisplayValue } = render(
      <TicketDetailModal visible={true} onClose={jest.fn()} ticket={baseTicket} reportId="r1" isEditable={true} />,
    );
    fireEvent.press(getByTestId('icon-edit'));
    const input = getByPlaceholderText('confirmForm.paymentMethodPlaceholder');
    fireEvent.changeText(input, 'Efectivo');
    expect(getByDisplayValue('Efectivo')).toBeTruthy();
  });
});
