import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const stub = (name: string) => {
    const C = ({ children }: any) => React.createElement(View, null, children);
    C.displayName = name;
    return C;
  };
  return {
    __esModule: true,
    default: stub('Svg'),
    Path: stub('Path'),
    Rect: stub('Rect'),
    G: stub('G'),
  };
});

jest.mock('../ui/Card', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    Card: ({ children }: any) => React.createElement(View, null, children),
  };
});

import { ScanningOverlay } from './ScanningOverlay';

describe('ScanningOverlay', () => {
  it('renders the loading subtitle when visible', () => {
    const { getByText } = render(<ScanningOverlay visible={true} />);
    expect(getByText(/Extrayendo/)).toBeTruthy();
  });

  it('renders the translated title key when visible', () => {
    const { getByText } = render(<ScanningOverlay visible={true} />);
    expect(getByText('reportDetail.scanTicket')).toBeTruthy();
  });

  it('renders nothing when NOT visible', () => {
    const { queryByText } = render(<ScanningOverlay visible={false} />);
    expect(queryByText(/Extrayendo/)).toBeNull();
    expect(queryByText('reportDetail.scanTicket')).toBeNull();
  });
});
