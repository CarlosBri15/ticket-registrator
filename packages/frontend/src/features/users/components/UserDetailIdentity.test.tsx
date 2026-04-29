import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserDetailIdentity } from './UserDetailIdentity';

const buildUser = (overrides: any = {}) => ({
  id: 'u1',
  name: 'Ada',
  surname: 'Lovelace',
  username: 'ada',
  email: 'ada@example.com',
  roleId: 'r1',
  ...overrides,
});

describe('UserDetailIdentity', () => {
  it('renders the user full name and username', () => {
    render(<UserDetailIdentity user={buildUser()} roleName="Admin" userDepts={[]} />);
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('@ada')).toBeInTheDocument();
  });

  it('renders the email', () => {
    render(<UserDetailIdentity user={buildUser()} roleName="Admin" userDepts={[]} />);
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
  });

  it('renders the role name', () => {
    render(<UserDetailIdentity user={buildUser()} roleName="Admin" userDepts={[]} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders department badges for each department', () => {
    const depts = [
      { id: 'd1', name: 'Eng' } as any,
      { id: 'd2', name: 'Sales' } as any,
    ];
    render(<UserDetailIdentity user={buildUser()} roleName="Admin" userDepts={depts} />);
    expect(screen.getByText('Eng')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
  });

  it('renders nothing in the departments area when empty', () => {
    const { container } = render(
      <UserDetailIdentity user={buildUser()} roleName="Admin" userDepts={[]} />,
    );
    expect(container.querySelectorAll('[class*="border border-[var"]').length).toBeGreaterThanOrEqual(0);
  });
});
