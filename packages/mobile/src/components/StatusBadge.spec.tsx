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
    { status: 'CREATED',   label: 'CREADO' },
    { status: 'SUBMITTED', label: 'ENVIADO' },
    { status: 'APPROVED',  label: 'APROBADO' },
    { status: 'REJECTED',  label: 'RECHAZADO' },
    { status: 'DECLINED',  label: 'DECLINADO' },
    { status: 'PENDING',   label: 'PENDIENTE' },
    { status: 'PAID',      label: 'PAGADO' },
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
    expect(getByText('APROBADO')).toBeTruthy();
  });
});
