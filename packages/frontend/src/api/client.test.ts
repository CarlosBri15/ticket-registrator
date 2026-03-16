import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@ticket-registrator/shared', () => ({
  createApiClient: vi.fn(() => ({ axiosInstance: {} })),
  setApiClient: vi.fn(),
}));

describe('api/client', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000');
  });

  it('exports client and tokenProvider', async () => {
    const { client, tokenProvider } = await import('./client');
    expect(client).toBeDefined();
    expect(tokenProvider).toBeDefined();
  });

  it('tokenProvider.getToken returns token from localStorage', async () => {
    localStorage.setItem('access_token', 'my-token');
    const { tokenProvider } = await import('./client');
    expect(tokenProvider.getToken()).toBe('my-token');
  });

  it('tokenProvider.getToken returns null when no token', async () => {
    const { tokenProvider } = await import('./client');
    expect(tokenProvider.getToken()).toBeNull();
  });

  it('tokenProvider.setToken stores token in localStorage', async () => {
    const { tokenProvider } = await import('./client');
    tokenProvider.setToken('new-token');
    expect(localStorage.getItem('access_token')).toBe('new-token');
  });

  it('tokenProvider.removeToken removes token from localStorage', async () => {
    localStorage.setItem('access_token', 'to-remove');
    const { tokenProvider } = await import('./client');
    tokenProvider.removeToken();
    expect(localStorage.getItem('access_token')).toBeNull();
  });
});
