import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DEFAULT_DEPARTMENTS } from '@ticket-registrator/shared';

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
                eq(schema.companies.isVisible, true),
            ),
        });
        if (!company) throw new NotFoundException('Company not found');

        // Prevent duplicate department names within the same company
        const existing = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.companyId, companyId),
                eq(schema.departments.departmentName, dto.name as string),
                eq(schema.departments.isVisible, true),
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
                eq(schema.departments.isVisible, true),
            ),
        });
    }

    async findOne(companyId: string, departmentId: string) {
        const department = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.id, departmentId),
                eq(schema.departments.companyId, companyId),
                eq(schema.departments.isVisible, true),
            ),
        });
        if (!department) throw new NotFoundException('Department not found');
        return department;
    }

    async softDelete(companyId: string, departmentId: string) {
        const department = await this.db.query.departments.findFirst({
            where: and(
                eq(schema.departments.id, departmentId),
                eq(schema.departments.companyId, companyId),
            ),
        });
        if (!department) throw new NotFoundException('Department not found');
        if (!department.isVisible) throw new ConflictException('Department already deleted');

        await this.db
            .update(schema.departments)
            .set({ isVisible: false })
            .where(eq(schema.departments.id, departmentId));

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

