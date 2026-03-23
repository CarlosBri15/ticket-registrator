import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// Root node_modules — force all packages to share the same React instance.
// Without this, packages/node_modules (Expo/mobile) injects a second React copy
// which breaks recharts (and any lib that calls hooks internally).
const root = path.resolve(__dirname, '../../node_modules')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 4001,
  },
  resolve: {
    alias: [
      { find: 'react', replacement: path.resolve(root, 'react') },
      { find: 'react-dom', replacement: path.resolve(root, 'react-dom') },
      { find: 'react/jsx-runtime', replacement: path.resolve(root, 'react/jsx-runtime') },
      { find: '@ticket-registrator/shared', replacement: path.resolve(__dirname, '../shared/src/index.ts') },
    ],
  },
})

