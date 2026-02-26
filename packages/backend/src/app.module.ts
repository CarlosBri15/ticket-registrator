import { Module } from '@nestjs/common';
import { TestModule } from './test/test.module';
import { DbModule } from './db/db.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { TicketsModule } from './tickets/tickets.module';
import { ReportsModule } from './reports/reports.module';
import { GeminiModule } from './gemini/gemini.module';
import { AuthModule } from './auth/auth.module';
import { StorageModule } from './storage/storage.module';
import { OrganizationModule } from './organization/organization.module';
import { ItemsModule } from './items/items.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    DbModule,

    TestModule,

    UsersModule,

    TicketsModule,

    ReportsModule,

    GeminiModule,

    AuthModule,

    StorageModule,

    OrganizationModule,

    ItemsModule],
})
export class AppModule { }
