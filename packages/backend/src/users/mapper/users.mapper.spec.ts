import { mapUserToIUser } from './users.mapper';

describe('mapUserToIUser', () => {
  it('should map all fields correctly', () => {
    const user = {
      id: 'user-1',
      name: 'John',
      surname: 'Doe',
      email: 'john@acme.com',
      username: 'john',
      roleId: 'role-1',
      companyId: 'company-1',
      usersToDepartments: [
        { departmentId: 'dept-1' },
        { departmentId: 'dept-2' },
      ],
    };

    const result = mapUserToIUser(user);

    expect(result).toEqual({
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
    const user = {
      id: 'user-1',
      name: 'Jane',
      surname: 'Smith',
      email: 'jane@acme.com',
      username: 'jane',
      roleId: 'role-2',
      companyId: 'company-2',
      usersToDepartments: null,
    };

    const result = mapUserToIUser(user);
    expect(result.departmentIds).toEqual([]);
  });

  it('should return empty departmentIds when usersToDepartments is undefined', () => {
    const user = {
      id: 'user-1',
      name: 'Bob',
      surname: 'Jones',
      email: 'bob@acme.com',
      username: 'bob',
      roleId: 'role-3',
      companyId: 'company-3',
    };

    const result = mapUserToIUser(user);
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
    expect(result.companyId).toBe('');
  });
});
