import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Alert, AlertError, type AlertVariant } from './Alert';
import { getApiErrorMessage } from '@ticket-registrator/shared';

vi.mock('lucide-react', () => ({
  XCircle:      ({ className }: any) => <svg data-testid="icon-xcircle"      className={className} />,
  CheckCircle2: ({ className }: any) => <svg data-testid="icon-checkcircle2" className={className} />,
  AlertTriangle:({ className }: any) => <svg data-testid="icon-alerttriangle" className={className} />,
  Info:         ({ className }: any) => <svg data-testid="icon-info"          className={className} />,
  X:            () => <svg data-testid="icon-x" />,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => (key === 'common.close' ? 'Cerrar' : key),
    i18n: { language: 'es' },
  }),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Alert — shared behaviour
// ─────────────────────────────────────────────────────────────────────────────

describe('Alert — shared behaviour', () => {
  it('renders the message', () => {
    render(<Alert message="Algo salió mal" />);
    expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
  });

  it('has role="alert" for accessibility', () => {
    render(<Alert message="msg" />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does NOT render dismiss button when onDismiss is absent', () => {
    render(<Alert message="msg" />);
    expect(screen.queryByRole('button', { name: /cerrar/i })).not.toBeInTheDocument();
  });

  it('renders dismiss button when onDismiss is provided', () => {
    render(<Alert message="msg" onDismiss={() => {}} />);
    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<Alert message="msg" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders X icon inside the dismiss button', () => {
    render(<Alert message="msg" onDismiss={() => {}} />);
    expect(screen.getByTestId('icon-x')).toBeInTheDocument();
  });

  it('applies custom className to the container', () => {
    const { container } = render(<Alert message="msg" className="mt-6" />);
    expect(container.firstChild).toHaveClass('mt-6');
  });

  it('sets data-variant attribute on the container', () => {
    render(<Alert variant="success" message="msg" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'success');
  });

  it('defaults variant to "error" when omitted', () => {
    render(<Alert message="msg" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Alert — per-variant rendering
// ─────────────────────────────────────────────────────────────────────────────

const VARIANT_ICONS: Record<AlertVariant, string> = {
  error:   'icon-xcircle',
  success: 'icon-checkcircle2',
  warning: 'icon-alerttriangle',
  info:    'icon-info',
};

describe.each(
  (['error', 'success', 'warning', 'info'] as AlertVariant[]).map((v) => ({ variant: v }))
)('Alert variant="$variant"', ({ variant }) => {
  it('renders the correct icon', () => {
    render(<Alert variant={variant} message="msg" />);
    expect(screen.getByTestId(VARIANT_ICONS[variant])).toBeInTheDocument();
  });

  it('renders the message text', () => {
    render(<Alert variant={variant} message={`Mensaje de ${variant}`} />);
    expect(screen.getByText(`Mensaje de ${variant}`)).toBeInTheDocument();
  });

  it('renders the dismiss button when onDismiss is provided', () => {
    render(<Alert variant={variant} message="msg" onDismiss={() => {}} />);
    expect(screen.getByRole('button', { name: /cerrar/i })).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AlertError alias
// ─────────────────────────────────────────────────────────────────────────────

describe('AlertError', () => {
  it('renders with variant="error" by default', () => {
    render(<AlertError message="Error" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-variant', 'error');
  });

  it('renders the XCircle icon', () => {
    render(<AlertError message="Error" />);
    expect(screen.getByTestId('icon-xcircle')).toBeInTheDocument();
  });

  it('renders the message', () => {
    render(<AlertError message="Email ya existe" />);
    expect(screen.getByText('Email ya existe')).toBeInTheDocument();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<AlertError message="Error" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /cerrar/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getApiErrorMessage
// ─────────────────────────────────────────────────────────────────────────────

describe('getApiErrorMessage', () => {
  it('returns fallback when error is null', () => {
    expect(getApiErrorMessage(null)).toBe('Unexpected error. Please try again.');
  });

  it('returns fallback when error has no response.data', () => {
    expect(getApiErrorMessage(new Error('network'))).toBe('Unexpected error. Please try again.');
  });

  it('returns string message from response.data.message', () => {
    const error = { response: { data: { message: 'Email already exists' } } };
    expect(getApiErrorMessage(error)).toBe('Email already exists');
  });

  it('joins array message from response.data.message', () => {
    const error = { response: { data: { message: ['name is too short', 'email is invalid'] } } };
    expect(getApiErrorMessage(error)).toBe('name is too short. email is invalid');
  });

  it('returns fallback when response.data.message is a number', () => {
    const error = { response: { data: { message: 42 } } };
    expect(getApiErrorMessage(error)).toBe('Unexpected error. Please try again.');
  });

  it('returns fallback when response.data exists but has no message key', () => {
    const error = { response: { data: { statusCode: 500 } } };
    expect(getApiErrorMessage(error)).toBe('Unexpected error. Please try again.');
  });

  it('returns fallback for empty error object', () => {
    expect(getApiErrorMessage({})).toBe('Unexpected error. Please try again.');
  });
});
