import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { DepartmentRepository } from './department.repository';
import { DepartmentAuthorizationService } from './department-authorization.service';

@Module({
  controllers: [DepartmentController],
  providers: [
    DepartmentService,
    DepartmentRepository,
    DepartmentAuthorizationService,
  ],
  exports: [DepartmentService, DepartmentRepository],
})
export class DepartmentModule {}
