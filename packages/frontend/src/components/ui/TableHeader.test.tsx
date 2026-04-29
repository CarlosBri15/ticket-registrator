import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TableHeader } from './TableHeader';

describe('TableHeader', () => {
  it('renders all column labels', () => {
    render(
      <TableHeader
        columns={[
          { label: 'Name' },
          { label: 'Amount', align: 'right' },
          { label: 'Status', align: 'center' },
        ]}
      />,
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('applies alignment classes per column', () => {
    render(
      <TableHeader
        columns={[
          { label: 'A', align: 'left' },
          { label: 'B', align: 'right' },
          { label: 'C', align: 'center' },
        ]}
      />,
    );
    expect(screen.getByText('A').className).toMatch(/text-left/);
    expect(screen.getByText('B').className).toMatch(/text-right/);
    expect(screen.getByText('C').className).toMatch(/text-center/);
  });

  it('defaults alignment to left when not specified', () => {
    render(<TableHeader columns={[{ label: 'A' }]} />);
    expect(screen.getByText('A').className).toMatch(/text-left/);
  });

  it('uses the provided gridTemplate inline style', () => {
    const { container } = render(
      <TableHeader columns={[{ label: 'A' }]} gridTemplate="50px 1fr" />,
    );
    expect((container.firstChild as HTMLElement).style.gridTemplateColumns).toBe('50px 1fr');
  });

  it('falls back to the default gridTemplate when none is provided', () => {
    const { container } = render(<TableHeader columns={[{ label: 'A' }]} />);
    const style = (container.firstChild as HTMLElement).style.gridTemplateColumns;
    expect(style).toContain('1fr');
  });

  it('applies extra className to the wrapper', () => {
    const { container } = render(
      <TableHeader columns={[{ label: 'A' }]} className="my-cls" />,
    );
    expect(container.firstChild).toHaveClass('my-cls');
  });

  it('renders ReactNode labels', () => {
    render(
      <TableHeader columns={[{ label: <em data-testid="lbl">Em</em> }]} />,
    );
    expect(screen.getByTestId('lbl')).toBeInTheDocument();
  });
});
