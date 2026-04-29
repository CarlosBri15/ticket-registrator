import React from 'react';
import { render } from '@testing-library/react-native';
import { PixelField } from './PixelField';
import { Text } from 'react-native';

describe('PixelField', () => {
  it('renders label and children correctly', () => {
    const { getByText } = render(
      <PixelField label="Field Label">
        <Text>Field Content</Text>
      </PixelField>
    );
    expect(getByText('Field Label')).toBeTruthy();
    expect(getByText('Field Content')).toBeTruthy();
  });
});
