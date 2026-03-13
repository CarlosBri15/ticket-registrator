import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull, inArray, sql } from 'drizzle-orm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DEFAULT_DEPARTMENTS } from '@ticket-registrator/shared';
import { UNASSIGNED_DEPARTMENT_NAME } from '../seed/seed.service';

@Injectable()
export class DepartmentService {
    constructor(
        @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async create(companyId: string, dto: CreateDepartmentDto) {
        // Ensure the company exists and is visible
        const company = await this.db.query.companies.findFirst({
            where: and(
                eq(schema.companies.id, companyId),
                isNull(schema.companies.deletedAt),
            ),
        });
        if (!company) throw new NotFoundException('Company not found');

        // Prevent duplicate department names within the same company
        const existing = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.companyId, companyId),
                eq(schema.departments.departmentName, dto.name as string),
                isNull(schema.departments.deletedAt),
            ),
        });
        if (existing) {
            throw new ConflictException(`Department "${dto.name}" already exists in this company`);
        }

        const [department] = await this.db
            .insert(schema.departments)
            .values({ companyId, departmentName: dto.name as string })
            .returning();

        return department;
    }

    async findAllByCompany(companyId: string) {
        return this.db.query.departments.findMany({
            where: and(
                eq(schema.departments.companyId, companyId),
                isNull(schema.departments.deletedAt),
            ),
        });
    }

    async findOne(companyId: string, departmentId: string) {
        const department = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.id, departmentId),
                eq(schema.departments.companyId, companyId),
                isNull(schema.departments.deletedAt),
            ),
        });
        if (!department) throw new NotFoundException('Department not found');
        return department;
    }

    async update(companyId: string, departmentId: string, dto: { name?: string }) {
        const department = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.id, departmentId),
                eq(schema.departments.companyId, companyId),
                isNull(schema.departments.deletedAt),
            ),
        });
        if (!department) throw new NotFoundException('Department not found');

        if (!dto.name) {
            return department;
        }

        const [updatedDept] = await this.db
            .update(schema.departments)
            .set({
                departmentName: dto.name,
                updatedAt: new Date()
            })
            .where(eq(schema.departments.id, departmentId))
            .returning();

        return updatedDept;
    }

    async softDelete(companyId: string, departmentId: string) {
        const department = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.id, departmentId),
                eq(schema.departments.companyId, companyId),
            ),
        });
        if (!department) throw new NotFoundException('Department not found');
        if (department.deletedAt) throw new ConflictException('Department already deleted');

        const unassignedDept = await this.db.query.departments.findFirst({
            where: eq(schema.departments.departmentName, UNASSIGNED_DEPARTMENT_NAME),
        });
        if (!unassignedDept) throw new ConflictException('Global Unassigned department not found');

        await this.db.transaction(async (tx) => {
            // 1. Soft delete the department
            await tx.update(schema.departments)
                .set({ deletedAt: new Date(), updatedAt: new Date() })
                .where(eq(schema.departments.id, departmentId));

            // 2. Find all users associated with this department via junction table
            const deptUsers = await tx.query.usersToDepartments.findMany({
                where: eq(schema.usersToDepartments.departmentId, departmentId),
                columns: { userId: true }
            });
            const userIds = deptUsers.map(u => u.userId);

            if (userIds.length > 0) {
                // 3. Remove department association from junction table
                await tx.delete(schema.usersToDepartments)
                    .where(and(
                        inArray(schema.usersToDepartments.userId, userIds),
                        eq(schema.usersToDepartments.departmentId, departmentId)
                    ));

                // 4. For each user, check if they have any departments left
                for (const userId of userIds) {
                    const remainingDepts = await tx.query.usersToDepartments.findMany({
                        where: eq(schema.usersToDepartments.userId, userId)
                    });

                    if (remainingDepts.length === 0) {
                        // Assign to Unassigned
                        await tx.insert(schema.usersToDepartments).values({
                            userId: userId,
                            departmentId: unassignedDept.id
                        });
                    }
                }
            }
        });


        return { deleted: true };
    }

    async seedDefaultDepartments(companyId: string) {
        return this.db.insert(schema.departments).values(
            DEFAULT_DEPARTMENTS.map(name => ({
                companyId,
                departmentName: name,
            }))
        ).returning();
    }
}

