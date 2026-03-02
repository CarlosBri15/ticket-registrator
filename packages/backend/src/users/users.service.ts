import { Injectable, ConflictException, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, or, inArray } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser, Roles, ROLE_DEFAULT_PERMISSIONS, ROLE_HIERARCHY } from '@ticket-registrator/shared';
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
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    if (!createUserDto.password) {
      throw new ConflictException('Password is required');
    }

    // Hash password
    createUserDto.password = await this.authService.hashPassword(createUserDto.password);

    // Permission check
    if (!creator.permissions.includes('create_users')) {
      throw new BadRequestException('You do not have permission to create users');
    }

    // Role hierarchy check
    const requestedRoleHierarchy = ROLE_HIERARCHY[createUserDto.role!];
    const creatorRoleHierarchy = ROLE_HIERARCHY[creator.role];

    if (creatorRoleHierarchy <= requestedRoleHierarchy) {
      throw new ConflictException('Cannot assign a role higher than your own role');
    }

    // Resolve company
    const company = await this.db.query.companies.findFirst({
      where: eq(schema.companies.id, creator.companyId)
    });
    if (!company) {
      throw new ConflictException('Creator company does not exist');
    }

    // Determine departmentId
    let departmentId: string | null = null;

    if (creator.role === Roles.MANAGER) {
      if (!createUserDto.departmentId) {
        throw new BadRequestException('Department is required');
      }

      if (createUserDto.departmentId !== creator.departmentId) {
        throw new ForbiddenException(
          'Managers can only create users in their own department',
        );
      }
    }

    if (createUserDto.departmentId) {
      const department = await this.db.query.departments.findFirst({
        where: and(
          eq(schema.departments.id, createUserDto.departmentId),
          eq(schema.departments.companyId, company.id)
        )
      });

      if (!department) {
        throw new ConflictException('Department does not exist in this company');
      }

      departmentId = department.id;
    }

    const { role, ...rest } = createUserDto;
    const userToCreate = {
      ...rest,
      password: createUserDto.password as string, // Required per schema
      role: role ?? Roles.EMPLOYEE,
      companyId: company.id,
      departmentId: departmentId as string,
    };

    try {
      const savedUser = await this.db.transaction(async (tx) => {
        const [user] = await tx.insert(schema.users).values(userToCreate as any).returning();

        // TODO: Re-enable once new roles/permissions system is complete
        // const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[user.role as RoleType];
        // await tx.insert(schema.permissions).values({
        //   userId: user.id,
        //   permissions: defaultPermissions,
        //   isActive: true,
        // });

        return user;
      });

      return mapUserToIUser(savedUser);
    } catch (error: any) {
      // Postgres unique violation code is 23505
      if (error.code === '23505') {
        if (error.detail?.includes('email')) throw new ConflictException('Email already exists');
        if (error.detail?.includes('username')) throw new ConflictException('Username already exists');
        throw new ConflictException('Duplicate key constraint violated');
      }
      throw new BadRequestException(error.message || 'Validation failed');
    }
  }

  async findMe(userId: string): Promise<IUser> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return mapUserToIUser(user);
  }

  async findAll(requester: {
    id: string;
    role: RoleType;
    companyId: string;
    departmentId: string;
    permissions: PermissionType[];
  }): Promise<IUser[]> {

    if (
      !requester.permissions.includes("view_all_users") &&
      !requester.permissions.includes("view_team_users")
    ) {
      throw new ForbiddenException('You are not allowed to view users');
    }

    let filters = [
      eq(schema.users.isVisible, true),
      eq(schema.users.companyId, requester.companyId)
    ];

    if (requester.permissions.includes("view_team_users") && !requester.permissions.includes("view_all_users")) {
      filters.push(eq(schema.users.departmentId, requester.departmentId));
    }

    const allUsers = await this.db.query.users.findMany({
      where: and(...filters)
    });
    return allUsers.map(user => mapUserToIUser(user));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    }
  ): Promise<IUser> {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });

    if (!user) throw new NotFoundException('User not found');

    const isSelfUpdate = user.id === requester.id;
    const requesterHierarchy = ROLE_HIERARCHY[requester.role];

    // self-update
    if (isSelfUpdate) {
      if (!requester.permissions.includes('edit_own_user_info')) {
        throw new ForbiddenException('You cannot update your own info');
      }
      const forbiddenFields = ['role', 'departmentId', 'companyId'];
      for (const field of forbiddenFields) {
        if (field in updateUserDto) {
          throw new ForbiddenException(`You cannot update your own ${field}`);
        }
      }
    }
    // update other users
    else {
      if (requester.role === Roles.EMPLOYEE || requester.role === Roles.MANAGER) {
        throw new ForbiddenException('You cannot update other users');
      }
      if (user.companyId !== requester.companyId) {
        throw new ForbiddenException('Cannot update users outside your company');
      }
      if (requester.role === Roles.ADMIN) {
        const forbiddenFields = ['name', 'surname', 'email', 'username', 'password', 'role', 'companyId'];
        for (const field of forbiddenFields) {
          if (field in updateUserDto) {
            throw new ForbiddenException(`Admin cannot update ${field} of other users`);
          }
        }

        // TODO: Re-enable once new roles/permissions system is complete
        // const targetHierarchy = ROLE_HIERARCHY[user.role as RoleType];
        const targetHierarchy = 0; // placeholder
        if (targetHierarchy >= requesterHierarchy) {
          throw new ForbiddenException('Cannot update users with equal or higher role');
        }
      }
      if (requester.role === Roles.SUPERADMIN) {
        if ('companyId' in updateUserDto) {
          delete updateUserDto.companyId;
        }
        if (updateUserDto.role) {
          const requestedRoleHierarchy = ROLE_HIERARCHY[updateUserDto.role];
          if (requestedRoleHierarchy >= requesterHierarchy) {
            throw new ForbiddenException('Cannot assign a role equal or higher than your own role');
          }
          // TODO: Re-enable once new roles/permissions system is complete
          // const newPermissions = ROLE_DEFAULT_PERMISSIONS[updateUserDto.role];
          // ... update permissions in DB ...
        }
      }

      // department validation
      if (updateUserDto.departmentId) {
        const department = await this.db.query.departments.findFirst({
          where: and(
            eq(schema.departments.id, updateUserDto.departmentId),
            eq(schema.departments.companyId, requester.companyId) // must belong to same company
          )
        });
        if (!department) {
          throw new ConflictException('Department does not exist in your company');
        }
      }
    }

    // Hash password if present
    if (updateUserDto.password) {
      updateUserDto.password = await this.authService.hashPassword(updateUserDto.password);
    }
    if ('companyId' in updateUserDto) {
      delete updateUserDto.companyId;
    }

    try {
      const [updatedUser] = await this.db.update(schema.users)
        .set({ ...updateUserDto, updatedAt: new Date() })
        .where(eq(schema.users.id, id))
        .returning();

      if (!updatedUser) throw new NotFoundException('User not found');

      return mapUserToIUser(updatedUser);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('email')) throw new ConflictException('Email already exists');
        if (error.detail?.includes('username')) throw new ConflictException('Username already exists');
      }
      throw error;
    }
  }

  async remove(
    userId: string,
    requester: {
      id: string;
      role: RoleType;
      companyId: string;
      departmentId: string;
      permissions: PermissionType[];
    }
  ) {
    const user = await this.db.query.users.findFirst({
      where: eq(schema.users.id, userId)
    });

    if (!user) throw new NotFoundException('User not found');
    if (!user.isVisible) throw new ConflictException('User already deleted');

    // Permission check
    if (!requester.permissions.includes("delete_user")) {
      throw new ForbiddenException('You do not have permission to delete users');
    }

    const requesterHierarchy = ROLE_HIERARCHY[requester.role];
    // TODO: Re-enable once new roles/permissions system is complete
    // const targetHierarchy = ROLE_HIERARCHY[user.role as RoleType];
    const targetHierarchy = 0; // placeholder

    // Cannot delete equal or higher role
    if (targetHierarchy >= requesterHierarchy) {
      throw new ForbiddenException('Cannot delete users with equal or higher role');
    }

    // Company check
    if (user.companyId !== requester.companyId) {
      throw new ForbiddenException('Cannot delete users outside your company');
    }

    // Manager → only same department
    if (
      requester.role === Roles.MANAGER &&
      user.departmentId !== requester.departmentId
    ) {
      throw new ForbiddenException('Managers can only delete users in their department');
    }

    // Soft delete user
    await this.db.update(schema.users)
      .set({ isVisible: false, updatedAt: new Date() })
      .where(eq(schema.users.id, userId));

    // Soft delete reports and tickets
    const userReports = await this.db.query.reports.findMany({
      where: eq(schema.reports.userId, user.id),
      columns: { id: true }
    });
    const reportIds = userReports.map(r => r.id);

    if (reportIds.length > 0) {
      await this.db.update(schema.reports)
        .set({ isVisible: false, updatedAt: new Date() })
        .where(inArray(schema.reports.id, reportIds));

      await this.db.update(schema.tickets)
        .set({ isVisible: false, updatedAt: new Date() })
        .where(inArray(schema.tickets.reportId, reportIds));
    }

    // TODO: Re-enable once new roles/permissions system is complete
    // await this.db.update(schema.permissions)
    //   .set({ isActive: false, updatedAt: new Date() })
    //   .where(eq(schema.permissions.userId, user.id));

    return { deleted: true };
  }

  async findByEmail(email: string) {
    return this.db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
  }

  // TODO: Re-enable once new roles/permissions system is complete
  // async getUserPermissions(userId: string) { ... }
}