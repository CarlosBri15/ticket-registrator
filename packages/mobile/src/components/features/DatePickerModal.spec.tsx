import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('@tabler/icons-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name: string) => {
    const C = (props: any) => React.createElement(View, { testID: props.testID ?? `icon-${name}` });
    C.displayName = name;
    return C;
  };
  return {
    IconX: stub('x'),
    IconChevronLeft: stub('chevron-left'),
    IconChevronRight: stub('chevron-right'),
    IconCalendar: stub('calendar'),
  };
});

import { DatePickerModal } from './DatePickerModal';

describe('DatePickerModal', () => {
  it('renders the provided title', () => {
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} title="Test Title" />
    );
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders the month and year for the supplied value', () => {
    const value = new Date(2025, 5, 15); // June 2025
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} value={value} />
    );
    expect(getByText(/Junio 2025/i)).toBeTruthy();
  });

  it('calls onSelect and onClose when a day in the current month is pressed', () => {
    const onSelect = jest.fn();
    const onClose = jest.fn();
    const value = new Date(2025, 0, 1); // Jan 1st 2025
    const { getByText } = render(
      <DatePickerModal
        visible={true}
        onClose={onClose}
        value={value}
        onSelect={onSelect}
      />
    );
    fireEvent.press(getByText('15'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the "today" shortcut', () => {
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} />
    );
    expect(getByText('Ir a hoy')).toBeTruthy();
  });

  it('uses range-mode default title when no title is provided', () => {
    const { getByText } = render(
      <DatePickerModal
        visible={true}
        onClose={jest.fn()}
        rangeMode={true}
        startDate={null}
        endDate={null}
      />
    );
    expect(getByText('Seleccionar inicio')).toBeTruthy();
  });
});
