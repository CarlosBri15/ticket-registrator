import { IDepartment } from '@ticket-registrator/shared';
import { Department } from '../schema/department.schema';

export const mapDepartmentToIDepartment = (
  department: Department,
): IDepartment => ({
  id: department.id,
  companyId: department.companyId ?? null,
  name: department.departmentName,
  createdAt: department.createdAt.toISOString(),
  updatedAt: department.updatedAt.toISOString(),
});
