import { Injectable, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull, SQL } from 'drizzle-orm';
import { InsertUser } from './schemas/user.schema';

@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DB_CONNECTION)
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) { }

  async findById(id: string) {
    return this.db.query.users.findFirst({
      where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      },
    });
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: and(eq(schema.users.email, email), isNull(schema.users.deletedAt)),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      },
    });
  }

  async findByUsername(username: string) {
    return this.db.query.users.findFirst({
      where: and(
        eq(schema.users.username, username),
        isNull(schema.users.deletedAt),
      ),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      },
    });
  }

  async findAll(filters: SQL[]) {
    return this.db.query.users.findMany({
      where: and(...filters),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      },
    });
  }

  async create(userData: InsertUser, departmentIds?: string[]) {
    return this.db.transaction(async (tx) => {
      const [user] = await tx.insert(schema.users).values(userData).returning();

      if (departmentIds && departmentIds.length > 0) {
        await tx.insert(schema.usersToDepartments).values(
          departmentIds.map((dId) => ({
            userId: user.id,
            departmentId: dId,
          })),
        );
      }

      return user;
    });
  }

  async update(
    id: string,
    updateData: Partial<InsertUser>,
    departmentIds?: string[],
  ) {
    return this.db.transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx
          .update(schema.users)
          .set({ ...updateData, updatedAt: new Date() })
          .where(eq(schema.users.id, id));
      }

      if (departmentIds !== undefined) {
        await tx
          .delete(schema.usersToDepartments)
          .where(eq(schema.usersToDepartments.userId, id));

        if (departmentIds.length > 0) {
          await tx.insert(schema.usersToDepartments).values(
            departmentIds.map((dId) => ({
              userId: id,
              departmentId: dId,
            })),
          );
        }
      }

      // Return the updated user with relations
      return tx.query.users.findFirst({
        where: eq(schema.users.id, id),
        with: {
          role: true,
          usersToDepartments: { with: { department: true } },
        },
      });
    });
  }

  async softDelete(id: string) {
    return this.db
      .update(schema.users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
  }

  async findRoleById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      columns: {
        roleId: true,
      },
    });
  }

  async transaction<T>(
    callback: (tx: PostgresJsDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return this.db.transaction(callback as any);
  }

  readonly schema = schema;
}
