import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DatePickerModal } from './DatePickerModal';

describe('DatePickerModal', () => {
  it('renders title correctly', () => {
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} title="Test Title" />
    );
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('renders month and year', () => {
    const value = new Date(2025, 5, 15); // June 2025
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} value={value} />
    );
    expect(getByText(/Junio 2025/i)).toBeTruthy();
  });

  it('calls onSelect when a day is pressed', () => {
    const onSelect = jest.fn();
    const value = new Date(2025, 0, 1); // Jan 1st 2025
    const { getByText } = render(
      <DatePickerModal visible={true} onClose={jest.fn()} value={value} onSelect={onSelect} />
    );
    // Find day 15
    fireEvent.press(getByText('15'));
    expect(onSelect).toHaveBeenCalled();
  });

  it('calls onClose when X button is pressed', () => {
    const onClose = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <DatePickerModal visible={true} onClose={onClose} />
    );
    // There are 3 buttons: X, Prev Month, Next Month
    // Actually the X button is in the sheetHeader, which is rendered first in the component
    const { Pressable } = require('react-native');
    const buttons = UNSAFE_getAllByType(Pressable);
    fireEvent.press(buttons[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
