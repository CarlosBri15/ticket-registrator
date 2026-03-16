import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/**/*.d.ts', 'src/test/**'],
    },
  },
  resolve: {
    alias: [
      // Force ALL packages to resolve from root node_modules to avoid
      // conflicts with packages/node_modules (mobile/Expo installs React 18)
      { find: /^react$/, replacement: path.resolve(__dirname, '../../node_modules/react/index.js') },
      { find: /^react\/jsx-runtime$/, replacement: path.resolve(__dirname, '../../node_modules/react/jsx-runtime.js') },
      { find: /^react-dom$/, replacement: path.resolve(__dirname, '../../node_modules/react-dom/index.js') },
      { find: /^react-dom\/(.*)/, replacement: path.resolve(__dirname, '../../node_modules/react-dom/$1') },
      { find: /^react-router-dom$/, replacement: path.resolve(__dirname, '../../node_modules/react-router-dom/dist/index.js') },
      { find: /^react-router$/, replacement: path.resolve(__dirname, '../../node_modules/react-router/dist/index.js') },
      { find: '@tanstack/react-query', replacement: path.resolve(__dirname, '../../node_modules/@tanstack/react-query') },
      { find: 'react-i18next', replacement: path.resolve(__dirname, '../../node_modules/react-i18next') },
      { find: '@ticket-registrator/shared', replacement: path.resolve(__dirname, '../shared/src/index.ts') },
    ],
  },
});
