import { Module } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { OrganizationAuthorizationService } from './organization-authorization.service';
import { DepartmentModule } from '../department/department.module';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
  imports: [DepartmentModule, CryptoModule],
  controllers: [OrganizationController],
  providers: [
    OrganizationService,
    OrganizationRepository,
    OrganizationAuthorizationService,
  ],
  exports: [OrganizationService, OrganizationRepository],
})
export class OrganizationModule {}
