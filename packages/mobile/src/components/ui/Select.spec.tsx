import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Select } from './Select';

const options = [
  { value: '1', label: 'Option 1' },
  { value: '2', label: 'Option 2' },
];

describe('Select', () => {
  it('renders label and placeholder correctly', () => {
    const { getByText } = render(
      <Select 
        label="Select Label" 
        placeholder="Select something" 
        options={options} 
        value="" 
        onChange={jest.fn()} 
      />
    );
    expect(getByText('Select Label')).toBeTruthy();
    expect(getByText('Select something')).toBeTruthy();
  });

  it('renders selected option label', () => {
    const { getByText } = render(
      <Select 
        options={options} 
        value="1" 
        onChange={jest.fn()} 
      />
    );
    expect(getByText('Option 1')).toBeTruthy();
  });

  it('opens modal when pressed', () => {
    const { getByText, queryByText } = render(
      <Select 
        options={options} 
        value="" 
        onChange={jest.fn()} 
        placeholder="Trigger"
      />
    );
    // Modal content should not be visible yet (or at least not the options if we use queryByText)
    // Wait, in RN testing-library, Modal content is rendered in the same tree.
    // But we can check for an element inside the sheet.
    fireEvent.press(getByText('Trigger'));
    expect(getByText('Option 2')).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <Select 
        options={options} 
        value="" 
        onChange={onChange} 
        placeholder="Trigger"
      />
    );
    fireEvent.press(getByText('Trigger'));
    fireEvent.press(getByText('Option 2'));
    expect(onChange).toHaveBeenCalledWith('2');
  });

  it('does not open modal when disabled', () => {
    const { getByText, queryByText } = render(
      <Select 
        options={options} 
        value="" 
        onChange={jest.fn()} 
        placeholder="Trigger"
        disabled
      />
    );
    fireEvent.press(getByText('Trigger'));
    expect(queryByText('Option 1')).toBeNull();
  });

  it('shows error message if provided', () => {
    const { getByText } = render(
      <Select 
        options={options} 
        value="" 
        onChange={jest.fn()} 
        error="This is an error"
      />
    );
    expect(getByText('This is an error')).toBeTruthy();
  });
});
