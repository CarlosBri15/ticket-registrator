import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LoginForm } from './LoginScreen';

const mockNavigate = vi.fn();
const mockMutate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@ticket-registrator/shared', async () => {
  const actual = await vi.importActual<typeof import('@ticket-registrator/shared')>('@ticket-registrator/shared');
  return {
    ...actual,
    useLoginMutation: vi.fn(),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('lucide-react', () => ({
  Scan: () => null,
  ShieldCheck: () => null,
  Sparkles: () => null,
}));

vi.mock('../../api/client', () => ({
  tokenProvider: { setToken: vi.fn() },
}));

import { useLoginMutation } from '@ticket-registrator/shared';
const mockUseLoginMutation = useLoginMutation as ReturnType<typeof vi.fn>;

const renderLogin = () =>
  render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>,
  );

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLoginMutation.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false, error: null });
  });

  it('renders email input', () => {
    renderLogin();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders password input', () => {
    const { container } = renderLogin();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: 'auth.loginButton' })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText('auth.forgotPassword')).toBeInTheDocument();
  });

  it('renders link to register page', () => {
    renderLogin();
    expect(screen.getByText('auth.requestAccess')).toBeInTheDocument();
  });

  it('submit button is disabled when isPending', () => {
    mockUseLoginMutation.mockReturnValue({ mutate: mockMutate, isPending: true, isError: false, error: null });
    renderLogin();
    expect(screen.getByRole('button', { name: 'auth.loginButton' })).toBeDisabled();
  });

  it('shows server error message when isError is true', () => {
    mockUseLoginMutation.mockReturnValue({ mutate: mockMutate, isPending: false, isError: true, error: null });
    renderLogin();
    expect(screen.getByText('common.error')).toBeInTheDocument();
  });

  it('shows specific server error message from response', () => {
    const axiosError = {
      response: { data: { message: 'Invalid credentials' } },
    };
    mockUseLoginMutation.mockReturnValue({ mutate: mockMutate, isPending: false, isError: true, error: axiosError });
    renderLogin();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });
});
