import { Module, forwardRef, Global } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SystemRolesController, CompanyRolesController } from './roles.controller';
import { RolesRepository } from './roles.repository';
import { RolesAuthorizationService } from './roles-authorization.service';
import { PermissionsModule } from '../permissions/permissions.module';

@Global()
@Module({
  imports: [forwardRef(() => PermissionsModule)],
  controllers: [SystemRolesController, CompanyRolesController],
  providers: [RolesService, RolesRepository, RolesAuthorizationService],
  exports: [RolesService, RolesRepository, RolesAuthorizationService],
})
export class RolesModule { }
