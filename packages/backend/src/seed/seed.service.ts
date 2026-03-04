import { Injectable, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { AuthService } from '../auth/auth.service';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { Roles } from '@ticket-registrator/shared';

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

            console.log('--- AUTO SEEDING FINISHED ---');
        } catch (error) {
            console.error('Error during automatic seeding:', error);
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
            await this.db.insert(schema.users).values({
                name: 'Super',
                surname: 'Admin',
                username: 'SuperAdmin',
                email: 'superadmin@system.com',
                password: hashedPassword,
                roleId: superAdminRole.id,
            });
            console.log('SuperAdmin user created successfully (SuperAdmin:SuperAdmin)');
        } else {
            console.log('SuperAdmin user already exists.');
        }
    }
}
