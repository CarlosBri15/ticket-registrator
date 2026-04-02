import { Injectable, Logger } from '@nestjs/common';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { DepartmentUnauthorizedException } from './exceptions/department.exceptions';

@Injectable()
export class DepartmentAuthorizationService {
  private readonly logger = new Logger(DepartmentAuthorizationService.name);

  validateCompanyAccess(requester: UserPayload, companyId: string): void {
    const isGlobal = requester.roleHierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const isSameCompany = requester.companyId === companyId;

    if (!isGlobal && !isSameCompany) {
      this.logger.warn(
        `User ${requester.id} tried to access departments of company ${companyId}`,
      );
      throw new DepartmentUnauthorizedException(
        'You can only access departments within your own company',
      );
    }
  }

  validateCanManage(requester: UserPayload, companyId: string): void {
    const isGlobal = requester.roleHierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const isCompanyAdmin =
      requester.roleHierarchy >= AUTHORITY_LEVELS.COMPANY &&
      requester.companyId === companyId;

    if (!isGlobal && !isCompanyAdmin) {
      this.logger.warn(
        `User ${requester.id} tried to manage departments of company ${companyId}`,
      );
      throw new DepartmentUnauthorizedException(
        'Only company administrators or higher can manage departments',
      );
    }
  }
}
