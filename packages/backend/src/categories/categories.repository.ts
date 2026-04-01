import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, or, and, isNull } from 'drizzle-orm';
import { InsertCategory, Category } from './schemas/category.schema';

@Injectable()
export class CategoriesRepository {
    constructor(
        @Inject(DB_CONNECTION)
        private readonly db: PostgresJsDatabase<typeof schema>,
    ) { }

    async create(data: InsertCategory): Promise<Category> {
        const [result] = await this.db
            .insert(schema.categories)
            .values({
                name: data.name,
                description: data.description,
                organizationId: data.organizationId,
                isSystem: data.isSystem ?? false,
            })
            .returning();
        return result;
    }

    async createMany(data: InsertCategory[]): Promise<Category[]> {
        return this.db
            .insert(schema.categories)
            .values(data.map(item => ({
                ...item,
                isSystem: item.isSystem ?? false,
            })))
            .returning();
    }

    async findByOrganization(organizationId: string): Promise<Category[]> {
        return this.db.query.categories.findMany({
            where: and(
                or(
                    eq(schema.categories.organizationId, organizationId),
                    eq(schema.categories.isSystem, true),
                ),
                isNull(schema.categories.deletedAt)
            ),
        });
    }

    async findAllSystemCategories(): Promise<Category[]> {
        return this.db.query.categories.findMany({
            where: and(
                eq(schema.categories.isSystem, true),
                isNull(schema.categories.deletedAt)
            ),
        });
    }

    async findById(id: string): Promise<Category | undefined> {
        return this.db.query.categories.findFirst({
            where: and(
                eq(schema.categories.id, id),
                isNull(schema.categories.deletedAt)
            ),
        });
    }

    async delete(id: string): Promise<void> {
        await this.db
            .delete(schema.categories)
            .where(eq(schema.categories.id, id));
    }

    async softDelete(id: string): Promise<boolean> {
        const [result] = await this.db
            .update(schema.categories)
            .set({
                deletedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(schema.categories.id, id))
            .returning();
        return !!result;
    }

    async update(id: string, data: Partial<InsertCategory>): Promise<Category | undefined> {
        const [result] = await this.db
            .update(schema.categories)
            .set({
                ...data,
                updatedAt: new Date(),
            })
            .where(eq(schema.categories.id, id))
            .returning();
        return result;
    }
}
