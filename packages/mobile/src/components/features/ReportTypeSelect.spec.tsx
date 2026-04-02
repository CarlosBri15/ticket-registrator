import React from 'react';
import { render } from '@testing-library/react-native';
import { ReportTypeSelect } from './ReportTypeSelect';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Select to ensure we're testing ReportTypeSelect's logic
jest.mock('../ui/Select', () => {
  const { View, Text } = require('react-native');
  return {
    Select: (props: any) => (
      <View>
        <Text>{props.label}</Text>
        <Text>{props.placeholder}</Text>
        {props.options.map((opt: any) => (
          <Text key={opt.value}>{opt.label}</Text>
        ))}
      </View>
    ),
  };
});

describe('ReportTypeSelect', () => {
  it('renders with default label and placeholder from translation', () => {
    const { getByText } = render(
      <ReportTypeSelect value="" onChange={jest.fn()} />
    );
    expect(getByText('trips.categoryLabel')).toBeTruthy();
    expect(getByText('trips.categoryPlaceholder')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { getByText } = render(
      <ReportTypeSelect value="" onChange={jest.fn()} label="Custom Report Label" />
    );
    expect(getByText('Custom Report Label')).toBeTruthy();
  });

  it('renders all report type options from translation keys', () => {
    const { getByText } = render(
      <ReportTypeSelect value="" onChange={jest.fn()} />
    );
    // Keys defined in ReportTypeSelect.tsx
    expect(getByText('trips.typeBusinessTrip')).toBeTruthy();
    expect(getByText('trips.typeTraining')).toBeTruthy();
    expect(getByText('trips.typeConference')).toBeTruthy();
    expect(getByText('trips.typeClient')).toBeTruthy();
    expect(getByText('trips.typeProject')).toBeTruthy();
    expect(getByText('trips.typeOther')).toBeTruthy();
  });
});
