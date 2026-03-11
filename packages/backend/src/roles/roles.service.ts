import { Injectable, Logger } from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { RolesAuthorizationService } from './roles-authorization.service';
import {
    permissions,
    Roles,
    ROLE_HIERARCHY,
    ROLE_DEFAULT_PERMISSIONS,
    PermissionType,
    RoleType
} from '@ticket-registrator/shared';
import {
    RoleNotFoundException,
    RoleConflictException,
    RoleSystemModificationException
} from './exceptions/roles.exceptions';
import { CreateRoleDto } from './dto/create-role.dto';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { InsertRolePermission } from './schemas/role-permission.schema';
import { PermissionsService } from '../permissions/permissions.service';

@Injectable()
export class RolesService {
    private readonly logger = new Logger(RolesService.name);

    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly rolesAuthService: RolesAuthorizationService,
        private readonly permissionsService: PermissionsService,
    ) { }

    async seedDefaultPermissions() {
        return this.permissionsService.seedDefaultPermissions();
    }

    async seedDefaultRoles() {
        const rolesToSeed = Object.values(Roles);
        const existingRoles = await this.rolesRepository.findAllSystemRoles();
        const existingMap = new Map(existingRoles.map(r => [r.name, r]));

        let seededCount = 0;
        let updatedCount = 0;

        for (const roleName of rolesToSeed) {
            const existing = existingMap.get(roleName);
            const hierarchy = ROLE_HIERARCHY[roleName as keyof typeof ROLE_HIERARCHY];
            const description = `System default role: ${roleName}`;

            if (existing) {
                // Update if changed
                if (existing.hierarchy !== hierarchy || existing.description !== description) {
                    await this.rolesRepository.update(existing.id, {
                        hierarchy,
                        description,
                        isVisible: true
                    });
                    updatedCount++;
                }
            } else {
                // Insert new
                await this.rolesRepository.create({
                    name: roleName,
                    hierarchy,
                    isSystem: true,
                    companyId: null,
                    description,
                });
                seededCount++;
            }
        }

        this.logger.log(`Seeding roles: ${seededCount} new, ${updatedCount} updated`);
        return { message: `Processed ${rolesToSeed.length} system roles (${seededCount} new, ${updatedCount} updated)` };
    }

    async seedDefaultRolePermissions() {
        const allRoles = await this.rolesRepository.findAllSystemRoles();
        const allPerms = await this.rolesRepository.findAllPermissions();

        const roleMap = new Map(allRoles.map(r => [r.name, r.id]));
        const permMap = new Map(allPerms.map(p => [p.name, p.id]));

        const existingMappings = await this.rolesRepository.findAllRolePermissions(null);
        const existingSet = new Set(existingMappings.map(rp => `${rp.roleId}-${rp.permissionId}`));

        const valuesToInsert: InsertRolePermission[] = [];

        for (const [roleName, assignedPerms] of Object.entries(ROLE_DEFAULT_PERMISSIONS)) {
            const roleId = roleMap.get(roleName);
            if (!roleId) continue;

            for (const permName of assignedPerms) {
                const permId = permMap.get(permName);
                if (!permId) continue;

                if (!existingSet.has(`${roleId}-${permId}`)) {
                    valuesToInsert.push({
                        roleId,
                        permissionId: permId,
                        companyId: null
                    });
                }
            }
        }

        if (valuesToInsert.length === 0) return { message: 'All default role-permissions already seeded' };

        await this.rolesRepository.bulkInsertRolePermissions(valuesToInsert);
        this.logger.log(`Seeded ${valuesToInsert.length} role-permissions mappings`);
        return { message: `Seeded ${valuesToInsert.length} role-permissions mappings` };
    }

    async seedSystemAll() {
        const permsResult = await this.seedDefaultPermissions();
        const rolesResult = await this.seedDefaultRoles();
        const rolePermsResult = await this.seedDefaultRolePermissions();

        return {
            permissions: permsResult,
            roles: rolesResult,
            rolePermissions: rolePermsResult,
        };
    }

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
