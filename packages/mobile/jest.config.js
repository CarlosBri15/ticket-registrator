module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    require.resolve('react-native/jest/setup.js'),
    require.resolve('jest-expo/src/preset/setup.js'),
    '<rootDir>/jest.setup.js',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|nativewind|lucide-react-native|@ticket-registrator/.*)',
  ],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/(.*)$': '<rootDir>/node_modules/react/$1',
    '^@ticket-registrator/shared$': '<rootDir>/../shared/src/index.ts',
    '^nativewind$': '<rootDir>/src/__mocks__/nativewind.js',
    '^nativewind/(.*)$': '<rootDir>/src/__mocks__/nativewind.js',
    '^react-native/src/private/featureflags/ReactNativeFeatureFlags$':
      '<rootDir>/src/__mocks__/ReactNativeFeatureFlags.js',
    '^react-native/src/private/featureflags/ReactNativeFeatureFlagsBase$':
      '<rootDir>/src/__mocks__/ReactNativeFeatureFlags.js',
    '^react-native/src/private/featureflags/specs/NativeReactNativeFeatureFlags$':
      '<rootDir>/src/__mocks__/ReactNativeFeatureFlags.js',
    '^@expo/vector-icons$': '<rootDir>/src/__mocks__/@expo/vector-icons.js',
    '^@expo/vector-icons/(.*)$': '<rootDir>/src/__mocks__/@expo/vector-icons.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
