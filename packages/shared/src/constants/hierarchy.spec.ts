import { ROLE_HIERARCHY } from './hierarchy';

describe('ROLE_HIERARCHY constants', () => {
  it('SUPER_ADMIN is 100', () => {
    expect(ROLE_HIERARCHY.SUPER_ADMIN).toBe(100);
  });

  it('ADMIN is 99', () => {
    expect(ROLE_HIERARCHY.ADMIN).toBe(99);
  });

  it('MANAGER is 50', () => {
    expect(ROLE_HIERARCHY.MANAGER).toBe(50);
  });

  it('CONTROLLER is 40', () => {
    expect(ROLE_HIERARCHY.CONTROLLER).toBe(40);
  });

  it('REGULAR is 0', () => {
    expect(ROLE_HIERARCHY.REGULAR).toBe(0);
  });
});
