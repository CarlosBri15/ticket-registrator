import { Injectable, ConflictException, Inject, NotFoundException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { DepartmentService } from '../department/department.service';

@Injectable()
export class OrganizationService {
    constructor(
        @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
        private departmentService: DepartmentService,
    ) { }

    async create(dto: CreateOrganizationDto) {
        // Check if org with same name already exists
        const existing = await this.db.query.companies.findFirst({
            where: eq(schema.companies.orgName, dto.name as string),
        });
        if (existing) {
            throw new ConflictException(`Organization "${dto.name}" already exists`);
        }

        const [company] = await this.db
            .insert(schema.companies)
            .values({ orgName: dto.name as string })
            .returning();

        // Seed default corporate departments
        await this.departmentService.seedDefaultDepartments(company.id);

        return company;
    }

    async findAll() {
        return this.db.query.companies.findMany({
            where: eq(schema.companies.isVisible, true),
        });
    }

    async findOne(id: string) {
        const company = await this.db.query.companies.findFirst({
            where: eq(schema.companies.id, id),
        });
        if (!company || !company.isVisible) {
            throw new NotFoundException('Organization not found');
        }
        return company;
    }

    async softDelete(id: string) {
        const company = await this.db.query.companies.findFirst({
            where: eq(schema.companies.id, id),
        });
        if (!company) throw new NotFoundException('Organization not found');
        if (!company.isVisible) throw new ConflictException('Organization already deleted');

        await this.db
            .update(schema.companies)
            .set({ isVisible: false })
            .where(eq(schema.companies.id, id));

        return { deleted: true };
    }
}

