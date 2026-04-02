import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RegisterForm } from './RegisterScreen';

const mockNavigate = vi.fn();
const mockMutate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  const { z } = await import('zod');
  return {
    ...actual,
    useRegisterMutation: vi.fn(),
    registerSchema: z.object({
      name: z.string().min(1),
      surname: z.string().min(1),
      email: z.string().email(),
      username: z.string().min(1),
      password: z.string().min(1),
      confirmPassword: z.string().min(1),
    }).refine(d => d.password === d.confirmPassword, { path: ['confirmPassword'] }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'es' },
  }),
}));

vi.mock('lucide-react', () => ({
  Sparkles: () => null,
  PieChart: () => null,
  TrendingUp: () => null,
  CheckCircle2: () => null,
}));

import { useRegisterMutation } from '@ticket-registrator/shared';
const mockUseRegisterMutation = useRegisterMutation as ReturnType<typeof vi.fn>;

const renderRegister = () =>
  render(
    <MemoryRouter>
      <RegisterForm />
    </MemoryRouter>,
  );

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRegisterMutation.mockReturnValue({ mutate: mockMutate, isPending: false, isError: false, error: null });
  });

  it('renders all text inputs', () => {
    renderRegister();
    expect(screen.getAllByRole('textbox').length).toBeGreaterThanOrEqual(4);
  });

  it('renders password inputs', () => {
    const { container } = renderRegister();
    const passwordInputs = container.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBe(2);
  });

  it('renders submit button', () => {
    renderRegister();
    expect(screen.getByRole('button', { name: 'register.submitButton' })).toBeInTheDocument();
  });

  it('renders link to login page', () => {
    renderRegister();
    expect(screen.getByText('register.loginLink')).toBeInTheDocument();
  });

  it('submit button is disabled when isPending', () => {
    mockUseRegisterMutation.mockReturnValue({ mutate: mockMutate, isPending: true, isError: false, error: null });
    renderRegister();
    expect(screen.getByRole('button', { name: 'register.submitButton' })).toBeDisabled();
  });

  it('shows server error message when isError is true', () => {
    mockUseRegisterMutation.mockReturnValue({ mutate: mockMutate, isPending: false, isError: true, error: null });
    renderRegister();
    expect(screen.getByText('common.error')).toBeInTheDocument();
  });

  it('shows specific server error from response', () => {
    const axiosError = {
      response: { data: { message: 'Email already exists' } },
    };
    mockUseRegisterMutation.mockReturnValue({ mutate: mockMutate, isPending: false, isError: true, error: axiosError });
    renderRegister();
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('onSuccess navigates to /login', () => {
    let capturedOnSuccess: (() => void) | undefined;
    mockUseRegisterMutation.mockImplementation((opts: any) => {
      capturedOnSuccess = opts?.onSuccess;
      return { mutate: mockMutate, isPending: false, isError: false, error: null };
    });
    renderRegister();
    capturedOnSuccess?.();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('calls mutate when form is submitted with valid data', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const { container } = renderRegister();
    
    await user.type(screen.getByPlaceholderText('Ej: Ana'), 'Ana');
    await user.type(screen.getByPlaceholderText('Ej: García'), 'García');
    await user.type(screen.getByPlaceholderText('ana@empresa.com'), 'ana@example.com');
    await user.type(screen.getByPlaceholderText('ana.garcia'), 'ana.garcia');
    
    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0] as HTMLElement, 'Password123!');
    await user.type(passwordInputs[1] as HTMLElement, 'Password123!');
    
    await user.click(screen.getByRole('button', { name: 'register.submitButton' }));
    
    // Mutation should be called (wait for it if async)
    expect(mockMutate).toHaveBeenCalled();
  });
});
