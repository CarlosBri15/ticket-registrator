import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { ReportsRepository } from './reports.repository';
import { ReportsAuthorizationService } from './reports-authorization.service';

@Module({
  imports: [RolesModule, UsersModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, ReportsAuthorizationService],
  exports: [ReportsService, ReportsRepository, ReportsAuthorizationService],
})
export class ReportsModule {}
