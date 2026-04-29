import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'es' } }),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useCreateReportMutation: vi.fn(),
  };
});

vi.mock('../../../components/ui/DatePicker', () => ({
  DatePicker: ({ label, value, onChange, error }: any) => (
    <div data-testid={`date-${label}`}>
      <label>{label}</label>
      <input
        data-testid={`date-input-${label}`}
        value={value ? value.toISOString().split('T')[0] : ''}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : undefined)}
      />
      {error && <span data-testid={`date-error-${label}`}>{error}</span>}
    </div>
  ),
}));

vi.mock('./ReportTypeSelect', () => ({
  ReportTypeSelect: ({ label, value, onChange, error }: any) => (
    <div>
      <label>{label}</label>
      <select aria-label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="">--</option>
        <option value="business">Business</option>
        <option value="training">Training</option>
      </select>
      {error && <span data-testid="type-error">{error}</span>}
    </div>
  ),
}));

vi.mock('../../settings/components/CurrencySelect', () => ({
  CurrencySelect: ({ label, value, onChange }: any) => (
    <div>
      <label>{label}</label>
      <select aria-label={label} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        <option value="EUR">EUR</option>
        <option value="USD">USD</option>
      </select>
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  AlertCircle: () => <span data-testid="alert-icon" />,
}));

import { useCreateReportMutation } from '@ticket-registrator/shared';
import { ReportForm } from './ReportForm';

describe('ReportForm', () => {
  let mutate: ReturnType<typeof vi.fn>;
  let capturedSuccess: (() => void) | undefined;
  let capturedError: ((e: any) => void) | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    mutate = vi.fn();
    capturedSuccess = undefined;
    capturedError = undefined;
    (useCreateReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
      capturedSuccess = opts?.onSuccess;
      capturedError = opts?.onError;
      return { mutate, isPending: false };
    });
  });

  const renderForm = (overrides: Partial<React.ComponentProps<typeof ReportForm>> = {}) => {
    const props = { onSuccess: vi.fn(), onCancel: vi.fn(), ...overrides };
    return { props, ...render(<ReportForm {...props} />) };
  };

  it('renders the name input, date pickers, currency and type selects', () => {
    renderForm();
    expect(screen.getByPlaceholderText('trips.namePlaceholder')).toBeInTheDocument();
    expect(screen.getByTestId('date-trips.startLabel')).toBeInTheDocument();
    expect(screen.getByTestId('date-trips.endLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('trips.currencyLabel')).toBeInTheDocument();
    expect(screen.getByLabelText('trips.categoryLabel')).toBeInTheDocument();
  });

  it('renders the cancel and submit buttons', () => {
    renderForm();
    expect(screen.getByRole('button', { name: 'common.cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'trips.saveButton' })).toBeInTheDocument();
  });

  it('fires onCancel when the cancel button is clicked', () => {
    const { props } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(props.onCancel).toHaveBeenCalled();
  });

  it('disables the submit button while pending', () => {
    (useCreateReportMutation as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
    });
    renderForm();
    const submit = screen.getByRole('button', { name: 'trips.saveButton' }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
  });

  it('calls createReport with the form values when valid data is submitted', async () => {
    renderForm();
    fireEvent.change(screen.getByPlaceholderText('trips.namePlaceholder'), {
      target: { value: 'Trip to Madrid' },
    });
    fireEvent.change(screen.getByTestId('date-input-trips.startLabel'), {
      target: { value: '2024-05-01' },
    });
    fireEvent.change(screen.getByTestId('date-input-trips.endLabel'), {
      target: { value: '2024-05-10' },
    });
    fireEvent.change(screen.getByLabelText('trips.categoryLabel'), {
      target: { value: 'business' },
    });

    const form = screen.getByRole('button', { name: 'trips.saveButton' }).closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(mutate).toHaveBeenCalled();
    const arg = mutate.mock.calls[0][0];
    expect(arg.name).toBe('Trip to Madrid');
    expect(arg.type).toBe('business');
    expect(arg.currency).toBe('EUR');
  });

  it('does not call createReport when form is invalid', async () => {
    renderForm();
    const form = screen.getByRole('button', { name: 'trips.saveButton' }).closest('form')!;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('calls onSuccess on mutation success', () => {
    const { props } = renderForm();
    capturedSuccess?.();
    expect(props.onSuccess).toHaveBeenCalled();
  });

  it('renders an API error banner when mutation onError fires', () => {
    renderForm();
    act(() => {
      capturedError?.({ response: { data: { message: 'Server exploded' } } });
    });
    expect(screen.getByText('Server exploded')).toBeInTheDocument();
    expect(screen.getByTestId('alert-icon')).toBeInTheDocument();
  });

  it('falls back to a translated message when the error response has no message', () => {
    renderForm();
    act(() => {
      capturedError?.({});
    });
    expect(screen.getByText('trips.createError')).toBeInTheDocument();
  });
});
