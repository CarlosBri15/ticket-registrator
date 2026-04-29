import { CACHE_CONFIG } from './cache';

describe('CACHE_CONFIG constants', () => {
  it('STALE_TIME is 5 minutes in ms', () => {
    expect(CACHE_CONFIG.STALE_TIME).toBe(1000 * 60 * 5);
  });

  it('GC_TIME is 10 minutes in ms', () => {
    expect(CACHE_CONFIG.GC_TIME).toBe(1000 * 60 * 10);
  });
});
