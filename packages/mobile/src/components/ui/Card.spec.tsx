import React from 'react';
import { Text, View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Card } from './Card';
import { colors } from '../../constants/theme';

describe('Card', () => {
  it('renders children', () => {
    const { getByText } = render(
      <Card>
        <Text>Card body</Text>
      </Card>,
    );
    expect(getByText('Card body')).toBeTruthy();
  });

  it('applies the default white kit surface', () => {
    const { UNSAFE_getAllByType } = render(
      <Card testID="c">
        <Text>x</Text>
      </Card>,
    );
    const root = UNSAFE_getAllByType(View)[0];
    const flat = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(flat.backgroundColor).toBe(colors.surfaceCard);
    expect(flat.borderColor).toBe(colors.border);
    expect(flat.borderRadius).toBe(14);
  });

  it('uses the brand variant surface', () => {
    const { UNSAFE_getAllByType } = render(
      <Card variant="brand">
        <Text>x</Text>
      </Card>,
    );
    const root = UNSAFE_getAllByType(View)[0];
    const flat = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(flat.backgroundColor).toBe(colors.brand);
  });

  it('honours the explicit bg prop over the variant', () => {
    const { UNSAFE_getAllByType } = render(
      <Card bg="#abcdef">
        <Text>x</Text>
      </Card>,
    );
    const root = UNSAFE_getAllByType(View)[0];
    const flat = Array.isArray(root.props.style)
      ? Object.assign({}, ...root.props.style.filter(Boolean))
      : root.props.style;
    expect(flat.backgroundColor).toBe('#abcdef');
  });

  it('renders the padded variant', () => {
    const { getByText } = render(
      <Card padded>
        <Text>padded</Text>
      </Card>,
    );
    expect(getByText('padded')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Card onPress={onPress}>
        <Text>tap</Text>
      </Card>,
    );
    fireEvent.press(getByText('tap'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('exposes accessibility metadata when interactive', () => {
    const { getByLabelText } = render(
      <Card onPress={jest.fn()} accessibilityLabel="open detail">
        <Text>tap</Text>
      </Card>,
    );
    expect(getByLabelText('open detail')).toBeTruthy();
  });
});
