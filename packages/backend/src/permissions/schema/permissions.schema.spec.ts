import { permissions, permissionRelations } from './permissions.schema';

describe('Permissions Schema (legacy)', () => {
  it('should export permissions table', () => {
    expect(permissions).toBeDefined();
  });

  it('should export permissionRelations', () => {
    expect(permissionRelations).toBeDefined();
  });
});
