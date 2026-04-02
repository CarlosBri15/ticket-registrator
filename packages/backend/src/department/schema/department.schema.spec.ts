import { departments, departmentRelations } from './department.schema';

describe('Department Schema', () => {
  it('should export departments table', () => {
    expect(departments).toBeDefined();
  });

  it('should export departmentRelations', () => {
    expect(departmentRelations).toBeDefined();
  });
});
