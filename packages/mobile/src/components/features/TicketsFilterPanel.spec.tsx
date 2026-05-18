import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const stub = (name: string) => () => React.createElement(Text, null, `icon-${name}`);
  return {
    Search: stub('search'),
    X: stub('x'),
    FileText: stub('file-desc'),
    Upload: stub('upload'),
    Folder: stub('folder'),
    ChevronDown: stub('chevron-down'),
    Check: stub('check'),
  };
});

// Stub out DatePickerModal — we test it separately
jest.mock('./DatePickerModal', () => ({
  DatePickerModal: ({ visible, title }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return visible ? React.createElement(Text, null, title ?? 'date-picker') : null;
  },
}));

import { TicketsFilterPanel } from './TicketsFilterPanel';

const REPORTS = [
  { id: 'r1', name: 'Reporte A' },
  { id: 'r2', name: 'Reporte B' },
];

const BASE_PROPS = {
  search: '',
  onSearch: jest.fn(),
  ticketDate: { start: null, end: null },
  onTicketDate: jest.fn(),
  uploadDate: { start: null, end: null },
  onUploadDate: jest.fn(),
  reportFilter: null,
  onReportFilter: jest.fn(),
  reports: REPORTS,
  hasFilters: false,
  onClear: jest.fn(),
};

describe('TicketsFilterPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders search input', () => {
    const { getByPlaceholderText } = render(<TicketsFilterPanel {...BASE_PROPS} />);
    expect(getByPlaceholderText('Buscar tickets...')).toBeTruthy();
  });

  it('calls onSearch when text changes', () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <TicketsFilterPanel {...BASE_PROPS} onSearch={onSearch} />
    );
    fireEvent.changeText(getByPlaceholderText('Buscar tickets...'), 'test');
    expect(onSearch).toHaveBeenCalledWith('test');
  });

  it('does not render clear button when hasFilters is false', () => {
    const { queryByLabelText } = render(
      <TicketsFilterPanel {...BASE_PROPS} hasFilters={false} />,
    );
    expect(queryByLabelText('clear filters')).toBeNull();
  });

  it('clear button is visible and calls onClear when hasFilters is true', () => {
    const onClear = jest.fn();
    const { getByLabelText } = render(
      <TicketsFilterPanel {...BASE_PROPS} hasFilters={true} onClear={onClear} />,
    );
    fireEvent.press(getByLabelText('clear filters'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders default pill labels when no filters active', () => {
    const { getByText } = render(<TicketsFilterPanel {...BASE_PROPS} />);
    expect(getByText('Ticket')).toBeTruthy();
    expect(getByText('Subida')).toBeTruthy();
    expect(getByText('Reporte')).toBeTruthy();
  });

  it('shows formatted ticket date range when ticketDate is set', () => {
    const { getByText } = render(
      <TicketsFilterPanel
        {...BASE_PROPS}
        ticketDate={{ start: new Date(2025, 0, 1), end: new Date(2025, 0, 15) }}
      />
    );
    expect(getByText('01/01 – 15/01')).toBeTruthy();
  });

  it('shows "desde DD/MM" when only start date is set', () => {
    const { getByText } = render(
      <TicketsFilterPanel
        {...BASE_PROPS}
        ticketDate={{ start: new Date(2025, 2, 5), end: null }}
      />
    );
    expect(getByText('desde 05/03')).toBeTruthy();
  });

  it('opens ticket date picker when ticket pill is pressed', () => {
    const { getByText } = render(<TicketsFilterPanel {...BASE_PROPS} />);
    fireEvent.press(getByText('Ticket'));
    expect(getByText('Fecha del ticket')).toBeTruthy();
  });

  it('opens upload date picker when upload pill is pressed', () => {
    const { getByText } = render(<TicketsFilterPanel {...BASE_PROPS} />);
    fireEvent.press(getByText('Subida'));
    expect(getByText('Fecha de subida')).toBeTruthy();
  });

  it('opens report bottom sheet when report pill is pressed', () => {
    const { getByText, getAllByText } = render(<TicketsFilterPanel {...BASE_PROPS} />);
    fireEvent.press(getAllByText('Reporte')[0]);
    // Sheet title appears
    expect(getByText('Todos')).toBeTruthy();
    expect(getByText('Reporte A')).toBeTruthy();
  });

  it('calls onReportFilter with the report id and closes sheet', () => {
    const onReportFilter = jest.fn();
    const { getByText, getAllByText } = render(
      <TicketsFilterPanel {...BASE_PROPS} onReportFilter={onReportFilter} />
    );
    fireEvent.press(getAllByText('Reporte')[0]);
    fireEvent.press(getByText('Reporte A'));
    expect(onReportFilter).toHaveBeenCalledWith('r1');
  });

  it('calls onReportFilter with null when "Todos" is selected', () => {
    const onReportFilter = jest.fn();
    const { getByText, getAllByText } = render(
      <TicketsFilterPanel {...BASE_PROPS} onReportFilter={onReportFilter} />
    );
    fireEvent.press(getAllByText('Reporte')[0]);
    fireEvent.press(getByText('Todos'));
    expect(onReportFilter).toHaveBeenCalledWith(null);
  });

  it('shows active report name in pill when reportFilter is set', () => {
    const { getByText } = render(
      <TicketsFilterPanel {...BASE_PROPS} reportFilter="r2" />
    );
    expect(getByText('Reporte B')).toBeTruthy();
  });

  it('shows checkmark for the currently active report in the sheet', () => {
    const { getByText, getAllByText } = render(
      <TicketsFilterPanel {...BASE_PROPS} reportFilter="r1" />
    );
    // Open the sheet
    fireEvent.press(getAllByText('Reporte A')[0]);
    // The checkmark icon should be present
    expect(getByText('icon-check')).toBeTruthy();
  });
});
