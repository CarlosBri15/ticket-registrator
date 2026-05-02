import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormModal } from './FormModal';

vi.mock('./Modal', () => ({
  Modal: ({ children, isOpen, title }: any) => {
    if (!isOpen) return null;
    return (
      <div data-testid="modal">
        <h2>{title}</h2>
        {children}
      </div>
    );
  },
}));

vi.mock('./Button', () => ({
  Button: ({ children, onClick, type, disabled, isLoading }: any) => (
    <button onClick={onClick} type={type} disabled={disabled || isLoading}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

vi.mock('./Alert', () => ({
  AlertError: ({ message, onDismiss }: any) => (
    <div data-testid="alert-error">
      <span>{message}</span>
      {onDismiss ? <button onClick={onDismiss} aria-label="Cerrar">×</button> : null}
    </div>
  ),
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    getApiErrorMessage: (error: any) => error?.message || 'Generic error',
  };
});

describe('FormModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  it('renders modal with content when isOpen is true', () => {
    render(
      <FormModal
        isOpen={true}
        onClose={mockOnClose}
        title="Mi Form"
        onSubmit={mockOnSubmit}
        submitLabel="Enviar"
      >
        <p>Hijo</p>
      </FormModal>
    );
    expect(screen.getByText('Mi Form')).toBeInTheDocument();
    expect(screen.getByText('Hijo')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(
      <FormModal
        isOpen={true}
        onClose={mockOnClose}
        title="Mi Form"
        onSubmit={mockOnSubmit}
        submitLabel="Enviar"
      >
        <input data-testid="inp" />
      </FormModal>
    );
    fireEvent.submit(screen.getByRole('button', { name: 'Enviar' }).closest('form')!);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('shows loading state on submit button', () => {
    render(
      <FormModal
        isOpen={true}
        onClose={mockOnClose}
        title="Mi Form"
        onSubmit={mockOnSubmit}
        submitLabel="Enviar"
        isPending={true}
      >
        <p>Hijo</p>
      </FormModal>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error message if error prop is provided', () => {
    render(
      <FormModal
        isOpen={true}
        onClose={mockOnClose}
        title="Mi Form"
        onSubmit={mockOnSubmit}
        submitLabel="Enviar"
        error={{ message: 'Fallo fatal' }}
      >
        <p>Hijo</p>
      </FormModal>
    );
    expect(screen.getByTestId('alert-error')).toHaveTextContent('Fallo fatal');
  });

  it('forwards onErrorDismiss to the AlertError dismiss button', () => {
    const onErrorDismiss = vi.fn();
    render(
      <FormModal
        isOpen={true}
        onClose={mockOnClose}
        title="Mi Form"
        onSubmit={mockOnSubmit}
        submitLabel="Enviar"
        error={{ message: 'Fallo fatal' }}
        onErrorDismiss={onErrorDismiss}
      >
        <p>Hijo</p>
      </FormModal>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onErrorDismiss).toHaveBeenCalledTimes(1);
  });

  it('uses custom cancelLabel when provided', () => {
    render(
      <FormModal
        isOpen={true}
        onClose={mockOnClose}
        title="Mi Form"
        onSubmit={mockOnSubmit}
        submitLabel="Enviar"
        cancelLabel="Volver"
      >
        <p>Hijo</p>
      </FormModal>
    );
    expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
  });
});
