import { Injectable, Logger } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '../db/schema';
import { IDepartment } from '@ticket-registrator/shared';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { DepartmentRepository } from './department.repository';
import { DepartmentAuthorizationService } from './department-authorization.service';
import { mapDepartmentToIDepartment } from './mapper/department.mapper';
import {
  DepartmentNotFoundException,
  DepartmentConflictException,
  DepartmentAlreadyDeletedException,
} from './exceptions/department.exceptions';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { UNASSIGNED_DEPARTMENT_NAME } from '../seed/seed.service';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly departmentAuthService: DepartmentAuthorizationService,
  ) {}

  async create(
    requester: UserPayload,
    companyId: string,
    dto: CreateDepartmentDto,
  ): Promise<IDepartment> {
    this.departmentAuthService.validateCanManage(requester, companyId);

    const company = await this.departmentRepository.findCompanyById(companyId);
    if (!company) throw new DepartmentNotFoundException();

    const existing = await this.departmentRepository.findByName(
      companyId,
      dto.name as string,
    );
    if (existing) {
      throw new DepartmentConflictException(
        `Department "${dto.name}" already exists in this company`,
      );
    }

    const department = await this.departmentRepository.create({
      companyId,
      departmentName: dto.name as string,
    });

    this.logger.log(
      `Department created: ${department.id} in company ${companyId} by user ${requester.id}`,
    );
    return mapDepartmentToIDepartment(department);
  }

  async findAllByCompany(
    requester: UserPayload,
    companyId: string,
  ): Promise<IDepartment[]> {
    this.departmentAuthService.validateCompanyAccess(requester, companyId);
    const departments =
      await this.departmentRepository.findAllByCompany(companyId);
    return departments.map(mapDepartmentToIDepartment);
  }

  async findOne(
    requester: UserPayload,
    companyId: string,
    departmentId: string,
  ): Promise<IDepartment> {
    this.departmentAuthService.validateCompanyAccess(requester, companyId);
    const department = await this.departmentRepository.findOne(
      companyId,
      departmentId,
    );
    if (!department) throw new DepartmentNotFoundException(departmentId);
    return mapDepartmentToIDepartment(department);
  }

  async update(
    requester: UserPayload,
    companyId: string,
    departmentId: string,
    dto: UpdateDepartmentDto,
  ): Promise<IDepartment> {
    this.departmentAuthService.validateCanManage(requester, companyId);

    const department = await this.departmentRepository.findOne(
      companyId,
      departmentId,
    );
    if (!department) throw new DepartmentNotFoundException(departmentId);

    if (!dto.name) return mapDepartmentToIDepartment(department);

    const updated = await this.departmentRepository.update(departmentId, {
      departmentName: dto.name,
    });
    if (!updated) throw new DepartmentNotFoundException(departmentId);

    this.logger.log(
      `Department updated: ${departmentId} by user ${requester.id}`,
    );
    return mapDepartmentToIDepartment(updated);
  }

  async softDelete(
    requester: UserPayload,
    companyId: string,
    departmentId: string,
  ): Promise<{ deleted: boolean }> {
    this.departmentAuthService.validateCanManage(requester, companyId);

    const department = await this.departmentRepository.findByIdIncludingDeleted(
      companyId,
      departmentId,
    );
    if (!department) throw new DepartmentNotFoundException(departmentId);
    if (department.deletedAt) throw new DepartmentAlreadyDeletedException();

    const unassignedDept = await this.departmentRepository.findUnassigned(
      UNASSIGNED_DEPARTMENT_NAME,
    );
    if (!unassignedDept)
      throw new DepartmentConflictException(
        'Global Unassigned department not found',
      );

    await this.departmentRepository.transaction(async (tx) => {
      await tx
        .update(schema.departments)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.departments.id, departmentId));

      const deptUsers = await tx.query.usersToDepartments.findMany({
        where: eq(schema.usersToDepartments.departmentId, departmentId),
        columns: { userId: true },
      });
      const userIds = deptUsers.map((u: { userId: string }) => u.userId);

      if (userIds.length > 0) {
        await tx
          .delete(schema.usersToDepartments)
          .where(
            and(
              inArray(schema.usersToDepartments.userId, userIds),
              eq(schema.usersToDepartments.departmentId, departmentId),
            ),
          );

        for (const userId of userIds) {
          const remaining = await tx.query.usersToDepartments.findMany({
            where: eq(schema.usersToDepartments.userId, userId),
          });
          if (remaining.length === 0) {
            await tx
              .insert(schema.usersToDepartments)
              .values({ userId, departmentId: unassignedDept.id });
          }
        }
      }
    });

    this.logger.log(
      `Department soft-deleted: ${departmentId} by user ${requester.id}`,
    );
    return { deleted: true };
  }

  async seedDefaultDepartments(companyId: string): Promise<IDepartment[]> {
    const departments =
      await this.departmentRepository.seedDefaultDepartments(companyId);
    return departments.map(mapDepartmentToIDepartment);
  }
}
