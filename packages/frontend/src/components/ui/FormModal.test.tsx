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
  AlertError: ({ message }: any) => <div data-testid="alert-error">{message}</div>,
  getApiErrorMessage: (error: any) => error?.message || 'Generic error',
}));

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
});
