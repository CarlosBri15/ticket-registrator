import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// ── Architecture regression guards (Frente 5.2) ─────────────────────────────
// These rules encode contracts that survived Frentes 1-3 and must not regress:
//   1. `axios` may only be imported from `@ticket-registrator/shared/src/api/*`
//      (the rest of the app must consume typed React Query hooks/clients).
//   2. The legacy `styles/theme` token bag was deleted in Frente 1; importing
//      from it should fail loudly.
const ARCHITECTURE_GUARD_RULES = {
  'no-restricted-imports': [
    'error',
    {
      paths: [
        {
          name: 'axios',
          message:
            'Frontend must not import axios directly. Use a typed client/hook from @ticket-registrator/shared.',
        },
      ],
      patterns: [
        {
          group: ['**/styles/theme', '**/styles/theme/*', '../**/styles/theme'],
          message:
            'styles/theme was removed in Frente 1 — use kit classes from index.css instead.',
        },
      ],
    },
  ],
}

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...ARCHITECTURE_GUARD_RULES,
    },
  },
])
