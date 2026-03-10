import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, or, inArray, isNull, sql } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser, Roles, ROLE_HIERARCHY, permissions, AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import type { PermissionType, RoleType } from '@ticket-registrator/shared';
import { mapUserToIUser } from './mapper/users.mapper';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
    @Inject(forwardRef(() => AuthService)) private readonly authService: AuthService,
  ) { }

  async create(
    createUserDto: CreateUserDto,
    creator: {
      roles: RoleType[];
      roleHierarchies: number[];
      companyId: string;
      departmentIds: string[];
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    if (!createUserDto.password) {
      throw new ConflictException('Password is required');
    }

    createUserDto.password = await this.authService.hashPassword(createUserDto.password);

    const isSuperAdmin = creator.roles.includes(Roles.SUPERADMIN);
    const targetCompanyId = (isSuperAdmin && (createUserDto as any).companyId)
      ? (createUserDto as any).companyId
      : creator.companyId;

    const targetRoles = await this.db.query.roles.findMany({
      where: and(
        inArray(schema.roles.name, createUserDto.roles!),
        or(isNull(schema.roles.companyId), eq(schema.roles.companyId, targetCompanyId))
      ),
    });

    if (targetRoles.length !== createUserDto.roles!.length) {
      throw new BadRequestException('One or more roles not found for the target company');
    }

    const creatorHierarchy = Math.max(...creator.roleHierarchies);
    const maxTargetHierarchy = Math.max(...targetRoles.map(r => r.hierarchy));

    if (creatorHierarchy <= maxTargetHierarchy) {
      throw new ConflictException('Cannot assign a role higher or equal than your own highest role');
    }

    const isCreatingAdmin = targetRoles.some(r => r.name === Roles.ADMIN);
    if (isCreatingAdmin && !creator.permissions.includes(permissions.CREATE_ADMINS)) {
      throw new ForbiddenException('You do not have permission to create Admin users');
    }

    const company = await this.db.query.companies.findFirst({
      where: eq(schema.companies.id, targetCompanyId)
    });
    if (!company) {
      throw new ConflictException('Target company does not exist');
    }

    if (creator.roles.includes(Roles.MANAGER)) {
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

    const { roles: _, confirmPassword: __, companyId: ___, departmentIds: ____, ...rest } = createUserDto as any;
    const userToCreate = {
      ...rest,
      password: createUserDto.password as string,
      companyId: company.id,
    };

    try {
      const savedUser = await this.db.transaction(async (tx) => {
        const [user] = await tx.insert(schema.users).values(userToCreate as any).returning();

        if (targetRoles.length > 0) {
          await tx.insert(schema.usersToRoles).values(
            targetRoles.map(r => ({ userId: user.id, roleId: r.id }))
          );
        }

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
          usersToRoles: { with: { role: true } },
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
        usersToRoles: { with: { role: true } },
        usersToDepartments: { with: { department: true } },
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserToIUser(user as any);
  }

  async findAll(requester: {
    id: string;
    roles: RoleType[];
    roleHierarchies: number[];
    companyId: string;
    departmentIds: string[];
    permissions: PermissionType[];
  }): Promise<IUser[]> {
    const maxHierarchy = Math.max(...requester.roleHierarchies);
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
        usersToRoles: { with: { role: true } },
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
      roles: RoleType[];
      roleHierarchies: number[];
      companyId: string;
      departmentIds: string[];
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    const userWithRels = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        usersToRoles: { with: { role: true } },
        usersToDepartments: { with: { department: true } },
      }
    });

    if (!userWithRels) throw new NotFoundException('User not found');

    const targetRoles = userWithRels.usersToRoles.map(ur => ur.role);
    const targetHierarchy = targetRoles.length > 0 ? Math.max(...targetRoles.map(r => r.hierarchy)) : 0;
    const requesterHierarchy = Math.max(...requester.roleHierarchies);
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
      if (userWithRels.companyId !== requester.companyId && !requester.roles.includes(Roles.SUPERADMIN)) {
        throw new ForbiddenException('Cannot update users outside your company');
      }
      if (requester.roles.includes(Roles.ADMIN) && targetHierarchy >= requesterHierarchy) {
        throw new ForbiddenException('Cannot update users with equal or higher role');
      }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(updateUserDto.password);
    }

    const { roles, departmentIds, ...rest } = updateUserDto as any;

    try {
      await this.db.transaction(async (tx) => {
        if (Object.keys(rest).length > 0) {
          await tx.update(schema.users)
            .set({ ...rest, updatedAt: new Date() })
            .where(eq(schema.users.id, id));
        }

        if (roles) {
          const targetRolesFromDb = await tx.query.roles.findMany({
            where: and(
              inArray(schema.roles.name, roles),
              or(isNull(schema.roles.companyId), eq(schema.roles.companyId, userWithRels.companyId as string))

            ),
          });
          if (targetRolesFromDb.length !== roles.length) throw new BadRequestException('Invalid roles provided');

          if (Math.max(...targetRolesFromDb.map(r => r.hierarchy)) >= requesterHierarchy) {
            throw new ForbiddenException('Cannot assign a role equal or higher than your own');
          }

          await tx.delete(schema.usersToRoles).where(eq(schema.usersToRoles.userId, id));
          await tx.insert(schema.usersToRoles).values(targetRolesFromDb.map(r => ({ userId: id, roleId: r.id })));
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
      with: { usersToRoles: { with: { role: true } }, usersToDepartments: true }
    });

    if (!userWithRels || userWithRels.deletedAt) throw new NotFoundException('User not found');

    const targetHierarchy = Math.max(...userWithRels.usersToRoles.map(ur => ur.role.hierarchy), 0);
    const requesterHierarchy = Math.max(...requester.roleHierarchies);

    if (targetHierarchy >= requesterHierarchy) throw new ForbiddenException('Cannot delete users with equal or higher role');

    await this.db.update(schema.users)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    return { deleted: true };
  }

  async findByEmail(email: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.email, email),
      with: {
        usersToRoles: { with: { role: true } },
        usersToDepartments: true,
      }
    });
    if (!user) return null;
    return { ...user, roles: user.usersToRoles.map(ur => ur.role) };
  }
}