import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, or, inArray, isNull, sql } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser, permissions, AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import type { PermissionType, RoleType } from '@ticket-registrator/shared';
import { mapUserToIUser } from './mapper/users.mapper';
import { CryptoService } from '../crypto/crypto.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
    private readonly cryptoService: CryptoService,
  ) { }

  async create(
    createUserDto: CreateUserDto,
    creator: {
      roleId: string;
      roleName: RoleType;
      roleHierarchy: number;
      companyId: string;
      departmentIds: string[];
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    if (!createUserDto.password) {
      throw new ConflictException('Password is required');
    }

    createUserDto.password = await this.cryptoService.hashPassword(createUserDto.password);

    const isSuperAdmin = creator.roleHierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const targetCompanyId = (isSuperAdmin && (createUserDto as any).companyId)
      ? (createUserDto as any).companyId
      : creator.companyId;

    const targetRole = await this.db.query.roles.findFirst({
      where: and(
        eq(schema.roles.name, createUserDto.roleId as string),
        or(isNull(schema.roles.companyId), eq(schema.roles.companyId, targetCompanyId))
      ),
    });

    if (!targetRole) {
      throw new BadRequestException('Role not found for the target company');
    }

    const creatorHierarchy = creator.roleHierarchy;
    const targetHierarchy = targetRole.hierarchy;

    if (creatorHierarchy <= targetHierarchy) {
      throw new ConflictException('Cannot assign a role higher or equal than your own highest role');
    }

    const isCreatingAdmin = targetRole.hierarchy >= AUTHORITY_LEVELS.COMPANY && targetRole.hierarchy < AUTHORITY_LEVELS.GLOBAL;
    if (isCreatingAdmin && !creator.permissions.includes(permissions.CREATE_ADMINS)) {
      throw new ForbiddenException('You do not have permission to create Admin users');
    }

    const company = await this.db.query.companies.findFirst({
      where: eq(schema.companies.id, targetCompanyId)
    });
    if (!company) {
      throw new ConflictException('Target company does not exist');
    }

    if (creator.roleHierarchy >= AUTHORITY_LEVELS.DEPARTMENT && creator.roleHierarchy < AUTHORITY_LEVELS.COMPANY) {
      for (const deptId of createUserDto.departmentIds!) {
        if (!creator.departmentIds.includes(deptId)) {
          throw new ForbiddenException('Managers can only assign departments they belong to');
        }
      }
    }

    const departments = await this.db.query.departments.findMany({
      where: and(
        inArray(schema.departments.id, createUserDto.departmentIds!),
        eq(schema.departments.companyId, company.id)
      )
    });

    if (departments.length !== createUserDto.departmentIds!.length) {
      throw new ConflictException('One or more departments do not exist in this company');
    }

    const { roleId: _, confirmPassword: __, companyId: ___, departmentIds: ____, ...rest } = createUserDto as any;
    const userToCreate = {
      ...rest,
      password: createUserDto.password as string,
      companyId: company.id,
      roleId: targetRole.id,
    };

    try {
      const savedUser = await this.db.transaction(async (tx) => {
        const [user] = await tx.insert(schema.users).values(userToCreate as any).returning();

        if (createUserDto.departmentIds && createUserDto.departmentIds.length > 0) {
          await tx.insert(schema.usersToDepartments).values(
            createUserDto.departmentIds.map(dId => ({ userId: user.id, departmentId: dId }))
          );
        }

        return user;
      });

      const fullUser = await this.db.query.users.findFirst({
        where: eq(schema.users.id, savedUser.id),
        with: {
          role: true,
          usersToDepartments: { with: { department: true } },
        }
      });

      return mapUserToIUser(fullUser as any);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('email')) throw new ConflictException('Email already exists');
        if (error.detail?.includes('username')) throw new ConflictException('Username already exists');
      }
      throw new BadRequestException(error.message || 'Validation failed');
    }
  }

  async findMe(userId: string): Promise<IUser> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserToIUser(user as any);
  }

  async findUserRole(userId: string): Promise<{ roleId: string } | undefined> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        roleId: true,
      },
    });
    return user;
  }

  async findAll(requester: {
    id: string;
    roleId: string;
    roleName: RoleType;
    roleHierarchy: number;
    companyId: string;
    departmentIds: string[];
    permissions: PermissionType[];
  }): Promise<IUser[]> {
    const maxHierarchy = requester.roleHierarchy;
    let userFilters = [isNull(schema.users.deletedAt)];

    if (maxHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      userFilters.push(eq(schema.users.companyId, requester.companyId));

      if (maxHierarchy >= AUTHORITY_LEVELS.DEPARTMENT && maxHierarchy < AUTHORITY_LEVELS.COMPANY) {
        userFilters.push(sql`EXISTS (
          SELECT 1 FROM ${schema.usersToDepartments} ud
          WHERE ud.user_id = ${schema.users.id}
          AND ud.department_id = ANY(${requester.departmentIds}::uuid[])
        )`);
      } else if (maxHierarchy < AUTHORITY_LEVELS.DEPARTMENT) {
        userFilters.push(eq(schema.users.id, requester.id));
      }
    }

    const allUsers = await this.db.query.users.findMany({
      where: and(...userFilters),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      }
    });

    return allUsers.map(u => mapUserToIUser(u as any));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requester: {
      id: string;
      roleId: string;
      roleName: RoleType;
      roleHierarchy: number;
      companyId: string;
      departmentIds: string[];
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    const userWithRels = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        role: true,
        usersToDepartments: { with: { department: true } },
      }
    });

    if (!userWithRels) throw new NotFoundException('User not found');

    const targetRole = userWithRels.role;
    const targetHierarchy = targetRole ? targetRole.hierarchy : 0;
    const requesterHierarchy = requester.roleHierarchy;
    const isSelfUpdate = userWithRels.id === requester.id;

    if (isSelfUpdate) {
      if (!requester.permissions.includes(permissions.EDIT_USERS)) {
        throw new ForbiddenException('You cannot update your own info');
      }
      const forbiddenFields = ['roles', 'departmentIds', 'companyId'];
      for (const field of forbiddenFields) {
        if (field in updateUserDto) {
          throw new ForbiddenException(`You cannot update your own ${field}`);
        }
      }
    } else {
      if (requesterHierarchy < AUTHORITY_LEVELS.DEPARTMENT) {
        throw new ForbiddenException('You cannot update other users');
      }
      if (userWithRels.companyId !== requester.companyId && requester.roleHierarchy < AUTHORITY_LEVELS.GLOBAL) {
        throw new ForbiddenException('Cannot update users outside your company');
      }
      if (requester.roleHierarchy >= AUTHORITY_LEVELS.COMPANY && targetHierarchy >= requesterHierarchy) {
        throw new ForbiddenException('Cannot update users with equal or higher role');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.cryptoService.hashPassword(updateUserDto.password);
    }

    const { roleId, departmentIds, ...rest } = updateUserDto as any;

    try {
      await this.db.transaction(async (tx) => {
        if (Object.keys(rest).length > 0) {
          await tx.update(schema.users)
            .set({ ...rest, updatedAt: new Date() })
            .where(eq(schema.users.id, id));
        }

        if (roleId) {
          const targetRoleFromDb = await tx.query.roles.findFirst({
            where: and(
              eq(schema.roles.name, roleId as string),
              or(isNull(schema.roles.companyId), eq(schema.roles.companyId, userWithRels.companyId as string))
            ),
          });
          if (!targetRoleFromDb) throw new BadRequestException('Invalid role provided');

          if (targetRoleFromDb.hierarchy >= requesterHierarchy) {
            throw new ForbiddenException('Cannot assign a role equal or higher than your own');
          }

          await tx.update(schema.users)
            .set({ roleId: targetRoleFromDb.id })
            .where(eq(schema.users.id, id));
        }

        if (departmentIds) {
          const targetDepts = await tx.query.departments.findMany({
            where: and(inArray(schema.departments.id, departmentIds), eq(schema.departments.companyId, userWithRels.companyId as string))

          });
          if (targetDepts.length !== departmentIds.length) throw new BadRequestException('Invalid departments');

          await tx.delete(schema.usersToDepartments).where(eq(schema.usersToDepartments.userId, id));
          await tx.insert(schema.usersToDepartments).values(departmentIds.map(dId => ({ userId: id, departmentId: dId })));
        }
      });

      return this.findMe(id);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('email')) throw new ConflictException('Email already exists');
        if (error.detail?.includes('username')) throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async remove(userId: string, requester: any) {
    const userWithRels = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      with: { role: true, usersToDepartments: true }
    });

    if (!userWithRels || userWithRels.deletedAt) throw new NotFoundException('User not found');

    const targetHierarchy = userWithRels.role?.hierarchy || 0;
    const requesterHierarchy = requester.roleHierarchy;

    if (targetHierarchy >= requesterHierarchy) throw new ForbiddenException('Cannot delete users with equal or higher role');

    await this.db.update(schema.users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    return { deleted: true };
  }

  async findByEmail(email: string): Promise<any | null> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: {
        role: true,
        usersToDepartments: true,
      }
    });
    if (!user) return null;
    return user;
  }

  async findActiveById(id: string): Promise<{ id: string; roleHierarchy: number; companyId: string | null; departmentIds: string[] } | null> {
    const user = await this.db.query.users.findFirst({
      where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
      with: {
        role: true,
        usersToDepartments: true,
      },
    });
    if (!user) return null;
    return {
      id: user.id,
      roleHierarchy: user.role?.hierarchy ?? 0,
      companyId: user.companyId,
      departmentIds: user.usersToDepartments.map((ud: any) => ud.departmentId),
    };
  }
}