import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, or, lte, gte, count, desc, SQL, isNull } from 'drizzle-orm';
import { Report } from './schemas/report.schema';

@Injectable()
export class ReportsRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) { }

  async findById(id: string): Promise<Report | undefined> {
    return this.db.query.reports.findFirst({
      where: and(eq(schema.reports.id, id), isNull(schema.reports.deletedAt)),
      with: {
        tickets: {
          with: {
            items: {
              with: {
                category: true,
              },
            },
          },
        },
      },
    });
  }

  async findWithFilters(filters: {
    where: SQL;
    limit?: number;
    offset?: number;
    orderBy?: SQL | SQL[];
  }) {
    const { where, limit, offset, orderBy } = filters;

    const results = await this.db
      .select({ report: schema.reports })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(where)
      .orderBy(
        ...(Array.isArray(orderBy)
          ? orderBy
          : [orderBy || desc(schema.reports.createdAt)]),
      )
      .limit(limit || 10)
      .offset(offset || 0);

    const countRes = await this.db
      .select({ count: count() })
      .from(schema.reports)
      .innerJoin(schema.users, eq(schema.reports.userId, schema.users.id))
      .where(where);

    return {
      data: results.map((row) => row.report),
      total: Number(countRes[0]?.count ?? 0),
    };
  }

  async findByUserId(userId: string): Promise<Report[]> {
    return this.db.query.reports.findMany({
      where: and(
        eq(schema.reports.userId, userId),
        isNull(schema.reports.deletedAt),
      ),
    });
  }

  async findOverlapping(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Report | undefined> {
    return this.db.query.reports.findFirst({
      where: and(
        eq(schema.reports.userId, userId),
        or(
          and(
            lte(schema.reports.startDate, endDate),
            gte(schema.reports.endDate, startDate),
          ),
        ),
      ),
    });
  }

  async create(data: schema.InsertReport): Promise<Report> {
    const [report] = await this.db
      .insert(schema.reports)
      .values(data)
      .returning();
    return report;
  }

  async update(
    id: string,
    data: Partial<schema.InsertReport>,
  ): Promise<Report | undefined> {
    const [updated] = await this.db
      .update(schema.reports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.reports.id, id))
      .returning();
    return updated;
  }

  async updateWithCondition(
    id: string,
    data: Partial<schema.InsertReport>,
    condition: SQL,
  ): Promise<Report | undefined> {
    const [updated] = await this.db
      .update(schema.reports)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(schema.reports.id, id), condition))
      .returning();
    return updated;
  }

  async softDelete(id: string): Promise<boolean> {
    const [updated] = await this.db
      .update(schema.reports)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.reports.id, id))
      .returning();
    return !!updated;
  }

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    // A cast to any is often needed here for Drizzle's internal transaction context matching NestJS wrappers,
    // but at least the callback itself is strictly typed for the caller.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.db.transaction(callback as any);
  }
}
