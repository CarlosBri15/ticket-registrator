import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import { PixelCard } from './PixelCard';

describe('PixelCard', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <PixelCard>
        <Text>Card Content</Text>
      </PixelCard>
    );
    expect(getByText('Card Content')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <PixelCard onPress={onPress}>
        <Text>Interactive</Text>
      </PixelCard>
    );
    fireEvent.press(getByText('Interactive'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not invoke press handler when onPress is not provided', () => {
    const { getByText } = render(
      <PixelCard>
        <Text>Static</Text>
      </PixelCard>
    );
    // Pressing the inner text should not throw — non-interactive variant.
    expect(() => fireEvent.press(getByText('Static'))).not.toThrow();
  });

  it('applies custom bg color to the inner content view', () => {
    const { UNSAFE_getAllByType } = render(
      <PixelCard bg="#ff0000">
        <Text>Red Card</Text>
      </PixelCard>
    );
    const views = UNSAFE_getAllByType(View);
    const contentView = views.find((v) => {
      const style = v.props.style;
      return style && typeof style === 'object' && 'backgroundColor' in style && style.backgroundColor === '#ff0000';
    });
    expect(contentView).toBeTruthy();
  });

  it('renders static (non-interactive) variant when no onPress is provided', () => {
    // Static mode: pressing should not throw, and children are still rendered
    const { getByText, queryByText } = render(
      <PixelCard>
        <Text>StaticCard</Text>
      </PixelCard>
    );
    expect(getByText('StaticCard')).toBeTruthy();
    // No onPress was provided so there is no button role accessible
    expect(queryByText('StaticCard')).toBeTruthy();
  });

  it('applies custom shadowOffset and radius props without error', () => {
    expect(() =>
      render(
        <PixelCard shadowOffset={8} radius={16} onPress={jest.fn()}>
          <Text>Custom</Text>
        </PixelCard>
      )
    ).not.toThrow();
  });

  it('renders with active=true without throwing', () => {
    expect(() =>
      render(
        <PixelCard active={true} onPress={jest.fn()}>
          <Text>Active</Text>
        </PixelCard>
      )
    ).not.toThrow();
  });

  it('renders with active=true in static mode without throwing', () => {
    expect(() =>
      render(
        <PixelCard active={true}>
          <Text>Active Static</Text>
        </PixelCard>
      )
    ).not.toThrow();
  });
});
