import { Injectable, Logger } from '@nestjs/common';
import { eq, and, or, isNull, sql, inArray } from 'drizzle-orm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  IUser,
  ICurrentUser,
  AUTHORITY_LEVELS,
} from '@ticket-registrator/shared';
import {
  mapUserToIUser,
  mapUserToICurrentUser,
  UserWithDepts,
  UserWithRole,
} from './mapper/users.mapper';
import { CryptoService } from '../crypto/crypto.service';
import { RolesService } from '../roles/roles.service';
import { UsersRepository } from './users.repository';
import { UsersAuthorizationService } from './users-authorization.service';
import {
  UserNotFoundException,
  UserUnauthorizedException,
  UserConflictException,
  UserBadRequestException,
} from './exceptions/users.exceptions';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersAuthService: UsersAuthorizationService,
    private readonly cryptoService: CryptoService,
    private readonly rolesService: RolesService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    creator: UserPayload,
  ): Promise<IUser> {
    if (!createUserDto.password) {
      throw new UserConflictException('Password is required');
    }

    createUserDto.password = await this.cryptoService.hashPassword(
      createUserDto.password,
    );

    const targetCompanyId = this.getTargetCompanyId(createUserDto, creator);
    const targetRole = await this.getTargetRole(
      createUserDto.roleId,
      targetCompanyId,
    );

    if (!targetRole) {
      throw new UserBadRequestException(
        'Role not found for the target company',
      );
    }

    this.validateRoleHierarchy(creator, targetRole);

    const isTargetSuperAdmin = targetRole.hierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const resolvedCompanyId = await this.resolveCompanyId(
      targetCompanyId,
      isTargetSuperAdmin,
    );

    if (
      !this.usersAuthService.validateDepartmentAssignment(
        creator.roleHierarchy,
        creator.departmentIds,
        createUserDto.departmentIds || [],
      )
    ) {
      throw new UserUnauthorizedException(
        'Managers can only assign departments they belong to',
      );
    }

    await this.validateDepartmentsInCompany(
      resolvedCompanyId,
      createUserDto.departmentIds,
    );

    const userToCreate = {
      name: createUserDto.name,
      surname: createUserDto.surname,
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password,
      companyId: resolvedCompanyId,
      roleId: targetRole.id,
    };

    try {
      const user = await this.usersRepository.create(
        userToCreate,
        createUserDto.departmentIds,
      );
      const fullUser = await this.usersRepository.findById(user.id);
      return mapUserToIUser(fullUser as UserWithDepts);
    } catch (error: any) {
      this.handlePersistenceError(error, true);
    }
  }

  async findMe(userId: string): Promise<ICurrentUser> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new UserNotFoundException(userId);
    }

    const userPermissions = await this.rolesService.getPermissionsForRoleId(
      user.roleId,
      user.companyId || '',
    );

    return mapUserToICurrentUser(user, userPermissions);
  }

  async findUserRole(userId: string): Promise<{ roleId: string } | undefined> {
    return this.usersRepository.findRoleById(userId);
  }

  async findAll(requester: UserPayload): Promise<IUser[]> {
    const maxHierarchy = requester.roleHierarchy;
    const userFilters = [isNull(this.usersRepository.schema.users.deletedAt)];

    if (maxHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      userFilters.push(
        eq(this.usersRepository.schema.users.companyId, requester.companyId!),
      );

      // A user at DEPARTMENT level with no assigned departments (Controller)
      // is treated as company-scoped — mirrors the frontend `useScope` logic
      // so the backend agrees with what the UI exposes. Only fall into the
      // dept-restricted branch when the requester actually has departments.
      const hasDeptScope =
        maxHierarchy >= AUTHORITY_LEVELS.DEPARTMENT &&
        maxHierarchy < AUTHORITY_LEVELS.COMPANY &&
        requester.departmentIds.length > 0;

      if (hasDeptScope) {
        // Build the EXISTS with raw column references inside the subquery
        // because Drizzle's relational query builder (`findMany`) rewrites
        // Drizzle column refs to the outer alias, producing the wrong table
        // qualifier (e.g. `"users"."user_id"` instead of `"ud"."user_id"`).
        // We also build the IN list manually via `sql.join` to keep each
        // department id as its own parameter and avoid the previous
        // `ANY(($1, $2)::uuid[])` cast-to-record postgres error.
        const deptInList = sql.join(
          requester.departmentIds.map((id) => sql`${id}::uuid`),
          sql`, `,
        );
        userFilters.push(sql`EXISTS (
          SELECT 1 FROM "users_to_departments" "ud"
          WHERE "ud"."user_id" = "users"."id"
          AND "ud"."department_id" IN (${deptInList})
        )`);
      } else if (maxHierarchy < AUTHORITY_LEVELS.DEPARTMENT) {
        userFilters.push(
          eq(this.usersRepository.schema.users.id, requester.id),
        );
      }
    }

    const allUsers = await this.usersRepository.findAll(userFilters);

    return allUsers.map((u) => mapUserToIUser(u as UserWithDepts));
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requester: UserPayload,
  ): Promise<IUser> {
    const userWithRels = await this.usersRepository.findById(id);
    if (!userWithRels) throw new UserNotFoundException(id);

    if (!this.usersAuthService.validateCanUpdateUser(requester, userWithRels)) {
      throw new UserUnauthorizedException();
    }

    this.validateOwnUpdate(id, requester.id, updateUserDto);

    if (updateUserDto.password) {
      updateUserDto.password = await this.cryptoService.hashPassword(
        updateUserDto.password,
      );
    }

    const { roleId, departmentIds } = updateUserDto;
    const updateFields = this.extractUpdateFields(updateUserDto);

    try {
      if (roleId) {
        updateFields.roleId = await this.validateAndGetUpdateRole(
          roleId,
          userWithRels.companyId as string,
          requester.roleHierarchy,
        );
      }

      await this.usersRepository.update(id, updateFields, departmentIds);
      return this.findMe(id);
    } catch (error: any) {
      this.handlePersistenceError(error, false);
    }
  }

  async remove(userId: string, requester: UserPayload) {
    const userWithRels = await this.usersRepository.findById(userId);

    if (!userWithRels) throw new UserNotFoundException(userId);

    if (
      !this.usersAuthService.validateCanDeleteUser(
        requester.roleHierarchy,
        userWithRels.role?.hierarchy || 0,
      )
    ) {
      throw new UserUnauthorizedException(
        'Cannot delete users with equal or higher role',
      );
    }

    await this.usersRepository.softDelete(userId);

    this.logger.log(`User removed: ${userId} by user ${requester.id}`);
    return { deleted: true };
  }

  async findByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async findActiveById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) return null;
    return {
      id: user.id,
      roleHierarchy: user.role?.hierarchy ?? 0,
      companyId: user.companyId,
      departmentIds: user.usersToDepartments.map((ud) => ud.departmentId),
    };
  }

  private getTargetCompanyId(
    createUserDto: CreateUserDto,
    creator: UserPayload,
  ): string | null {
    const isSuperAdmin = creator.roleHierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const dto = createUserDto as CreateUserDto & { companyId?: string };
    return isSuperAdmin && dto.companyId
      ? dto.companyId
      : (creator.companyId ?? null);
  }

  private async getTargetRole(roleId: string, targetCompanyId: string | null) {
    return this.usersRepository.transaction(async (tx) => {
      return tx.query.roles.findFirst({
        where: and(
          eq(this.usersRepository.schema.roles.id, roleId),
          or(
            isNull(this.usersRepository.schema.roles.companyId),
            targetCompanyId
              ? eq(this.usersRepository.schema.roles.companyId, targetCompanyId)
              : undefined,
          ),
        ),
      });
    });
  }

  private validateRoleHierarchy(
    creator: UserPayload,
    targetRole: { hierarchy: number },
  ) {
    if (
      !this.usersAuthService.validateHierarchyAssignment(
        creator.roleHierarchy,
        targetRole.hierarchy,
      )
    ) {
      throw new UserConflictException(
        'Cannot assign a role higher or equal than your own highest role',
      );
    }

    const isCreatingAdmin =
      targetRole.hierarchy >= AUTHORITY_LEVELS.COMPANY &&
      targetRole.hierarchy < AUTHORITY_LEVELS.GLOBAL;
    if (
      isCreatingAdmin &&
      !this.usersAuthService.validateCanCreateAdmin(creator.permissions)
    ) {
      throw new UserUnauthorizedException(
        'You do not have permission to create Admin users',
      );
    }
  }

  private async resolveCompanyId(
    targetCompanyId: string | null,
    isTargetSuperAdmin: boolean,
  ): Promise<string | null> {
    if (isTargetSuperAdmin) return null;

    if (!targetCompanyId) {
      throw new UserBadRequestException(
        'Company is required for non-SuperAdmin roles',
      );
    }
    const company = await this.usersRepository.transaction(async (tx) => {
      return tx.query.companies.findFirst({
        where: eq(this.usersRepository.schema.companies.id, targetCompanyId),
      });
    });
    if (!company) {
      throw new UserConflictException('Target company does not exist');
    }
    return company.id;
  }

  private async validateDepartmentsInCompany(
    companyId: string | null,
    departmentIds?: string[],
  ) {
    if (companyId && (departmentIds?.length ?? 0) > 0) {
      const departments = await this.usersRepository.transaction(async (tx) => {
        return tx.query.departments.findMany({
          where: and(
            inArray(this.usersRepository.schema.departments.id, departmentIds!),
            eq(this.usersRepository.schema.departments.companyId, companyId),
          ),
        });
      });

      if (departments.length !== departmentIds!.length) {
        throw new UserConflictException(
          'One or more departments do not exist in this company',
        );
      }
    }
  }

  private validateOwnUpdate(
    id: string,
    requesterId: string,
    updateUserDto: UpdateUserDto,
  ) {
    if (requesterId === id) {
      const forbiddenFields = ['roles', 'departmentIds', 'companyId', 'roleId'];
      for (const field of forbiddenFields) {
        if (field in updateUserDto) {
          throw new UserUnauthorizedException(
            `You cannot update your own ${field}`,
          );
        }
      }
    }
  }

  private extractUpdateFields(updateUserDto: UpdateUserDto) {
    const updateFields: Record<string, unknown> = {};
    const fields = [
      'name',
      'surname',
      'email',
      'username',
      'password',
    ] as const;
    fields.forEach((field) => {
      if (updateUserDto[field] !== undefined)
        updateFields[field] = updateUserDto[field];
    });
    return updateFields;
  }

  private async validateAndGetUpdateRole(
    roleId: string,
    companyId: string,
    requesterHierarchy: number,
  ) {
    const targetRoleFromDb = await this.usersRepository.transaction(
      async (tx) => {
        return tx.query.roles.findFirst({
          where: and(
            eq(this.usersRepository.schema.roles.id, roleId),
            or(
              isNull(this.usersRepository.schema.roles.companyId),
              eq(this.usersRepository.schema.roles.companyId, companyId),
            ),
          ),
        });
      },
    );

    if (!targetRoleFromDb)
      throw new UserBadRequestException('Invalid role provided');

    if (targetRoleFromDb.hierarchy >= requesterHierarchy) {
      throw new UserUnauthorizedException(
        'Cannot assign a role equal or higher than your own',
      );
    }
    return targetRoleFromDb.id;
  }

  private handlePersistenceError(error: unknown, isCreate: boolean): never {
    const err = error as { code?: string; detail?: string; message?: string };
    if (err.code === '23505') {
      if (err.detail?.includes('email'))
        throw new UserConflictException('Email already exists');
      if (err.detail?.includes('username'))
        throw new UserConflictException('Username already exists');
    }
    if (isCreate) {
      throw new UserBadRequestException(err.message ?? 'Validation failed');
    }
    throw error;
  }
}
