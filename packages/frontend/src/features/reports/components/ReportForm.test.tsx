import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReportForm } from './ReportForm';

vi.mock('@ticket-registrator/shared', async () => {
  const actual = await vi.importActual<typeof import('@ticket-registrator/shared')>('@ticket-registrator/shared');
  return {
    ...actual,
    useCreateReportMutation: vi.fn(),
  };
});

vi.mock('lucide-react', () => ({
  Banknote: () => null,
  Tag: () => null,
  AlertCircle: () => null,
}));

vi.mock('../../../components/ui/Button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
}));

vi.mock('../../../components/ui/Input', () => ({
  Input: ({ label, ...props }: any) => <input aria-label={label} {...props} />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

import { useCreateReportMutation } from '@ticket-registrator/shared';

describe('ReportForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useCreateReportMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('renders without crashing', () => {
    const { container } = render(<ReportForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeTruthy();
  });

  it('renders trip name input', () => {
    render(<ReportForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByLabelText('trips.nameLabel')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<ReportForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ReportForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('trips.saveButton')).toBeInTheDocument();
  });
});
