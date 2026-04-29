import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

const renderDialog = (overrides: Partial<React.ComponentProps<typeof ConfirmDialog>> = {}) =>
  render(
    <ConfirmDialog
      icon={<svg data-testid="icon" />}
      title="Are you sure?"
      description="This action cannot be undone"
      onCancel={vi.fn()}
      onConfirm={vi.fn()}
      confirmLabel="Confirm"
      cancelLabel="Cancel"
      {...overrides}
    />,
  );

describe('ConfirmDialog', () => {
  it('renders title, description and labels', () => {
    renderDialog();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('This action cannot be undone')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders the icon', () => {
    renderDialog();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('calls onConfirm when the confirm button is clicked', () => {
    const onConfirm = vi.fn();
    renderDialog({ onConfirm });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderDialog({ onCancel });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the backdrop is clicked', () => {
    const onCancel = vi.fn();
    const { container } = renderDialog({ onCancel });
    const backdrop = container.querySelector('div[class*="modalBackdrop"], div.absolute.inset-0') as HTMLElement | null;
    // fall back: pick first div with onClick handler — first child with onClick is the backdrop
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onCancel).toHaveBeenCalled();
    } else {
      // The backdrop is the second div in the overlay; trigger via the first wrapping div's children
      const overlay = container.firstChild as HTMLElement;
      const inner = overlay.children[0] as HTMLElement;
      fireEvent.click(inner);
      expect(onCancel).toHaveBeenCalled();
    }
  });

  it('disables the confirm button while loading', () => {
    renderDialog({ isLoading: true });
    const confirmBtn = screen.getByRole('button', { name: /confirm/i }) as HTMLButtonElement;
    expect(confirmBtn.disabled).toBe(true);
  });

  it('renders danger variant for destructive actions', () => {
    const { container } = renderDialog({ confirmVariant: 'danger' });
    expect(container.querySelector('.bg-danger')).toBeInTheDocument();
  });

  it('renders primary variant by default', () => {
    const { container } = renderDialog();
    expect(container.querySelector('.bg-brand')).toBeInTheDocument();
  });

  it('renders success variant icon background', () => {
    const { container } = renderDialog({ confirmVariant: 'success' });
    expect(container.querySelector('.bg-success')).toBeInTheDocument();
  });
});
