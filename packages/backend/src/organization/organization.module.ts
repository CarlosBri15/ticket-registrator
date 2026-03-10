import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { RolesModule } from '../roles/roles.module';
import { DepartmentModule } from '../department/department.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [RolesModule, DepartmentModule, AuthModule],
  controllers: [OrganizationController],
  providers: [OrganizationService],
})
export class OrganizationModule { }
