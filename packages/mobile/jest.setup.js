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
