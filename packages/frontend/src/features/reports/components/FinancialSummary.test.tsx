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
  it('renders the requested amount line', () => {
    render(<FinancialSummary {...baseProps} />);
    expect(screen.getByText('SOLICITADO')).toBeInTheDocument();
    expect(screen.getByText('100.00 EUR')).toBeInTheDocument();
  });

  it('uses ticketsTotal as headline when status is not approved or declined', () => {
    render(<FinancialSummary {...baseProps} status="CREATED" ticketsTotal={95} />);
    expect(screen.getByText('95.00')).toBeInTheDocument();
    expect(screen.getByText('reportDetail.financialSummary')).toBeInTheDocument();
  });

  it('uses approvedAmount as headline when status is APPROVED', () => {
    render(<FinancialSummary {...baseProps} status="APPROVED" approvedAmount={80} />);
    expect(screen.getByText('80.00')).toBeInTheDocument();
    expect(screen.getByText('reportDetail.approved')).toBeInTheDocument();
  });

  it('uses approvedAmount as headline when status is PAID', () => {
    render(<FinancialSummary {...baseProps} status="PAID" approvedAmount={80} />);
    expect(screen.getByText('80.00')).toBeInTheDocument();
    expect(screen.getByText('reportDetail.approved')).toBeInTheDocument();
  });

  it('uses requestedAmount as headline when status is DECLINED', () => {
    render(<FinancialSummary {...baseProps} status="DECLINED" requestedAmount={100} />);
    expect(screen.getByText('100.00')).toBeInTheDocument();
  });

  it('renders APROBADO and RECHAZADO breakdown when approved with rejection', () => {
    render(
      <FinancialSummary
        {...baseProps}
        status="APPROVED"
        requestedAmount={100}
        approvedAmount={70}
      />,
    );
    expect(screen.getByText('APROBADO')).toBeInTheDocument();
    expect(screen.getByText('70.00 EUR')).toBeInTheDocument();
    expect(screen.getByText('RECHAZADO')).toBeInTheDocument();
    expect(screen.getByText('30.00 EUR')).toBeInTheDocument();
  });

  it('does not render RECHAZADO when approved equals requested (no rejection)', () => {
    render(
      <FinancialSummary
        {...baseProps}
        status="APPROVED"
        requestedAmount={100}
        approvedAmount={100}
      />,
    );
    expect(screen.queryByText('RECHAZADO')).not.toBeInTheDocument();
    expect(screen.getByText('APROBADO')).toBeInTheDocument();
  });

  it('does not render APROBADO/RECHAZADO when status is not APPROVED', () => {
    render(<FinancialSummary {...baseProps} status="DECLINED" />);
    expect(screen.queryByText('APROBADO')).not.toBeInTheDocument();
    expect(screen.queryByText('RECHAZADO')).not.toBeInTheDocument();
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
    expect(screen.queryByText('RECHAZADO')).not.toBeInTheDocument();
  });
});
