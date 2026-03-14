import { permissions } from './permission.schema';
import { rolePermissions, rolePermissionsRelations } from './role-permission.schema';

describe('Permissions Schemas', () => {
  it('should export permissions table', () => {
    expect(permissions).toBeDefined();
  });

  it('should export rolePermissions table', () => {
    expect(rolePermissions).toBeDefined();
  });

  it('should export rolePermissionsRelations', () => {
    expect(rolePermissionsRelations).toBeDefined();
  });
});
