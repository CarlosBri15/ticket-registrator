import { Injectable, Logger } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RolesAuthorizationService } from './roles-authorization.service';
import {
  RoleNotFoundException,
  RoleConflictException,
  RoleSystemModificationException,
} from './exceptions/roles.exceptions';
import { CreateRoleDto } from './dto/create-role.dto';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    private readonly rolesRepository: RolesRepository,
    private readonly rolesAuthService: RolesAuthorizationService,
  ) { }

  async create(companyId: string, dto: CreateRoleDto, requester: UserPayload) {
    this.rolesAuthService.validateHierarchy(requester.roleHierarchy, dto.hierarchy!);

    const existing = await this.rolesRepository.findByNameAndCompany(dto.name!, companyId);
    if (existing) {
      throw new RoleConflictException(`Role "${dto.name}" already exists in your company`);
    }

    const role = await this.rolesRepository.create({
      name: dto.name!,
      hierarchy: dto.hierarchy!,
      description: dto.description ?? null,
      companyId,
      isSystem: false,
    });

    this.logger.log(`Role created: ${role.id} by user ${requester.id}`);
    return role;
  }

  async findAll(companyId: string | null) {
    if (companyId) {
      return this.rolesRepository.findAllCompanyRoles(companyId);
    }
    return this.rolesRepository.findAllSystemRoles();
  }

  async findOne(roleId: string, companyId: string | null) {
    const role = await this.rolesRepository.findById(roleId);
    if (!role) throw new RoleNotFoundException(roleId);

    if (companyId) {
      this.rolesAuthService.validateCompanyAccess(companyId, role.companyId);
    }

    return role;
  }

  async softDelete(roleId: string, companyId: string, requester: UserPayload) {
    const role = await this.rolesRepository.findById(roleId);
    if (!role || role.companyId !== companyId) {
      throw new RoleNotFoundException(roleId);
    }

    if (role.isSystem) {
      throw new RoleSystemModificationException('System roles cannot be deleted');
    }

    this.rolesAuthService.validateHierarchy(requester.roleHierarchy, role.hierarchy);

    await this.rolesRepository.update(roleId, { isVisible: false });

    this.logger.log(`Role soft deleted: ${roleId} by user ${requester.id}`);
    return { deleted: true };
  }

  async getPermissionsForRoles(roleNames: string[], companyId: string | null): Promise<string[]> {
    const rolesWithPermissions = await this.rolesRepository.getRolePermissionsByNames(roleNames, companyId);

    const permissionNames = new Set<string>();
    for (const role of rolesWithPermissions) {
      for (const rp of role.rolePermissions) {
        permissionNames.add(rp.permission.name);
      }
    }

    return [...permissionNames];
  }

  async getPermissionsForRoleId(roleId: string, companyId: string | null): Promise<string[]> {
    const roleWithPermissions = await this.rolesRepository.getRolePermissionsById(roleId, companyId);
    if (!roleWithPermissions) return [];

    return roleWithPermissions.rolePermissions.map(rp => rp.permission.name);
  }
}
