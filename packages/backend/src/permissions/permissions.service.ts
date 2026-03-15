import { Injectable, Logger } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsAuthorizationService } from './permissions-authorization.service';
import {
  PermissionNotFoundException,
  PermissionConflictException,
} from './exceptions/permissions.exceptions';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  AssignPermissionDto,
} from './dto/permission.dto';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import {
  permissions as sharedPermissions,
  IPermission,
  IRolePermission,
} from '@ticket-registrator/shared';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly permissionsAuthService: PermissionsAuthorizationService,
  ) {}

  // --- Catalog Management ---

  async findAll(): Promise<IPermission[]> {
    return this.permissionsRepository.findAll();
  }

  async findOne(id: string): Promise<IPermission> {
    const permission = await this.permissionsRepository.findById(id);
    if (!permission) throw new PermissionNotFoundException(id);
    return permission;
  }

  async create(
    dto: CreatePermissionDto,
    requester: UserPayload,
  ): Promise<IPermission> {
    this.permissionsAuthService.validateCanManageCatalog(requester.permissions);

    const name = dto.name!;
    const existing = await this.permissionsRepository.findByName(name);
    if (existing)
      throw new PermissionConflictException(
        `Permission "${name}" already exists`,
      );

    const permission = await this.permissionsRepository.create({
      name: name,
      description: dto.description ?? null,
    });

    this.logger.log(
      `Permission created: ${permission.name} by user ${requester.id}`,
    );
    return permission;
  }

  async update(
    id: string,
    dto: UpdatePermissionDto,
    requester: UserPayload,
  ): Promise<IPermission> {
    this.permissionsAuthService.validateCanManageCatalog(requester.permissions);

    const permission = await this.findOne(id);

    if (dto.name && dto.name !== permission.name) {
      const existing = await this.permissionsRepository.findByName(dto.name);
      if (existing)
        throw new PermissionConflictException(
          `Permission "${dto.name}" already exists`,
        );
    }

    const updated = await this.permissionsRepository.update(id, dto);
    this.logger.log(`Permission updated: ${id} by user ${requester.id}`);
    return updated;
  }

  async softDelete(id: string, requester: UserPayload) {
    this.permissionsAuthService.validateCanManageCatalog(requester.permissions);

    await this.findOne(id);
    await this.permissionsRepository.update(id, { isVisible: false });

    this.logger.log(`Permission soft deleted: ${id} by user ${requester.id}`);
    return { deleted: true };
  }

  // --- Assignments & Overrides ---

  async assignToRole(
    dto: AssignPermissionDto,
    requester: UserPayload,
  ): Promise<IRolePermission> {
    this.permissionsAuthService.validateCanAssignPermissions(
      requester.permissions,
    );

    await this.findOne(dto.permissionId!);

    const mapping = await this.permissionsRepository.assignToRole({
      roleId: dto.roleId!,
      permissionId: dto.permissionId!,
      companyId: dto.companyId ?? null,
    });

    this.logger.log(
      `Permission ${dto.permissionId} assigned to role ${dto.roleId} by user ${requester.id}`,
    );
    return mapping;
  }

  async unassignFromRole(
    roleId: string,
    permissionId: string,
    requester: UserPayload,
  ) {
    this.permissionsAuthService.validateCanAssignPermissions(
      requester.permissions,
    );

    await this.permissionsRepository.unassignFromRole(roleId, permissionId);
    this.logger.log(
      `Permission ${permissionId} unassigned from role ${roleId} by user ${requester.id}`,
    );
    return { unassigned: true };
  }

  // --- Seeding Logic ---

  async seedDefaultPermissions() {
    const permValues = Object.values(sharedPermissions);
    const permsToSeed = permValues.map((p) => ({
      name: p,
      description: `System permission: ${p}`,
    }));

    await this.permissionsRepository.bulkInsertPermissions(permsToSeed);

    this.logger.log(
      `Seeding process finished for ${permsToSeed.length} permissions (added/updated)`,
    );
    return {
      message: `Seeding process finished for ${permsToSeed.length} permissions`,
    };
  }
}
