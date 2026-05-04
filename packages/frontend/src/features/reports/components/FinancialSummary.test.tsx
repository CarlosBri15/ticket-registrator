import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { FinancialSummary } from './FinancialSummary';

const baseProps = {
  status: 'CREATED',
  currency: 'EUR',
  requestedAmount: 100,
  approvedAmount: 80,
  ticketsTotal: 95,
};

describe('FinancialSummary', () => {
  it('renders the requested row', () => {
    render(<FinancialSummary {...baseProps} />);
    expect(screen.getByText('reportDetail.requested')).toBeInTheDocument();
  });

  it('uses ticketsTotal as the headline amount when present', () => {
    render(<FinancialSummary {...baseProps} status="CREATED" ticketsTotal={95} />);
    expect(screen.getByText('95.00 EUR')).toBeInTheDocument();
  });

  it('falls back to requestedAmount when ticketsTotal is zero', () => {
    render(<FinancialSummary {...baseProps} status="CREATED" ticketsTotal={0} requestedAmount={120} />);
    expect(screen.getByText('120.00 EUR')).toBeInTheDocument();
  });

  it('renders approved row with success styling when status is APPROVED', () => {
    render(<FinancialSummary {...baseProps} status="APPROVED" approvedAmount={80} />);
    expect(screen.getByText('reportDetail.approved')).toBeInTheDocument();
    expect(screen.getByText('80.00 EUR')).toBeInTheDocument();
  });

  it('renders approved row when status is PAID', () => {
    render(<FinancialSummary {...baseProps} status="PAID" approvedAmount={80} />);
    expect(screen.getByText('reportDetail.approved')).toBeInTheDocument();
  });

  it('renders rejected row with negative sign when approved < requested', () => {
    render(
      <FinancialSummary
        {...baseProps}
        status="APPROVED"
        requestedAmount={100}
        approvedAmount={70}
        ticketsTotal={100}
      />,
    );
    expect(screen.getByText('reportDetail.rejected')).toBeInTheDocument();
    expect(screen.getByText('−30.00 EUR')).toBeInTheDocument();
  });

  it('does not render rejected row when approved equals requested', () => {
    render(
      <FinancialSummary
        {...baseProps}
        status="APPROVED"
        requestedAmount={100}
        approvedAmount={100}
      />,
    );
    expect(screen.queryByText('reportDetail.rejected')).not.toBeInTheDocument();
  });

  it('does not render approved row when status is not approved/paid', () => {
    render(<FinancialSummary {...baseProps} status="DECLINED" />);
    expect(screen.queryByText('reportDetail.approved')).not.toBeInTheDocument();
    expect(screen.queryByText('reportDetail.rejected')).not.toBeInTheDocument();
  });

  it('clamps rejected to 0 when approved exceeds requested', () => {
    render(
      <FinancialSummary
        {...baseProps}
        status="APPROVED"
        requestedAmount={50}
        approvedAmount={80}
      />,
    );
    expect(screen.queryByText('reportDetail.rejected')).not.toBeInTheDocument();
  });
});
