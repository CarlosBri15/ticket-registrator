import { users, userRelations } from './user.schema';
import { usersToDepartments, usersToDepartmentsRelations } from './user-relations.schema';

describe('User Schemas', () => {
  it('should export users table', () => {
    expect(users).toBeDefined();
  });

  it('should export userRelations', () => {
    expect(userRelations).toBeDefined();
  });

  it('should export usersToDepartments table', () => {
    expect(usersToDepartments).toBeDefined();
  });

  it('should export usersToDepartmentsRelations', () => {
    expect(usersToDepartmentsRelations).toBeDefined();
  });
});
