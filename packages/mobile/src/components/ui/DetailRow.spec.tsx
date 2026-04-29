import React from 'react';
import { render } from '@testing-library/react-native';
import { DetailRow } from './DetailRow';

describe('DetailRow', () => {
  it('renders label and value correctly', () => {
    const { getByText } = render(
      <DetailRow label="Test Label" value="Test Value" />
    );
    expect(getByText('Test Label')).toBeTruthy();
    expect(getByText('Test Value')).toBeTruthy();
  });

  it('shows --- for null value', () => {
    const { getByText } = render(
      <DetailRow label="Null Value" value={null} />
    );
    expect(getByText('---')).toBeTruthy();
  });

  it('renders icon if provided', () => {
    const { IconCamera } = require('@tabler/icons-react-native');
    const { UNSAFE_getByType } = render(
      <DetailRow label="Icon Row" value="Value" icon={IconCamera} />
    );
    expect(UNSAFE_getByType(IconCamera)).toBeTruthy();
  });

  it('renders image if provided', () => {
    const { UNSAFE_getByType } = render(
      <DetailRow label="Image Row" value="Value" image={1} />
    );
    const { Image } = require('react-native');
    expect(UNSAFE_getByType(Image)).toBeTruthy();
  });
});
