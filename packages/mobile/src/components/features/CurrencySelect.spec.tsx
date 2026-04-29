import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CurrencySelect } from './CurrencySelect';

// Mock Select to ensure we're testing CurrencySelect's logic
jest.mock('../ui/Select', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    Select: (props: any) => (
      <View>
        <Text>{props.label}</Text>
        <TouchableOpacity onPress={() => props.onChange('USD')}>
          <Text>{props.placeholder}</Text>
        </TouchableOpacity>
        {props.options.map((opt: any) => (
          <Text key={opt.value}>{opt.label}</Text>
        ))}
      </View>
    ),
  };
});

describe('CurrencySelect', () => {
  it('renders with default label', () => {
    const { getByText } = render(
      <CurrencySelect value="" onChange={jest.fn()} />
    );
    expect(getByText('Moneda')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { getByText } = render(
      <CurrencySelect value="" onChange={jest.fn()} label="Custom Currency Label" />
    );
    expect(getByText('Custom Currency Label')).toBeTruthy();
  });

  it('renders currency options', () => {
    const { getByText } = render(
      <CurrencySelect value="" onChange={jest.fn()} />
    );
    expect(getByText('€ Euro')).toBeTruthy();
    expect(getByText('$ Dólar')).toBeTruthy();
    expect(getByText('¥ Yen')).toBeTruthy();
  });

  it('calls onChange when an option is selected', () => {
    const onChange = jest.fn();
    const { getByText } = render(
      <CurrencySelect value="" onChange={onChange} />
    );
    
    // In our mock, pressing the placeholder triggers onChange('USD')
    fireEvent.press(getByText('Selecciona una moneda'));
    expect(onChange).toHaveBeenCalledWith('USD');
  });
});
