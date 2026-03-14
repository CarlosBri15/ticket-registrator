import { roles, roleRelations } from './role.schema';
import { rolePermissions, rolePermissionsRelations } from './role-permission.schema';
import { permissions } from './permission.schema';

describe('Roles Schemas', () => {
  it('should export roles table', () => {
    expect(roles).toBeDefined();
  });

  it('should export roleRelations', () => {
    expect(roleRelations).toBeDefined();
  });

  it('should export rolePermissions table', () => {
    expect(rolePermissions).toBeDefined();
  });

  it('should export rolePermissionsRelations', () => {
    expect(rolePermissionsRelations).toBeDefined();
  });

  it('should export permissions table', () => {
    expect(permissions).toBeDefined();
  });
});
