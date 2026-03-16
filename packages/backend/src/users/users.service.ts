import {
  Injectable,
  Logger,
} from '@nestjs/common';
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

    const isSuperAdmin = creator.roleHierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const dtoExtended = createUserDto as CreateUserDto & { companyId?: string };
    const targetCompanyId =
      isSuperAdmin && dtoExtended.companyId
        ? dtoExtended.companyId
        : creator.companyId;

    const targetRole = await this.usersRepository.transaction(async (tx) => {
        return tx.query.roles.findFirst({
            where: and(
                eq(this.usersRepository.schema.roles.name, createUserDto.roleId as string),
                or(
                    isNull(this.usersRepository.schema.roles.companyId),
                    eq(this.usersRepository.schema.roles.companyId, targetCompanyId),
                ),
            ),
        });
    });

    if (!targetRole) {
      throw new UserBadRequestException('Role not found for the target company');
    }

    if (!this.usersAuthService.validateHierarchyAssignment(creator.roleHierarchy, targetRole.hierarchy)) {
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

    const company = await this.usersRepository.transaction(async (tx) => {
        return tx.query.companies.findFirst({
            where: eq(this.usersRepository.schema.companies.id, targetCompanyId),
        });
    });
    if (!company) {
      throw new UserConflictException('Target company does not exist');
    }

    if (!this.usersAuthService.validateDepartmentAssignment(creator.roleHierarchy, creator.departmentIds, createUserDto.departmentIds || [])) {
        throw new UserUnauthorizedException(
            'Managers can only assign departments they belong to',
        );
    }

    const departments = await this.usersRepository.transaction(async (tx) => {
        return tx.query.departments.findMany({
            where: and(
                inArray(this.usersRepository.schema.departments.id, createUserDto.departmentIds!),
                eq(this.usersRepository.schema.departments.companyId, company.id),
            ),
        });
    });

    if (departments.length !== (createUserDto.departmentIds?.length || 0)) {
      throw new UserConflictException(
        'One or more departments do not exist in this company',
      );
    }

    const userToCreate = {
      name: createUserDto.name,
      surname: createUserDto.surname,
      email: createUserDto.email,
      username: createUserDto.username,
      password: createUserDto.password,
      companyId: company.id,
      roleId: targetRole.id,
    };

    try {
      const user = await this.usersRepository.create(userToCreate, createUserDto.departmentIds);
      
      const fullUser = await this.usersRepository.findById(user.id);

      return mapUserToIUser(fullUser as UserWithDepts);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('email'))
          throw new UserConflictException('Email already exists');
        if (error.detail?.includes('username'))
          throw new UserConflictException('Username already exists');
      }
      throw new UserBadRequestException(error.message ?? 'Validation failed');
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

    return mapUserToICurrentUser(user as UserWithRole, userPermissions);
  }

  async findUserRole(userId: string): Promise<{ roleId: string } | undefined> {
    return this.usersRepository.findRoleById(userId);
  }

  async findAll(requester: UserPayload): Promise<IUser[]> {
    const maxHierarchy = requester.roleHierarchy;
    const userFilters = [isNull(this.usersRepository.schema.users.deletedAt)];

    if (maxHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      userFilters.push(eq(this.usersRepository.schema.users.companyId, requester.companyId));

      if (
        maxHierarchy >= AUTHORITY_LEVELS.DEPARTMENT &&
        maxHierarchy < AUTHORITY_LEVELS.COMPANY
      ) {
        userFilters.push(sql`EXISTS (
          SELECT 1 FROM ${this.usersRepository.schema.usersToDepartments} ud
          WHERE ud.user_id = ${this.usersRepository.schema.users.id}
          AND ud.department_id = ANY(${requester.departmentIds}::uuid[])
        )`);
      } else if (maxHierarchy < AUTHORITY_LEVELS.DEPARTMENT) {
        userFilters.push(eq(this.usersRepository.schema.users.id, requester.id));
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

    if (!this.usersAuthService.validateCanUpdateUser(requester, userWithRels as any)) {
        throw new UserUnauthorizedException();
    }

    if (requester.id === id) {
        const forbiddenFields = ['roles', 'departmentIds', 'companyId'];
        for (const field of forbiddenFields) {
          if (field in updateUserDto) {
            throw new UserUnauthorizedException(`You cannot update your own ${field}`);
          }
        }
    }

    if (updateUserDto.password) {
      updateUserDto.password = await this.cryptoService.hashPassword(
        updateUserDto.password,
      );
    }

    const { roleId, departmentIds } = updateUserDto;
    const updateFields: any = {};
    if (updateUserDto.name !== undefined) updateFields.name = updateUserDto.name;
    if (updateUserDto.surname !== undefined) updateFields.surname = updateUserDto.surname;
    if (updateUserDto.email !== undefined) updateFields.email = updateUserDto.email;
    if (updateUserDto.username !== undefined) updateFields.username = updateUserDto.username;
    if (updateUserDto.password !== undefined) updateFields.password = updateUserDto.password;

    try {
        if (roleId) {
            const targetRoleFromDb = await this.usersRepository.transaction(async (tx) => {
                return tx.query.roles.findFirst({
                    where: and(
                      eq(this.usersRepository.schema.roles.name, roleId),
                      or(
                        isNull(this.usersRepository.schema.roles.companyId),
                        eq(this.usersRepository.schema.roles.companyId, userWithRels.companyId as string),
                      ),
                    ),
                });
            });

            if (!targetRoleFromDb) throw new UserBadRequestException('Invalid role provided');

            if (targetRoleFromDb.hierarchy >= requester.roleHierarchy) {
                throw new UserUnauthorizedException('Cannot assign a role equal or higher than your own');
            }
            updateFields.roleId = targetRoleFromDb.id;
        }

        const updatedUser = await this.usersRepository.update(id, updateFields, departmentIds);
        
        return this.findMe(id);
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('email'))
            throw new UserConflictException('Email already exists');
        if (error.detail?.includes('username'))
            throw new UserConflictException('Username already exists');
      }
      throw error;
    }
  }

  async remove(userId: string, requester: UserPayload) {
    const userWithRels = await this.usersRepository.findById(userId);

    if (!userWithRels) throw new UserNotFoundException(userId);

    if (!this.usersAuthService.validateCanDeleteUser(requester.roleHierarchy, userWithRels.role?.hierarchy || 0)) {
        throw new UserUnauthorizedException('Cannot delete users with equal or higher role');
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
}
