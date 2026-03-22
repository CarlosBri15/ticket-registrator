const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: mockGetItemAsync,
  setItemAsync: mockSetItemAsync,
  deleteItemAsync: mockDeleteItemAsync,
}));

const mockCreateApiClient = jest.fn().mockReturnValue({ axiosInstance: {} });
const mockSetApiClient = jest.fn();

jest.mock('@ticket-registrator/shared', () => ({
  createApiClient: mockCreateApiClient,
  setApiClient: mockSetApiClient,
}));

describe('tokenProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getToken calls SecureStore.getItemAsync with "access_token"', async () => {
    mockGetItemAsync.mockResolvedValueOnce('my-token');
    const { tokenProvider } = require('./client');
    const result = await tokenProvider.getToken();
    expect(mockGetItemAsync).toHaveBeenCalledWith('access_token');
    expect(result).toBe('my-token');
  });

  it('getToken returns null when no token stored', async () => {
    mockGetItemAsync.mockResolvedValueOnce(null);
    const { tokenProvider } = require('./client');
    const result = await tokenProvider.getToken();
    expect(result).toBeNull();
  });

  it('setToken calls SecureStore.setItemAsync with key and value', async () => {
    mockSetItemAsync.mockResolvedValueOnce(undefined);
    const { tokenProvider } = require('./client');
    await tokenProvider.setToken('new-token');
    expect(mockSetItemAsync).toHaveBeenCalledWith('access_token', 'new-token');
  });

  it('removeToken calls SecureStore.deleteItemAsync with "access_token"', async () => {
    mockDeleteItemAsync.mockResolvedValueOnce(undefined);
    const { tokenProvider } = require('./client');
    await tokenProvider.removeToken();
    expect(mockDeleteItemAsync).toHaveBeenCalledWith('access_token');
  });

  it('onUnauthorized logs to console without throwing', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const { tokenProvider } = require('./client');
    expect(() => tokenProvider.onUnauthorized()).not.toThrow();
    consoleSpy.mockRestore();
  });
});

describe('initApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    jest.mock('expo-secure-store', () => ({
      getItemAsync: mockGetItemAsync,
      setItemAsync: mockSetItemAsync,
      deleteItemAsync: mockDeleteItemAsync,
    }));
    jest.mock('@ticket-registrator/shared', () => ({
      createApiClient: mockCreateApiClient,
      setApiClient: mockSetApiClient,
    }));
  });

  it('calls createApiClient with API_URL and tokenProvider', () => {
    const { initApi } = require('./client');
    initApi();
    expect(mockCreateApiClient).toHaveBeenCalledTimes(1);
    const [, providerArg] = mockCreateApiClient.mock.calls[0];
    expect(providerArg).toMatchObject({
      getToken: expect.any(Function),
      setToken: expect.any(Function),
      removeToken: expect.any(Function),
    });
  });

  it('calls setApiClient with the created client', () => {
    const fakeClient = { fake: true };
    mockCreateApiClient.mockReturnValueOnce(fakeClient);
    const { initApi } = require('./client');
    initApi();
    expect(mockSetApiClient).toHaveBeenCalledWith(fakeClient);
  });

  it('returns the created client', () => {
    const fakeClient = { axiosInstance: {} };
    mockCreateApiClient.mockReturnValueOnce(fakeClient);
    const { initApi } = require('./client');
    const result = initApi();
    expect(result).toBe(fakeClient);
  });
});
