import { Injectable, ConflictException, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, isNull, and, inArray } from 'drizzle-orm';
import { OnboardOrganizationDto } from './dto/onboard-organization.dto';
import { DepartmentService } from '../department/department.service';
import { AuthService } from '../auth/auth.service';
import { Roles } from '@ticket-registrator/shared';
import { UNASSIGNED_DEPARTMENT_NAME } from '../seed/seed.service';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationService {
    constructor(
        @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
        private departmentService: DepartmentService,
        private authService: AuthService,
    ) { }

    /**
     * Onboards a new company: atomically creates the company, seeds departments,
     * and creates the initial admin users with temporary credentials.
     */
    async onboard(dto: OnboardOrganizationDto) {
        // Destructure with non-null assertions (nestjs-zod infers fields as optional)
        const company = dto.company!;
        const admins = dto.admins!;

        // 1. Find the global Unassigned department
        const unassignedDept = await this.db.query.departments.findFirst({
            where: eq(schema.departments.departmentName, UNASSIGNED_DEPARTMENT_NAME),
        });
        if (!unassignedDept) {
            throw new BadRequestException('System is not ready: global Unassigned department not found. Please restart the server.');
        }

        // 2. Find the Admin role
        const adminRole = await this.db.query.roles.findFirst({
            where: eq(schema.roles.name, Roles.ADMIN),
        });
        if (!adminRole) {
            throw new BadRequestException('System is not ready: Admin role not found. Please restart the server.');
        }

        return this.db.transaction(async (tx) => {
            // 3. Create the company
            const companyName = company.name!; // nestjs-zod infers as optional, assert it's defined
            const existingCompany = await tx.query.companies.findFirst({
                where: eq(schema.companies.orgName, companyName),
            });
            if (existingCompany) {
                throw new ConflictException(`Organization "${companyName}" already exists`);
            }

            const [createdCompany] = await tx
                .insert(schema.companies)
                .values({ orgName: companyName })
                .returning();

            // 5. Create admin users with temporary credentials
            const createdAdmins: { id: string; name: string | null; email: string | null; username: string; temporaryPassword: string }[] = [];
            for (const adminInfo of admins) {
                // Check email uniqueness
                const emailExists = await tx.query.users.findFirst({
                    where: eq(schema.users.email, adminInfo.email!),
                });
                if (emailExists) {
                    throw new ConflictException(`Email "${adminInfo.email}" is already in use`);
                }

                // Generate temporary credentials
                const tempPassword = randomBytes(8).toString('hex'); // 16 char hex string
                const tempUsername = `admin_${randomBytes(4).toString('hex')}`; // e.g. admin_a3f2b1c0
                const hashedPassword = await this.authService.hashPassword(tempPassword);

                const [newAdmin] = await tx.insert(schema.users).values({
                    name: adminInfo.name,
                    surname: adminInfo.surname,
                    email: adminInfo.email,
                    username: tempUsername,
                    password: hashedPassword,
                    companyId: createdCompany.id,
                    roleId: adminRole.id,
                }).returning();

                // Assign department
                await tx.insert(schema.usersToDepartments).values({
                    userId: newAdmin.id,
                    departmentId: unassignedDept.id,
                });


                createdAdmins.push({
                    id: newAdmin.id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    username: tempUsername,
                    temporaryPassword: tempPassword, // Displayed once, should be sent via email
                });
            }

            return {
                company: createdCompany,
                admins: createdAdmins,
                message: `Company "${createdCompany.orgName}" onboarded. Send the temporary credentials to each admin via email.`,
            };
        });
    }

    async findAll() {
        return this.db.query.companies.findMany({
            where: isNull(schema.companies.deletedAt),
        });
    }

    async findOne(id: string) {
        const company = await this.db.query.companies.findFirst({
            where: and(
                eq(schema.companies.id, id),
                isNull(schema.companies.deletedAt)
            ),
        });
        if (!company) {
            throw new NotFoundException('Organization not found');
        }
        return company;
    }

    async update(id: string, dto: { name?: string }) {
        const company = await this.db.query.companies.findFirst({
            where: and(
                eq(schema.companies.id, id),
                isNull(schema.companies.deletedAt)
            ),
        });
        if (!company) {
            throw new NotFoundException('Organization not found');
        }

        const updates: any = {};
        if (dto.name !== undefined) updates.orgName = dto.name;

        if (Object.keys(updates).length === 0) {
            return company;
        }

        updates.updatedAt = new Date();

        const [updatedCompany] = await this.db
            .update(schema.companies)
            .set(updates)
            .where(eq(schema.companies.id, id))
            .returning();

        return updatedCompany;
    }

    async softDelete(id: string) {
        const company = await this.db.query.companies.findFirst({
            where: eq(schema.companies.id, id),
        });
        if (!company) throw new NotFoundException('Organization not found');
        if (company.deletedAt) throw new ConflictException('Organization already deleted');

        await this.db.transaction(async (tx) => {
            // 1. Soft delete the company
            await tx.update(schema.companies)
                .set({ deletedAt: new Date(), updatedAt: new Date() })
                .where(eq(schema.companies.id, id));

            // 2. Soft delete all departments for the company
            await tx.update(schema.departments)
                .set({ deletedAt: new Date(), updatedAt: new Date() })
                .where(eq(schema.departments.companyId, id));

            // 3. Find all users for the company
            const companyUsers = await tx.query.users.findMany({
                where: eq(schema.users.companyId, id),
                columns: { id: true }
            });
            const userIds = companyUsers.map(u => u.id);

            if (userIds.length > 0) {
                // 4. Soft delete users
                await tx.update(schema.users)
                    .set({ deletedAt: new Date(), updatedAt: new Date() })
                    .where(inArray(schema.users.id, userIds));

                // 5. Find all reports for these users
                const userReports = await tx.query.reports.findMany({
                    where: inArray(schema.reports.userId, userIds),
                    columns: { id: true }
                });
                const reportIds = userReports.map(r => r.id);

                if (reportIds.length > 0) {
                    // 6. Soft delete reports
                    await tx.update(schema.reports)
                        .set({ isVisible: false, updatedAt: new Date() })
                        .where(inArray(schema.reports.id, reportIds));

                    // 7. Soft delete tickets
                    await tx.update(schema.tickets)
                        .set({ isVisible: false, updatedAt: new Date() })
                        .where(inArray(schema.tickets.reportId, reportIds));
                }
            }
        });

        return { deleted: true };
    }
}
