import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { Department, InsertDepartment } from './schema/department.schema';
import { DEFAULT_DEPARTMENTS } from '@ticket-registrator/shared';

@Injectable()
export class DepartmentRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAllByCompany(companyId: string): Promise<Department[]> {
    return this.db.query.departments.findMany({
      where: and(
        eq(schema.departments.companyId, companyId),
        isNull(schema.departments.deletedAt),
      ),
    });
  }

  async findOne(
    companyId: string,
    departmentId: string,
  ): Promise<Department | undefined> {
    return this.db.query.departments.findFirst({
      where: and(
        eq(schema.departments.id, departmentId),
        eq(schema.departments.companyId, companyId),
        isNull(schema.departments.deletedAt),
      ),
    });
  }

  async findByIdIncludingDeleted(
    companyId: string,
    departmentId: string,
  ): Promise<Department | undefined> {
    return this.db.query.departments.findFirst({
      where: and(
        eq(schema.departments.id, departmentId),
        eq(schema.departments.companyId, companyId),
      ),
    });
  }

  async findByName(
    companyId: string,
    name: string,
  ): Promise<Department | undefined> {
    return this.db.query.departments.findFirst({
      where: and(
        eq(schema.departments.companyId, companyId),
        eq(schema.departments.departmentName, name),
        isNull(schema.departments.deletedAt),
      ),
    });
  }

  async findUnassigned(name: string): Promise<Department | undefined> {
    return this.db.query.departments.findFirst({
      where: eq(schema.departments.departmentName, name),
    });
  }

  async findCompanyById(companyId: string) {
    return this.db.query.companies.findFirst({
      where: and(
        eq(schema.companies.id, companyId),
        isNull(schema.companies.deletedAt),
      ),
    });
  }

  async create(data: InsertDepartment): Promise<Department> {
    const [department] = await this.db
      .insert(schema.departments)
      .values(data)
      .returning();
    return department;
  }

  async update(
    departmentId: string,
    data: Partial<InsertDepartment>,
  ): Promise<Department | undefined> {
    const [updated] = await this.db
      .update(schema.departments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.departments.id, departmentId))
      .returning();
    return updated;
  }

  async seedDefaultDepartments(companyId: string): Promise<Department[]> {
    return this.db
      .insert(schema.departments)
      .values(
        DEFAULT_DEPARTMENTS.map((name) => ({
          companyId,
          departmentName: name,
        })),
      )
      .returning();
  }

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(
      callback as (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
    );
  }
}
