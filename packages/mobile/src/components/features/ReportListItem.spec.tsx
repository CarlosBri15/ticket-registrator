import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HeroReportCard, PendingReportCard, HistoryRow } from './ReportListItem';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockReport = {
  id: '1',
  name: 'Viaje a Madrid',
  status: 'SUBMITTED',
  start_date: '2024-03-01T00:00:00.000Z',
  end_date: '2024-03-05T00:00:00.000Z',
  requested_amount: 150.5,
  approved_amount: 140.0,
  currency: 'EUR',
};

describe('ReportListItem components', () => {
  describe('HeroReportCard', () => {
    it('renders report info correctly', () => {
      const { getByText } = render(
        <HeroReportCard report={mockReport} onPress={jest.fn()} />
      );
      expect(getByText('Viaje a Madrid')).toBeTruthy();
      expect(getByText(/150[.,]5/)).toBeTruthy();
      expect(getByText('EUR')).toBeTruthy();
      expect(getByText('En curso')).toBeTruthy();
    });

    it('calls onPress when clicked', () => {
      const onPress = jest.fn();
      const { getByText } = render(
        <HeroReportCard report={mockReport} onPress={onPress} />
      );
      fireEvent.press(getByText('Viaje a Madrid'));
      expect(onPress).toHaveBeenCalled();
    });
  });

  describe('PendingReportCard', () => {
    it('renders report info and status badge', () => {
      const { getByText } = render(
        <PendingReportCard report={mockReport} onPress={jest.fn()} />
      );
      expect(getByText('Viaje a Madrid')).toBeTruthy();
      expect(getByText(/150[.,]5/)).toBeTruthy();
      // StatusBadge text
      expect(getByText('status.SUBMITTED')).toBeTruthy();
    });
  });

  describe('HistoryRow', () => {
    it('renders approved amount if present', () => {
      const { getByText } = render(
        <HistoryRow report={mockReport} onPress={jest.fn()} />
      );
      expect(getByText(/140/)).toBeTruthy();
    });
  });
});
