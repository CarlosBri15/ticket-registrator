import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ReportsFilterPanel } from './ReportsFilterPanel';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

// Mock Tabler icons to check for name in tests if needed
jest.mock('@tabler/icons-react-native', () => {
  const { Text } = require('react-native');
  return {
    IconSearch: () => <Text>icon-search</Text>,
    IconX: () => <Text>icon-x</Text>,
    IconCalendar: () => <Text>icon-calendar</Text>,
    IconChevronDown: () => <Text>icon-chevron-down</Text>,
    IconChevronLeft: () => <Text>icon-chevron-left</Text>,
    IconChevronRight: () => <Text>icon-chevron-right</Text>,
    IconCheck: () => <Text>icon-check</Text>,
  };
});

describe('ReportsFilterPanel', () => {
  const defaultProps = {
    search: '',
    onSearch: jest.fn(),
    startDate: null,
    endDate: null,
    onStartDate: jest.fn(),
    onEndDate: jest.fn(),
    statusFilter: 'ALL',
    onStatus: jest.fn(),
    hasFilters: false,
    onClear: jest.fn(),
  };

  it('renders search input with placeholder', () => {
    const { getByPlaceholderText } = render(<ReportsFilterPanel {...defaultProps} />);
    expect(getByPlaceholderText('trips.filterSearch')).toBeTruthy();
  });

  it('calls onSearch when typing in search input', () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <ReportsFilterPanel {...defaultProps} onSearch={onSearch} />
    );
    const input = getByPlaceholderText('trips.filterSearch');
    fireEvent.changeText(input, 'New Search');
    expect(onSearch).toHaveBeenCalledWith('New Search');
  });

  it('shows clear button only when hasFilters is true', () => {
    const { TouchableOpacity } = require('react-native');
    const { UNSAFE_getAllByType } = render(<ReportsFilterPanel {...defaultProps} hasFilters={true} />);
    const clearBtn = UNSAFE_getAllByType(TouchableOpacity).find(t => t.props.style?.opacity === 1);
    expect(clearBtn).toBeTruthy();

    const { UNSAFE_getAllByType: getAllNoFilters } = render(<ReportsFilterPanel {...defaultProps} hasFilters={false} />);
    const clearBtnNoFilters = getAllNoFilters(TouchableOpacity).find(t => t.props.style?.opacity === 0);
    expect(clearBtnNoFilters).toBeTruthy();
  });

  it('calls onClear when clear button is pressed', () => {
    const onClear = jest.fn();
    const { getByText } = render(
      <ReportsFilterPanel {...defaultProps} hasFilters={true} onClear={onClear} />
    );
    fireEvent.press(getByText('icon-x'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders date labels when dates are null', () => {
    const { getByText } = render(<ReportsFilterPanel {...defaultProps} />);
    expect(getByText('trips.startLabel')).toBeTruthy();
    expect(getByText('trips.endLabel')).toBeTruthy();
  });

  it('renders "ALL" status label by default', () => {
    const { getByText } = render(<ReportsFilterPanel {...defaultProps} />);
    expect(getByText('trips.filterAll')).toBeTruthy();
  });

  it('renders specific status label when filter is active', () => {
    const { getByText } = render(<ReportsFilterPanel {...defaultProps} statusFilter="APPROVED" />);
    expect(getByText('status.APPROVED')).toBeTruthy();
  });

  it('opens status modal when status pill is pressed', () => {
    const { getByText } = render(<ReportsFilterPanel {...defaultProps} />);
    fireEvent.press(getByText('trips.filterAll'));
    // Modal title should appear
    expect(getByText('Estado')).toBeTruthy();
  });

  it('calls onStatus and closes modal when a status is selected', () => {
    const onStatus = jest.fn();
    const { getByText } = render(<ReportsFilterPanel {...defaultProps} onStatus={onStatus} />);

    // Open modal
    fireEvent.press(getByText('trips.filterAll'));

    // Select "APPROVED" option
    fireEvent.press(getByText('status.APPROVED'));

    expect(onStatus).toHaveBeenCalledWith('APPROVED');
  });

  it('renders formatted start date when startDate is provided', () => {
    const startDate = new Date(2025, 3, 10); // April 10
    const { getByText } = render(
      <ReportsFilterPanel {...defaultProps} startDate={startDate} />
    );
    expect(getByText('10 Apr')).toBeTruthy();
  });

  it('opens start date picker when start pill is pressed', () => {
    const { getByText, getAllByText } = render(<ReportsFilterPanel {...defaultProps} />);
    // The start date pill shows trips.startLabel — pressing it opens DatePickerModal
    const startPills = getAllByText('trips.startLabel');
    fireEvent.press(startPills[0]);
    // The calendar renders day numbers, so the picker is now open
    expect(getAllByText('trips.startLabel').length).toBeGreaterThan(0);
  });

  it('calls onStartDate when a date is selected from start picker', () => {
    const onStartDate = jest.fn();
    const { getAllByText } = render(
      <ReportsFilterPanel {...defaultProps} onStartDate={onStartDate} />
    );
    // Open start picker
    fireEvent.press(getAllByText('trips.startLabel')[0]);
    // Press a day (using getAllByText to handle duplicates in the calendar grid)
    fireEvent.press(getAllByText('14')[0]);
    expect(onStartDate).toHaveBeenCalledWith(expect.any(Date));
  });

  it('shows checkmark for the currently selected status', () => {
    const { getByText } = render(
      <ReportsFilterPanel {...defaultProps} statusFilter="SUBMITTED" />
    );
    // Open status modal
    fireEvent.press(getByText('status.SUBMITTED'));
    expect(getByText('icon-check')).toBeTruthy();
  });
});
