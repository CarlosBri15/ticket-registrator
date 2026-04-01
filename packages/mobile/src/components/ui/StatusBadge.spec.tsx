import React from 'react';
import { render } from '@testing-library/react-native';
import { StatusBadge } from './StatusBadge';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        'status.CREATED':   'Creado',
        'status.SUBMITTED': 'Enviado',
        'status.APPROVED':  'Aprobado',
        'status.REJECTED':  'Rechazado',
        'status.DECLINED':  'Declinado',
        'status.PENDING':   'Pendiente',
        'status.PAID':      'Pagado',
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
  }),
}));

describe('StatusBadge', () => {
  const cases = [
    { status: 'CREATED',   label: 'Creado' },
    { status: 'SUBMITTED', label: 'Enviado' },
    { status: 'APPROVED',  label: 'Aprobado' },
    { status: 'REJECTED',  label: 'Rechazado' },
    { status: 'DECLINED',  label: 'Declinado' },
    { status: 'PENDING',   label: 'Pendiente' },
    { status: 'PAID',      label: 'Pagado' },
  ];

  it.each(cases)('renders "$status" with correct label', ({ status, label }) => {
    const { getByText } = render(<StatusBadge status={status} />);
    expect(getByText(label)).toBeTruthy();
  });

  it('falls back to DRAFT style for unknown status', () => {
    const { getByText } = render(<StatusBadge status="UNKNOWN" />);
    expect(getByText('UNKNOWN')).toBeTruthy();
  });

  it('is case-insensitive', () => {
    const { getByText } = render(<StatusBadge status="approved" />);
    expect(getByText('Aprobado')).toBeTruthy();
  });
});
