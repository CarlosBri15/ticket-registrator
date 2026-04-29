import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { TicketEditForm } from './TicketEditForm';

const baseFormData = {
  location_name: 'Sol',
  location_address: 'Calle 1',
  date: '2024-01-15',
  amount: '25.5',
  currency: 'EUR',
  payment_type: 'CASH',
};

const renderForm = (overrides: Partial<React.ComponentProps<typeof TicketEditForm>> = {}) => {
  const props = {
    formData: baseFormData,
    onChange: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
    isSaving: false,
    ...overrides,
  };
  return { props, ...render(<TicketEditForm {...props} />) };
};

describe('TicketEditForm', () => {
  it('renders all editable fields with their current values', () => {
    renderForm();
    expect(screen.getByDisplayValue('Sol')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Calle 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
    expect(screen.getByDisplayValue('25.5')).toBeInTheDocument();
    expect(screen.getByDisplayValue('EUR')).toBeInTheDocument();
    expect(screen.getByDisplayValue('CASH')).toBeInTheDocument();
  });

  it('renders translated labels for each field', () => {
    renderForm();
    expect(screen.getByText('confirmForm.establishment')).toBeInTheDocument();
    expect(screen.getByText('confirmForm.address')).toBeInTheDocument();
    expect(screen.getByText('confirmForm.date')).toBeInTheDocument();
    expect(screen.getByText('confirmForm.amount')).toBeInTheDocument();
    expect(screen.getByText('confirmForm.currency')).toBeInTheDocument();
    expect(screen.getByText('confirmForm.paymentMethod')).toBeInTheDocument();
  });

  it('renders Save and Cancel buttons', () => {
    renderForm();
    expect(screen.getByRole('button', { name: /common\.cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /common\.save/i })).toBeInTheDocument();
  });

  it('fires onChange when a field value changes', () => {
    const { props } = renderForm();
    fireEvent.change(screen.getByDisplayValue('Sol'), {
      target: { name: 'location_name', value: 'Hotel' },
    });
    expect(props.onChange).toHaveBeenCalled();
  });

  it('fires onSave when the Save button is clicked', () => {
    const { props } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: /common\.save/i }));
    expect(props.onSave).toHaveBeenCalledTimes(1);
  });

  it('fires onCancel when the Cancel button is clicked', () => {
    const { props } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: /common\.cancel/i }));
    expect(props.onCancel).toHaveBeenCalledTimes(1);
  });

  it('disables the Cancel button while saving', () => {
    renderForm({ isSaving: true });
    const cancel = screen.getByRole('button', { name: /common\.cancel/i }) as HTMLButtonElement;
    expect(cancel.disabled).toBe(true);
  });

  it('disables the Save button while saving', () => {
    renderForm({ isSaving: true });
    const save = screen.getByRole('button', { name: /common\.save/i }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
  });
});
