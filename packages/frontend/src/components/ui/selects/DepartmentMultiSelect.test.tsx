import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@ticket-registrator/shared', () => ({
  useDepartmentsQuery: vi.fn(),
}));

vi.mock('../MultiSelect', () => ({
  MultiSelect: ({ label, options, value, onChange, isLoading, placeholder }: any) => (
    <div data-testid="multi-select">
      <span>{label}</span>
      {isLoading && <span>loading</span>}
      {options?.map((o: any) => (
        <button key={o.value} onClick={() => onChange?.([o.value])}>
          {o.label}
        </button>
      ))}
    </div>
  ),
}));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { useDepartmentsQuery } from '@ticket-registrator/shared';
import { DepartmentMultiSelect } from './DepartmentMultiSelect';

// ─── Setup helpers ────────────────────────────────────────────────────────────

const setupMocks = () => {
  (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
    data: [
      { id: 'dept-1', name: 'Engineering' },
      { id: 'dept-2', name: 'Marketing' },
    ],
    isLoading: false,
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('DepartmentMultiSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders with label "Departamentos"', () => {
    render(<DepartmentMultiSelect />);
    expect(screen.getByText('Departamentos')).toBeInTheDocument();
  });

  it('passes departments as options to MultiSelect', () => {
    render(<DepartmentMultiSelect />);
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });

  it('shows loading when useDepartmentsQuery isLoading', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    render(<DepartmentMultiSelect />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('calls onChange with selected department id', () => {
    const onChange = vi.fn();
    render(<DepartmentMultiSelect onChange={onChange} />);
    fireEvent.click(screen.getByText('Engineering'));
    expect(onChange).toHaveBeenCalledWith(['dept-1']);
  });

  it('passes custom label prop', () => {
    render(<DepartmentMultiSelect label="My Custom Label" />);
    expect(screen.getByText('My Custom Label')).toBeInTheDocument();
  });

  it('passes empty options when no departments', () => {
    (useDepartmentsQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
    });
    render(<DepartmentMultiSelect />);
    expect(screen.getByTestId('multi-select')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('passes companyId to useDepartmentsQuery', () => {
    render(<DepartmentMultiSelect companyId="company-123" />);
    expect(useDepartmentsQuery).toHaveBeenCalledWith('company-123');
  });
});
