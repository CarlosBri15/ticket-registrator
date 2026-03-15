import { mapUserToIUser, mapUserToICurrentUser } from './users.mapper';

const baseUser = {
  id: 'user-1',
  name: 'John',
  surname: 'Doe',
  email: 'john@acme.com',
  username: 'john',
  roleId: 'role-1',
  companyId: 'company-1',
};

describe('mapUserToIUser', () => {
  it('should map all fields correctly', () => {
    const user = {
      ...baseUser,
      usersToDepartments: [{ departmentId: 'dept-1' }, { departmentId: 'dept-2' }],
    };

    expect(mapUserToIUser(user)).toEqual({
      id: 'user-1',
      name: 'John',
      surname: 'Doe',
      email: 'john@acme.com',
      username: 'john',
      roleId: 'role-1',
      companyId: 'company-1',
      departmentIds: ['dept-1', 'dept-2'],
    });
  });

  it('should return empty departmentIds when usersToDepartments is null', () => {
    const result = mapUserToIUser({ ...baseUser, usersToDepartments: null });
    expect(result.departmentIds).toEqual([]);
  });

  it('should return empty departmentIds when usersToDepartments is undefined', () => {
    const result = mapUserToIUser({ ...baseUser });
    expect(result.departmentIds).toEqual([]);
  });

  it('should use empty string fallbacks for null fields', () => {
    const user = {
      id: 'user-1',
      name: null,
      surname: null,
      email: null,
      username: null,
      roleId: null,
      companyId: null,
      usersToDepartments: [],
    };

    const result = mapUserToIUser(user);
    expect(result.name).toBe('');
    expect(result.surname).toBe('');
    expect(result.email).toBe('');
    expect(result.username).toBe('');
    expect(result.roleId).toBe('');
    expect(result.companyId).toBeNull();
  });
});

describe('mapUserToICurrentUser', () => {
  const role = { name: 'Admin', hierarchy: 99 };
  const permissions = ['view_users', 'create_users', 'edit_users'];

  it('should map all fields including roleName, hierarchy and permissions', () => {
    const user = {
      ...baseUser,
      role,
      usersToDepartments: [{ departmentId: 'dept-1' }],
    };

    expect(mapUserToICurrentUser(user, permissions)).toEqual({
      id: 'user-1',
      name: 'John',
      surname: 'Doe',
      email: 'john@acme.com',
      username: 'john',
      roleId: 'role-1',
      companyId: 'company-1',
      departmentIds: ['dept-1'],
      roleName: 'Admin',
      hierarchy: 99,
      permissions,
    });
  });

  it('should return null companyId for SuperAdmin (no company)', () => {
    const user = { ...baseUser, companyId: null, role, usersToDepartments: [] };
    const result = mapUserToICurrentUser(user, permissions);
    expect(result.companyId).toBeNull();
  });

  it('should default roleName to empty string and hierarchy to 0 when role is null', () => {
    const user = { ...baseUser, role: null, usersToDepartments: [] };
    const result = mapUserToICurrentUser(user, []);
    expect(result.roleName).toBe('');
    expect(result.hierarchy).toBe(0);
  });

  it('should return empty permissions array when no permissions provided', () => {
    const user = { ...baseUser, role, usersToDepartments: [] };
    const result = mapUserToICurrentUser(user, []);
    expect(result.permissions).toEqual([]);
  });

  it('should return empty departmentIds when usersToDepartments is absent', () => {
    const user = { ...baseUser, role };
    const result = mapUserToICurrentUser(user, permissions);
    expect(result.departmentIds).toEqual([]);
  });
});
