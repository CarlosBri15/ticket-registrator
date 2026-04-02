import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../db/schema';
import {
  IOrganization,
  IOnboardResponse,
  Roles,
} from '@ticket-registrator/shared';
import { randomBytes } from 'node:crypto';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationRepository } from './organization.repository';
import { OrganizationAuthorizationService } from './organization-authorization.service';
import { mapCompanyToIOrganization } from './mapper/organization.mapper';
import {
  OrganizationNotFoundException,
  OrganizationConflictException,
  OrganizationAlreadyDeletedException,
} from './exceptions/organization.exceptions';
import { DepartmentService } from '../department/department.service';
import { CryptoService } from '../crypto/crypto.service';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { UNASSIGNED_DEPARTMENT_NAME } from '../seed/seed.service';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAuthService: OrganizationAuthorizationService,
    private readonly departmentService: DepartmentService,
    private readonly cryptoService: CryptoService,
  ) {}

  async onboard(
    requester: UserPayload,
    dto: OnboardOrganizationDto,
  ): Promise<IOnboardResponse> {
    this.organizationAuthService.validateCanCreate(requester);

    const company = dto.company!;
    const admins = dto.admins!;

    const existing = await this.organizationRepository.findByName(
      company.name!,
    );
    if (existing) {
      throw new OrganizationConflictException(
        `Organization "${company.name}" already exists`,
      );
    }

    return this.organizationRepository.transaction(async (tx) => {
      const unassignedDept = await tx.query.departments.findFirst({
        where: eq(
          schema.departments.departmentName,
          UNASSIGNED_DEPARTMENT_NAME,
        ),
      });
      if (!unassignedDept) {
        throw new BadRequestException(
          'System is not ready: global Unassigned department not found.',
        );
      }

      const adminRole = await tx.query.roles.findFirst({
        where: eq(schema.roles.name, Roles.ADMIN),
      });
      if (!adminRole) {
        throw new BadRequestException(
          'System is not ready: Admin role not found.',
        );
      }

      const [createdCompany] = await tx
        .insert(schema.companies)
        .values({ orgName: company.name! })
        .returning();

      const createdAdmins: IOnboardResponse['admins'] = [];

      for (const adminInfo of admins) {
        const emailExists = await tx.query.users.findFirst({
          where: eq(schema.users.email, adminInfo.email!),
        });
        if (emailExists) {
          throw new OrganizationConflictException(
            `Email "${adminInfo.email}" is already in use`,
          );
        }

        const tempPassword = randomBytes(8).toString('hex');
        const tempUsername = `admin_${randomBytes(4).toString('hex')}`;
        const hashedPassword =
          await this.cryptoService.hashPassword(tempPassword);

        const [newAdmin] = await tx
          .insert(schema.users)
          .values({
            name: adminInfo.name,
            surname: adminInfo.surname,
            email: adminInfo.email,
            username: tempUsername,
            password: hashedPassword,
            companyId: createdCompany.id,
            roleId: adminRole.id,
          })
          .returning();

        await tx.insert(schema.usersToDepartments).values({
          userId: newAdmin.id,
          departmentId: unassignedDept.id,
        });

        createdAdmins.push({
          id: newAdmin.id,
          name: newAdmin.name,
          email: newAdmin.email,
          username: tempUsername,
          temporaryPassword: tempPassword,
        });
      }

      this.logger.log(
        `Organization onboarded: ${createdCompany.id} by user ${requester.id}`,
      );

      return {
        company: mapCompanyToIOrganization(createdCompany),
        admins: createdAdmins,
        message: `Company "${createdCompany.orgName}" onboarded. Send the temporary credentials to each admin via email.`,
      };
    });
  }

  async findAll(requester: UserPayload): Promise<IOrganization[]> {
    this.organizationAuthService.validateCanViewAll(requester);
    const companies = await this.organizationRepository.findAll();
    return companies.map(mapCompanyToIOrganization);
  }

  async findOne(id: string): Promise<IOrganization> {
    const company = await this.organizationRepository.findById(id);
    if (!company) throw new OrganizationNotFoundException(id);
    return mapCompanyToIOrganization(company);
  }

  async update(
    requester: UserPayload,
    id: string,
    dto: UpdateOrganizationDto,
  ): Promise<IOrganization> {
    this.organizationAuthService.validateCanUpdate(requester, id);

    const company = await this.organizationRepository.findById(id);
    if (!company) throw new OrganizationNotFoundException(id);

    if (!dto.name) return mapCompanyToIOrganization(company);

    const updated = await this.organizationRepository.update(id, {
      orgName: dto.name,
    });
    if (!updated) throw new OrganizationNotFoundException(id);

    this.logger.log(`Organization updated: ${id} by user ${requester.id}`);
    return mapCompanyToIOrganization(updated);
  }

  async softDelete(
    requester: UserPayload,
    id: string,
  ): Promise<{ deleted: boolean }> {
    this.organizationAuthService.validateCanDelete(requester);

    const company =
      await this.organizationRepository.findByIdIncludingDeleted(id);
    if (!company) throw new OrganizationNotFoundException(id);
    if (company.deletedAt) throw new OrganizationAlreadyDeletedException();

    await this.organizationRepository.transaction(async (tx) => {
      await tx
        .update(schema.companies)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.companies.id, id));

      await tx
        .update(schema.departments)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.departments.companyId, id));

      const companyUsers = await tx.query.users.findMany({
        where: eq(schema.users.companyId, id),
        columns: { id: true },
      });
      const userIds = companyUsers.map((u: { id: string }) => u.id);

      if (userIds.length > 0) {
        await tx
          .update(schema.users)
          .set({ deletedAt: new Date(), updatedAt: new Date() })
          .where(inArray(schema.users.id, userIds));

        const userReports = await tx.query.reports.findMany({
          where: inArray(schema.reports.userId, userIds),
          columns: { id: true },
        });
        const reportIds = userReports.map((r: { id: string }) => r.id);

        if (reportIds.length > 0) {
          await tx
            .update(schema.reports)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(inArray(schema.reports.id, reportIds));

          await tx
            .update(schema.tickets)
            .set({ deletedAt: new Date(), updatedAt: new Date() })
            .where(inArray(schema.tickets.reportId, reportIds));
        }
      }
    });

    this.logger.log(`Organization soft-deleted: ${id} by user ${requester.id}`);
    return { deleted: true };
  }
}
