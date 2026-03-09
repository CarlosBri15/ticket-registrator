import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { AuthService } from '../auth/auth.service';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, isNull } from 'drizzle-orm';
import { Roles } from '@ticket-registrator/shared';

export const UNASSIGNED_DEPARTMENT_NAME = 'Unassigned';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
    constructor(
        private readonly rolesService: RolesService,
        private readonly authService: AuthService,
        @Inject(DB_CONNECTION) private readonly db: PostgresJsDatabase<typeof schema>,
    ) { }

    async onApplicationBootstrap() {
        console.log('--- AUTO SEEDING START ---');
        try {
            const seedResult = await this.rolesService.seedSystemAll();
            console.log('Seeding roles and permissions result:', JSON.stringify(seedResult, null, 2));

            await this.seedSuperAdmin();
            await this.seedUnassignedDepartment();

            console.log('--- AUTO SEEDING FINISHED ---');
        } catch (error) {
            console.error('Error during automatic seeding:', error);
        }
    }

    async seedUnassignedDepartment() {
        const existing = await this.db.query.departments.findFirst({
            where: eq(schema.departments.departmentName, UNASSIGNED_DEPARTMENT_NAME),
        });
        if (!existing) {
            await this.db.insert(schema.departments).values({
                departmentName: UNASSIGNED_DEPARTMENT_NAME,
                companyId: null as any, // Global placeholder, no company
            });
            console.log(`Global '${UNASSIGNED_DEPARTMENT_NAME}' department seeded.`);
        }
    }

    private async seedSuperAdmin() {
        const superAdminRole = await this.db.query.roles.findFirst({
            where: eq(schema.roles.name, Roles.SUPERADMIN)
        });

        if (!superAdminRole) {
            console.error('SuperAdmin role not found in database!');
            return;
        }

        const existingSuperAdmin = await this.db.query.users.findFirst({
            where: eq(schema.users.username, 'SuperAdmin')
        });

        if (!existingSuperAdmin) {
            const hashedPassword = await this.authService.hashPassword('SuperAdmin');
            const [newAdmin] = await this.db.insert(schema.users).values({
                name: 'Super',
                surname: 'Admin',
                username: 'SuperAdmin',
                email: 'superadmin@system.com',
                password: hashedPassword,
            }).returning();

            await this.db.insert(schema.usersToRoles).values({
                userId: newAdmin.id,
                roleId: superAdminRole.id,
            });

            console.log('SuperAdmin user created successfully (SuperAdmin:SuperAdmin)');
        } else {
            console.log('SuperAdmin user already exists.');
        }
    }
}
