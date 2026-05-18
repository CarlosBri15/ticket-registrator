import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { Company, InsertCompany } from './schema/organization.schema';

@Injectable()
export class OrganizationRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.db.query.companies.findMany({
      where: isNull(schema.companies.deletedAt),
    });
  }

  async findById(id: string): Promise<Company | undefined> {
    return this.db.query.companies.findFirst({
      where: and(
        eq(schema.companies.id, id),
        isNull(schema.companies.deletedAt),
      ),
    });
  }

  async findByIdIncludingDeleted(id: string): Promise<Company | undefined> {
    return this.db.query.companies.findFirst({
      where: eq(schema.companies.id, id),
    });
  }

  async findByName(name: string): Promise<Company | undefined> {
    return this.db.query.companies.findFirst({
      where: eq(schema.companies.orgName, name),
    });
  }

  async create(data: InsertCompany): Promise<Company> {
    const [company] = await this.db
      .insert(schema.companies)
      .values(data)
      .returning();
    return company;
  }

  async update(
    id: string,
    data: Partial<InsertCompany>,
  ): Promise<Company | undefined> {
    const [updated] = await this.db
      .update(schema.companies)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.companies.id, id))
      .returning();
    return updated;
  }

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback);
  }
}
