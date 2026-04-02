// Stub for React Native 0.81 feature flags — avoids native bridge requirement in tests
module.exports = new Proxy(
  {},
  {
    get: (_target, prop) => {
      if (prop === '__esModule') return false;
      if (prop === 'default') return module.exports;
      return () => false;
    },
  },
);
