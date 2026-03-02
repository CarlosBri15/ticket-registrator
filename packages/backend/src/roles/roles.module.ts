import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { SystemRolesController, CompanyRolesController } from './roles.controller';

@Module({
  controllers: [SystemRolesController, CompanyRolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule { }
