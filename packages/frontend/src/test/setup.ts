import '@testing-library/jest-dom';
import { expect } from 'vitest';
import { toHaveNoViolations } from 'jest-axe';

// Frente 5.3 — register the jest-axe assertion (`expect(...).toHaveNoViolations()`)
// for every test file. Smoke tests in `src/test/a11y/` exercise it on the
// public UI primitives; product code tests can opt in too as needed.
expect.extend(toHaveNoViolations);
