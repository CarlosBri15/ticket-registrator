import { Injectable, ConflictException, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull, or, desc } from 'drizzle-orm';
import { CreateRoleDto } from './dto/create-role.dto';
import { permissions, Roles, ROLE_HIERARCHY, ROLE_DEFAULT_PERMISSIONS } from '@ticket-registrator/shared';
import type { RoleType, PermissionType } from '@ticket-registrator/shared';

type Requester = {
    id: string;
    role: RoleType;
    companyId: string;
    departmentId: string;
    permissions: PermissionType[];
};

@Injectable()
export class RolesService {
    constructor(
        @Inject(DB_CONNECTION) private db: PostgresJsDatabase<typeof schema>,
    ) { }

    async seedDefaultPermissions() {
        const permValues = Object.values(permissions);
        const existingPerms = await this.db.query.permissions.findMany();
        const existingNames = existingPerms.map(p => p.name);

        const newPerms = permValues.filter(p => !existingNames.includes(p));

        if (newPerms.length === 0) return { message: 'All permissions already seeded' };

        await this.db.insert(schema.permissions).values(
            newPerms.map(p => ({
                name: p,
                description: `System permission: ${p}`,
            }))
        );

        return { message: `Seeded ${newPerms.length} permissions` };
    }

    async seedDefaultRoles() {
        const rolesToSeed = Object.values(Roles);
        const existingRoles = await this.db.query.roles.findMany({
            where: isNull(schema.roles.companyId)
        });
        const existingNames = existingRoles.map(r => r.name);

        const newRoles = rolesToSeed.filter(r => !existingNames.includes(r));

        if (newRoles.length === 0) return { message: 'All default roles already seeded' };

        await this.db.insert(schema.roles).values(
            newRoles.map(r => ({
                name: r,
                hierarchy: ROLE_HIERARCHY[r as keyof typeof ROLE_HIERARCHY],
                isSystem: true,
                companyId: null, // Global roles
                description: `System default role: ${r}`
            }))
        );

        return { message: `Seeded ${newRoles.length} system roles` };
    }

    async seedDefaultRolePermissions() {
        const allRoles = await this.db.query.roles.findMany({ where: isNull(schema.roles.companyId) });
        const allPerms = await this.db.query.permissions.findMany();

        const roleMap = new Map(allRoles.map(r => [r.name, r.id]));
        const permMap = new Map(allPerms.map(p => [p.name, p.id]));

        const existingMappings = await this.db.query.rolePermissions.findMany({
            where: isNull(schema.rolePermissions.companyId)
        });
        const existingSet = new Set(existingMappings.map(rp => `${rp.roleId}-${rp.permissionId}`));

        const valuesToInsert: (typeof schema.rolePermissions.$inferInsert)[] = [];

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
                        companyId: null // Global mapping
                    });
                }
            }
        }

        if (valuesToInsert.length === 0) return { message: 'All default role-permissions already seeded' };

        await this.db.insert(schema.rolePermissions).values(valuesToInsert);

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

    async create(companyId: string, dto: CreateRoleDto, requester: Requester) {
        const requesterHierarchy = ROLE_HIERARCHY[requester.role] ?? 0;

        if (dto.hierarchy! >= requesterHierarchy) {
            throw new ForbiddenException('Cannot create a role with a hierarchy equal or higher than your own');
        }

        const existing = await this.db.query.roles.findFirst({
            where: and(
                eq(schema.roles.companyId, companyId),
                eq(schema.roles.name, dto.name as string),
                eq(schema.roles.isVisible, true),
            )
        });

        if (existing) {
            throw new ConflictException(`Role "${dto.name}" already exists in your company`);
        }

        const [role] = await this.db.insert(schema.roles).values({
            name: dto.name as string,
            hierarchy: dto.hierarchy as number,
            description: dto.description as string,
            companyId,
            isSystem: false,
        }).returning();

        return role;
    }

    async findAll(companyId: string | null) {
        if (companyId) {
            return this.db.query.roles.findMany({
                where: and(
                    eq(schema.roles.isVisible, true),
                    or(
                        eq(schema.roles.companyId, companyId),
                        isNull(schema.roles.companyId)
                    )
                ),
                orderBy: [desc(schema.roles.hierarchy)],
            });
        }

        return this.db.query.roles.findMany({
            where: eq(schema.roles.isVisible, true),
            orderBy: [desc(schema.roles.hierarchy)],
        });
    }

    async findOne(roleId: string, companyId: string | null) {
        const role = await this.db.query.roles.findFirst({
            where: and(
                eq(schema.roles.id, roleId),
                eq(schema.roles.isVisible, true),
            )
        });

        if (!role) throw new NotFoundException('Role not found');

        if (companyId && role.companyId !== companyId && role.companyId !== null) {
            throw new ForbiddenException('You cannot access roles outside your company');
        }

        return role;
    }

    async softDelete(roleId: string, companyId: string, requester: Requester) {
        const requesterHierarchy = ROLE_HIERARCHY[requester.role] ?? 0;
        const role = await this.db.query.roles.findFirst({
            where: and(
                eq(schema.roles.id, roleId),
                eq(schema.roles.companyId, companyId), // Must belong to company (prevents deleting SuperAdmin or other defaults)
            )
        });

        if (!role) throw new NotFoundException('Role not found or you have no permission to delete it');
        if (!role.isVisible) throw new ConflictException('Role already deleted');
        if (role.isSystem) throw new ForbiddenException('System roles cannot be deleted');

        if (role.hierarchy >= requesterHierarchy) {
            throw new ForbiddenException('Cannot delete a role with equal or higher hierarchy than your own');
        }

        await this.db
            .update(schema.roles)
            .set({ isVisible: false, updatedAt: new Date() })
            .where(eq(schema.roles.id, roleId));

        return { deleted: true };
    }
}


