import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  const defaultProps = {
    title: 'No data',
    description: 'Check back later',
  };

  it('renders title and description', () => {
    const { getByText } = render(<EmptyState {...defaultProps} />);
    expect(getByText('No data')).toBeTruthy();
    expect(getByText('Check back later')).toBeTruthy();
  });

  it('renders icon when provided', () => {
    const icon = { uri: 'https://example.com/icon.png' };
    const { UNSAFE_getByType } = render(<EmptyState {...defaultProps} icon={icon} />);
    const { Image } = require('expo-image');
    const image = UNSAFE_getByType(Image);
    expect(image.props.source).toEqual(icon);
  });

  it('does not render icon when not provided', () => {
    const { UNSAFE_queryByType } = render(<EmptyState {...defaultProps} />);
    const { Image } = require('expo-image');
    expect(UNSAFE_queryByType(Image)).toBeNull();
  });

  it('renders button when buttonLabel and onButtonPress are provided', () => {
    const onButtonPress = jest.fn();
    const { getByText } = render(
      <EmptyState 
        {...defaultProps} 
        buttonLabel="Add New" 
        onButtonPress={onButtonPress} 
      />
    );
    expect(getByText('Add New')).toBeTruthy();
  });

  it('calls onButtonPress when button is pressed', () => {
    const onButtonPress = jest.fn();
    const { getByText } = render(
      <EmptyState 
        {...defaultProps} 
        buttonLabel="Add New" 
        onButtonPress={onButtonPress} 
      />
    );
    fireEvent.press(getByText('Add New'));
    expect(onButtonPress).toHaveBeenCalledTimes(1);
  });

  it('does not render button when buttonLabel is missing', () => {
    const onButtonPress = jest.fn();
    const { queryByText } = render(
      <EmptyState 
        {...defaultProps} 
        onButtonPress={onButtonPress} 
      />
    );
    expect(queryByText('Add New')).toBeNull();
  });

  it('does not render button when onButtonPress is missing', () => {
    const { queryByText } = render(
      <EmptyState 
        {...defaultProps} 
        buttonLabel="Add New" 
      />
    );
    expect(queryByText('Add New')).toBeNull();
  });
});
