// assets.spec.ts — verifies that every icon key is exported from assets.ts.
// Images in Jest resolve to the module path string (via moduleNameMapper or
// the default transform that returns the filename), so we just assert presence.

import * as assets from './assets';

const EXPECTED_KEYS = [
  'dashboardIcon',
  'organizationIcon',
  'reportIcon',
  'settingsIcon',
  'ticketIcon',
  'userIcon',
  'locationIcon',
  'commerceIcon',
  'paymentMethodIcon',
  'cameraIcon',
] as const;

describe('assets barrel', () => {
  it.each(EXPECTED_KEYS)('exports %s', (key) => {
    expect(assets).toHaveProperty(key);
  });

  it('exports exactly the expected set of icons', () => {
    expect(Object.keys(assets).sort()).toEqual([...EXPECTED_KEYS].sort());
  });
});
