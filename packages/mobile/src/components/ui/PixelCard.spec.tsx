import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PixelCard } from './PixelCard';
import { Text } from 'react-native';

describe('PixelCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <PixelCard>
        <Text>Card Content</Text>
      </PixelCard>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('renders as Pressable when onPress is provided', () => {
    const onPress = jest.fn();
    const { UNSAFE_queryByType } = render(
      <PixelCard onPress={onPress}>
        <Text>Interactive</Text>
      </PixelCard>
    );
    const { Pressable } = require('react-native');
    const pressable = UNSAFE_queryByType(Pressable);
    expect(pressable).toBeTruthy();
    
    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders as View when onPress is NOT provided', () => {
    const { UNSAFE_queryByType } = render(
      <PixelCard>
        <Text>Static</Text>
      </PixelCard>
    );
    const { Pressable } = require('react-native');
    const pressable = UNSAFE_queryByType(Pressable);
    expect(pressable).toBeNull();
  });

  it('applies custom bg color', () => {
    const { UNSAFE_getByType } = render(
      <PixelCard bg="#ff0000">
        <Text>Red Card</Text>
      </PixelCard>
    );
    const { View } = require('react-native');
    // The innermost View should have the bg color
    const views = UNSAFE_getByType(View).children;
    // We navigate to the view that holds the content
    // Structure: View (container) -> Animated.View (shadow) -> Animated.View (border) -> View (content)
    // Actually using a more robust way to find it
    const allViews = render(<PixelCard bg="#ff0000"><Text>X</Text></PixelCard>).UNSAFE_getAllByType(View);
    const contentView = allViews.find(v => v.props.style && v.props.style.backgroundColor === '#ff0000');
    expect(contentView).toBeTruthy();
  });
});
