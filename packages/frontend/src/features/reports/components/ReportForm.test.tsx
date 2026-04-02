import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ReportForm } from './ReportForm';

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useCreateReportMutation: vi.fn(),
  };
});

vi.mock('lucide-react', () => ({
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

vi.mock('./ReportTypeSelect', () => ({
  ReportTypeSelect: ({ label, onChange, value }: any) => (
    <select aria-label={label} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
      <option value="">--</option>
      <option value="trips.typeBusinessTrip">trips.typeBusinessTrip</option>
    </select>
  ),
}));

vi.mock('../../settings/components/CurrencySelect', () => ({
  CurrencySelect: ({ label, onChange, value }: any) => (
    <select aria-label={label} value={value ?? ''} onChange={(e) => onChange?.(e.target.value)}>
      <option value="EUR">EUR</option>
      <option value="USD">USD</option>
    </select>
  ),
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

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ReportForm onSuccess={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByText('common.cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('shows api error message when onError is triggered with response message', () => {
    let capturedOnError: ((error: any) => void) | undefined;
    (useCreateReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnError = opts?.onError;
      return { mutate: vi.fn(), isPending: false };
    });
    render(<ReportForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    act(() => {
      capturedOnError?.({ response: { data: { message: 'Error al crear reporte' } } });
    });
    expect(screen.getByText('Error al crear reporte')).toBeInTheDocument();
  });

  it('shows generic error when onError has no response message', () => {
    let capturedOnError: ((error: any) => void) | undefined;
    (useCreateReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnError = opts?.onError;
      return { mutate: vi.fn(), isPending: false };
    });
    render(<ReportForm onSuccess={vi.fn()} onCancel={vi.fn()} />);
    act(() => {
      capturedOnError?.({});
    });
    expect(screen.getByText('trips.createError')).toBeInTheDocument();
  });

  it('calls onSuccess prop when mutation onSuccess fires', () => {
    let capturedOnSuccess: (() => void) | undefined;
    (useCreateReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate: vi.fn(), isPending: false };
    });
    const onSuccess = vi.fn();
    render(<ReportForm onSuccess={onSuccess} onCancel={vi.fn()} />);
    act(() => { capturedOnSuccess?.(); });
    expect(onSuccess).toHaveBeenCalled();
  });
});
