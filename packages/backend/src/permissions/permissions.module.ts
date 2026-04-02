import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PermissionsRepository } from './permissions.repository';
import { PermissionsAuthorizationService } from './permissions-authorization.service';

@Module({
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionsRepository,
    PermissionsAuthorizationService,
  ],
  exports: [
    PermissionsService,
    PermissionsRepository,
    PermissionsAuthorizationService,
  ],
})
export class PermissionsModule {}
