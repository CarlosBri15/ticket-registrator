import { mapDepartmentToIDepartment } from './department.mapper';

describe('mapDepartmentToIDepartment', () => {
  const now = new Date('2024-03-01T08:00:00.000Z');

  const baseDepartment = {
    id: 'dept-1',
    companyId: 'company-1',
    departmentName: 'Engineering',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  it('should map all fields correctly', () => {
    const result = mapDepartmentToIDepartment(baseDepartment as any);

    expect(result).toEqual({
      id: 'dept-1',
      companyId: 'company-1',
      name: 'Engineering',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it('should use departmentName as name', () => {
    const dept = { ...baseDepartment, departmentName: 'Finance' };
    const result = mapDepartmentToIDepartment(dept as any);
    expect(result.name).toBe('Finance');
  });

  it('should return null for companyId when it is null (global department)', () => {
    const dept = { ...baseDepartment, companyId: null };
    const result = mapDepartmentToIDepartment(dept as any);
    expect(result.companyId).toBeNull();
  });

  it('should return null for companyId when it is undefined', () => {
    const dept = { ...baseDepartment, companyId: undefined };
    const result = mapDepartmentToIDepartment(dept as any);
    expect(result.companyId).toBeNull();
  });

  it('should convert createdAt Date to ISO string', () => {
    const date = new Date('2022-01-01T00:00:00.000Z');
    const dept = { ...baseDepartment, createdAt: date };
    const result = mapDepartmentToIDepartment(dept as any);
    expect(result.createdAt).toBe('2022-01-01T00:00:00.000Z');
  });

  it('should convert updatedAt Date to ISO string', () => {
    const date = new Date('2022-07-15T12:30:00.000Z');
    const dept = { ...baseDepartment, updatedAt: date };
    const result = mapDepartmentToIDepartment(dept as any);
    expect(result.updatedAt).toBe('2022-07-15T12:30:00.000Z');
  });

  it('should not include deletedAt or departmentName in the output', () => {
    const result = mapDepartmentToIDepartment(baseDepartment as any);
    expect(result).not.toHaveProperty('deletedAt');
    expect(result).not.toHaveProperty('departmentName');
  });
});
