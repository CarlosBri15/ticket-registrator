import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PixelInput } from './PixelInput';

describe('PixelInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <PixelInput placeholder="Test Placeholder" />
    );
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('calls onChangeText when text changes', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <PixelInput placeholder="Type here" onChangeText={onChangeText} />
    );
    fireEvent.changeText(getByPlaceholderText('Type here'), 'new text');
    expect(onChangeText).toHaveBeenCalledWith('new text');
  });

  it('updates focus state on focus/blur', () => {
    const onFocus = jest.fn();
    const onBlur = jest.fn();
    const { getByPlaceholderText } = render(
      <PixelInput placeholder="Focus me" onFocus={onFocus} onBlur={onBlur} />
    );
    const input = getByPlaceholderText('Focus me');
    
    fireEvent(input, 'focus');
    expect(onFocus).toHaveBeenCalled();
    
    fireEvent(input, 'blur');
    expect(onBlur).toHaveBeenCalled();
  });
});
