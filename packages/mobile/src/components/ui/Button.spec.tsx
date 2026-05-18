import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';
import { colors } from '../../constants/theme';

describe('Button', () => {
  // ── Rendering ──────────────────────────────────────────────────────────────

  it('renders string children', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeTruthy();
  });

  it('renders JSX children', () => {
    const { getByText } = render(
      <Button>
        <Text>JSX child</Text>
      </Button>,
    );
    expect(getByText('JSX child')).toBeTruthy();
  });

  it('hides text children and shows loader when isLoading', () => {
    const { queryByText } = render(<Button isLoading>Click me</Button>);
    expect(queryByText('Click me')).toBeNull();
  });

  it('renders without crashing when isLoading is false (default)', () => {
    const { getByText } = render(<Button isLoading={false}>Ready</Button>);
    expect(getByText('Ready')).toBeTruthy();
  });

  // ── Interaction ────────────────────────────────────────────────────────────

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button onPress={onPress}>Press</Button>);
    fireEvent.press(getByText('Press'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled=true', () => {
    const onPress = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <Button onPress={onPress} disabled>
        Press
      </Button>,
    );
    const { TouchableOpacity } = require('react-native');
    const touchable = UNSAFE_getAllByType(TouchableOpacity)[0];
    expect(touchable.props.disabled).toBe(true);
  });

  it('is disabled when isLoading=true', () => {
    const { UNSAFE_getAllByType } = render(<Button isLoading>Loading</Button>);
    const { TouchableOpacity } = require('react-native');
    const touchable = UNSAFE_getAllByType(TouchableOpacity)[0];
    expect(touchable.props.disabled).toBe(true);
  });

  // ── Variants ───────────────────────────────────────────────────────────────

  it.each(['primary', 'secondary', 'outline', 'ghost', 'accent', 'danger'] as const)(
    'renders "%s" variant without crashing',
    (variant) => {
      const { getByText } = render(<Button variant={variant}>Button</Button>);
      expect(getByText('Button')).toBeTruthy();
    },
  );

  it('uses primary variant by default', () => {
    const { getByText } = render(<Button>Default</Button>);
    expect(getByText('Default')).toBeTruthy();
  });

  it('outline variant shows brand-coloured ActivityIndicator', () => {
    const { UNSAFE_getAllByType } = render(
      <Button variant="outline" isLoading>x</Button>,
    );
    const { ActivityIndicator } = require('react-native');
    const ai = UNSAFE_getAllByType(ActivityIndicator)[0];
    expect(ai.props.color).toBe(colors.brand);
  });

  it('primary variant shows white ActivityIndicator', () => {
    const { UNSAFE_getAllByType } = render(
      <Button variant="primary" isLoading>x</Button>,
    );
    const { ActivityIndicator } = require('react-native');
    const ai = UNSAFE_getAllByType(ActivityIndicator)[0];
    expect(ai.props.color).toBe(colors.fgOnBrand);
  });

  // ── Sizes ──────────────────────────────────────────────────────────────────

  it.each(['sm', 'md', 'lg'] as const)('renders "%s" size without crashing', (size) => {
    const { getByText } = render(<Button size={size}>Button</Button>);
    expect(getByText('Button')).toBeTruthy();
  });

  it('uses md size by default', () => {
    const { getByText } = render(<Button>Default size</Button>);
    expect(getByText('Default size')).toBeTruthy();
  });
});
