import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { RolesModule } from '../roles/roles.module';
import { ReportsRepository } from './reports.repository';
import { ReportsAuthorizationService } from './reports-authorization.service';

@Module({
  imports: [RolesModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, ReportsAuthorizationService],
  exports: [ReportsService, ReportsRepository, ReportsAuthorizationService],
})
export class ReportsModule { }
