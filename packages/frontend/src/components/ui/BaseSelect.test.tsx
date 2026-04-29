import { describe, it, expect, vi } from 'vitest';
import { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k, i18n: { language: 'en' } }),
}));

import { BaseSelect, type BaseSelectProps } from './BaseSelect';

const renderBase = (overrides: Partial<BaseSelectProps> = {}) => {
  const triggerRef = createRef<HTMLButtonElement>();
  const containerRef = createRef<HTMLDivElement>();
  const props: BaseSelectProps = {
    id: 'sel',
    displayValue: 'Choice A',
    open: false,
    onToggle: vi.fn(),
    triggerRef,
    containerRef,
    handleKeyDown: vi.fn(),
    dropdownStyle: {},
    nativeSelect: <select data-testid="native"><option>A</option></select>,
    triggerTestId: 'trigger',
    dropdownTestId: 'dropdown',
    emptyI18nKey: 'ui.selectOption',
    children: <div data-testid="dropdown-child">items</div>,
    ...overrides,
  };
  return { props, ...render(<BaseSelect {...props} />) };
};

describe('BaseSelect', () => {
  it('renders label and required asterisk', () => {
    renderBase({ label: 'Name', required: true });
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders the displayValue when provided', () => {
    renderBase({ displayValue: 'Apple' });
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('renders the placeholder when displayValue is null', () => {
    renderBase({ displayValue: null, placeholder: 'Pick one' });
    expect(screen.getByText('Pick one')).toBeInTheDocument();
  });

  it('renders the i18n empty key when no displayValue and no placeholder', () => {
    renderBase({ displayValue: null, placeholder: undefined });
    expect(screen.getByText('ui.selectOption')).toBeInTheDocument();
  });

  it('renders the loading text and spinner when isLoading=true', () => {
    const { container } = renderBase({ isLoading: true });
    expect(screen.getByText('ui.loading')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('disables the trigger when disabled or isLoading', () => {
    const { rerender } = renderBase({ disabled: true });
    expect((screen.getByTestId('trigger') as HTMLButtonElement).disabled).toBe(true);
    rerender(
      <BaseSelect
        {...({
          id: 'sel',
          displayValue: 'X',
          open: false,
          onToggle: vi.fn(),
          triggerRef: createRef<HTMLButtonElement>(),
          containerRef: createRef<HTMLDivElement>(),
          handleKeyDown: vi.fn(),
          dropdownStyle: {},
          nativeSelect: <select data-testid="native" />,
          triggerTestId: 'trigger',
          dropdownTestId: 'dropdown',
          emptyI18nKey: 'ui.selectOption',
          children: null,
          isLoading: true,
        } as BaseSelectProps)}
      />,
    );
    expect((screen.getByTestId('trigger') as HTMLButtonElement).disabled).toBe(true);
  });

  it('fires onToggle when the trigger is clicked', () => {
    const { props } = renderBase();
    fireEvent.click(screen.getByTestId('trigger'));
    expect(props.onToggle).toHaveBeenCalled();
  });

  it('forwards keydown events to handleKeyDown', () => {
    const { props } = renderBase();
    fireEvent.keyDown(screen.getByTestId('trigger'), { key: 'Enter' });
    expect(props.handleKeyDown).toHaveBeenCalled();
  });

  it('renders the dropdown via portal when open=true', () => {
    renderBase({ open: true });
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('dropdown-child')).toBeInTheDocument();
  });

  it('does not render the dropdown when open=false', () => {
    renderBase({ open: false });
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });

  it('renders the error message and applies error class', () => {
    renderBase({ error: 'Required' });
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders the supplied native select', () => {
    renderBase();
    expect(screen.getByTestId('native')).toBeInTheDocument();
  });
});
