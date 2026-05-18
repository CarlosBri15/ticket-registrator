import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name: string) => {
    const C = (props: any) => React.createElement(View, { testID: props.testID ?? `icon-${name}` });
    C.displayName = name;
    return C;
  };
  return {
    X: stub('x'),
    ChevronLeft: stub('chevron-left'),
    ChevronRight: stub('chevron-right'),
    Calendar: stub('calendar'),
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

  it('navigates to previous month correctly (Jan wraps to Dec of prior year)', () => {
    const { getByText, getByTestId } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} value={new Date(2025, 0, 1)} />
    );
    expect(getByText('Enero 2025')).toBeTruthy();
    fireEvent.press(getByTestId('icon-chevron-left'));
    expect(getByText('Diciembre 2024')).toBeTruthy();
  });

  it('navigates to next month correctly (Dec wraps to Jan of next year)', () => {
    const { getByText, getByTestId } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} value={new Date(2025, 11, 1)} />
    );
    expect(getByText('Diciembre 2025')).toBeTruthy();
    fireEvent.press(getByTestId('icon-chevron-right'));
    expect(getByText('Enero 2026')).toBeTruthy();
  });

  it('calls onRangeSelect with start date and null on first press in range mode', () => {
    const onRangeSelect = jest.fn();
    // Use a month+year where the 28th only appears once in the grid (no other-month cells share it)
    const { getAllByText } = render(
      <DatePickerModal
        visible={true}
        onClose={jest.fn()}
        rangeMode={true}
        startDate={null}
        endDate={null}
        onRangeSelect={onRangeSelect}
      />
    );
    // Press the first occurrence of '14' — always a current-month day
    fireEvent.press(getAllByText('14')[0]);
    expect(onRangeSelect).toHaveBeenCalledWith(expect.any(Date), null);
  });

  it('calls onRangeSelect and onClose on second press (end date selection)', () => {
    const onRangeSelect = jest.fn();
    const onClose = jest.fn();
    const start = new Date(2025, 2, 1); // March 2025
    const { getAllByText } = render(
      <DatePickerModal
        visible={true}
        onClose={onClose}
        rangeMode={true}
        startDate={start}
        endDate={null}
        onRangeSelect={onRangeSelect}
      />
    );
    // First press → sets start, moves to picking end
    fireEvent.press(getAllByText('12')[0]);
    // Second press → sets end and calls onClose
    fireEvent.press(getAllByText('22')[0]);
    expect(onRangeSelect).toHaveBeenCalledTimes(2);
    expect(onClose).toHaveBeenCalled();
  });

  it('uses single-date title when no title and not range mode', () => {
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} />
    );
    expect(getByText('Seleccionar fecha')).toBeTruthy();
  });
});
