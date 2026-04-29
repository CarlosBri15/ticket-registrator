import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserRow } from './UserRow';

const buildUser = (overrides: any = {}) => ({
  id: 'u1',
  name: 'Ada',
  surname: 'Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  roleId: 'r1',
  ...overrides,
});

describe('UserRow', () => {
  it('renders user full name, username and email', () => {
    render(<UserRow user={buildUser()} roleName="Admin" onClick={vi.fn()} />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('@ada')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
  });

  it('renders the role name when provided', () => {
    render(<UserRow user={buildUser()} roleName="Manager" onClick={vi.fn()} />);
    expect(screen.getByText('Manager')).toBeInTheDocument();
  });

  it('renders an em dash when no role name is provided', () => {
    render(<UserRow user={buildUser()} onClick={vi.fn()} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('fires onClick when the row button is clicked', () => {
    const onClick = vi.fn();
    render(<UserRow user={buildUser()} roleName="Admin" onClick={onClick} />);
    fireEvent.click(screen.getByText('Ada Lovelace'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders the rightAction slot when provided', () => {
    render(
      <UserRow
        user={buildUser()}
        roleName="Admin"
        onClick={vi.fn()}
        rightAction={<button>edit</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'edit' })).toBeInTheDocument();
  });

  it('renders a chevron icon when no rightAction is provided', () => {
    const { container } = render(<UserRow user={buildUser()} onClick={vi.fn()} />);
    // Chevron has w-4 h-4
    expect(container.querySelector('svg.w-4.h-4')).toBeInTheDocument();
  });
});
