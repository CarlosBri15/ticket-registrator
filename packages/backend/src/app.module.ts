import { Module } from '@nestjs/common';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReportsModule } from './reports/reports.module';
import { GeminiModule } from './gemini/gemini.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { OrganizationModule } from './organization/organization.module';
import { ItemsModule } from './items/items.module';
import { DepartmentModule } from './department/department.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { SeedModule } from './seed/seed.module';
import { CryptoModule } from './crypto/crypto.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DbModule,
    CryptoModule,
    UsersModule,
    TicketsModule,
    ReportsModule,
    GeminiModule,
    AuthModule,
    StorageModule,
    OrganizationModule,
    ItemsModule,
    DepartmentModule,
    RolesModule,
    PermissionsModule,
    SeedModule,
    CategoriesModule,
  ],
})
export class AppModule {}
