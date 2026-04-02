const SCREEN = { width: 375, height: 812, scale: 2, fontScale: 1 };

const DEVICE_CONSTANTS = {
  // React Native 0.81 shape
  Dimensions: { screen: SCREEN, window: SCREEN },
  // Legacy shape (some modules still use this)
  screen: SCREEN,
  window: SCREEN,
  isIPhoneX_deprecated: false,
  statusBarHeight: 44,
};

// Proxy that responds to any method — returns DEVICE_CONSTANTS for getConstants()
const makeNativeModuleMock = () =>
  new Proxy(
    { getConstants: jest.fn(() => DEVICE_CONSTANTS) },
    {
      get: (target, prop) => {
        if (prop in target) return target[prop];
        if (prop === '__esModule') return false;
        return jest.fn();
      },
    },
  );

// Mock TurboModuleRegistry so no native bridge is required
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  getEnforcing: jest.fn(makeNativeModuleMock),
  get: jest.fn(makeNativeModuleMock),
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }) => children,
}));

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: jest.fn(() => inset),
    useSafeAreaFrame: jest.fn(() => ({ x: 0, y: 0, width: 375, height: 812 })),
  };
});

