import React from 'react';
import { render } from '@testing-library/react-native';
import { ScanningOverlay } from './ScanningOverlay';

// Mock reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  const Svg = ({ children }: any) => React.createElement('Svg', {}, children);
  Svg.Path = () => React.createElement('Path');
  Svg.Rect = () => React.createElement('Rect');
  Svg.G = ({ children }: any) => React.createElement('G', {}, children);
  return {
    default: Svg,
    Path: Svg.Path,
    Rect: Svg.Rect,
    G: Svg.G,
  };
});

describe('ScanningOverlay', () => {
  it('renders correctly when visible', () => {
    const { getByText } = render(<ScanningOverlay visible={true} />);
    expect(getByText(/Extrayendo/)).toBeTruthy();
  });

  it('renders nothing when NOT visible', () => {
    const { queryByText } = render(<ScanningOverlay visible={false} />);
    expect(queryByText(/Extrayendo/)).toBeNull();
  });
});
