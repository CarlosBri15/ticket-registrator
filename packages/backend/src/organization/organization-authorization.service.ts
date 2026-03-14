import { Injectable, Logger } from '@nestjs/common';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { OrganizationUnauthorizedException } from './exceptions/organization.exceptions';

@Injectable()
export class OrganizationAuthorizationService {
  private readonly logger = new Logger(OrganizationAuthorizationService.name);

  validateCanCreate(requester: UserPayload): void {
    if (requester.roleHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      this.logger.warn(`Unauthorized organization create attempt by user ${requester.id}`);
      throw new OrganizationUnauthorizedException('Only global administrators can create organizations');
    }
  }

  validateCanViewAll(requester: UserPayload): void {
    if (requester.roleHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      this.logger.warn(`Unauthorized organization list attempt by user ${requester.id}`);
      throw new OrganizationUnauthorizedException('Only global administrators can list all organizations');
    }
  }

  validateCanUpdate(requester: UserPayload, companyId: string): void {
    const isGlobal = requester.roleHierarchy >= AUTHORITY_LEVELS.GLOBAL;
    const isCompanyAdmin =
      requester.roleHierarchy >= AUTHORITY_LEVELS.COMPANY &&
      requester.companyId === companyId;

    if (!isGlobal && !isCompanyAdmin) {
      this.logger.warn(`Unauthorized organization update attempt by user ${requester.id} on company ${companyId}`);
      throw new OrganizationUnauthorizedException('You can only update your own organization');
    }
  }

  validateCanDelete(requester: UserPayload): void {
    if (requester.roleHierarchy < AUTHORITY_LEVELS.GLOBAL) {
      this.logger.warn(`Unauthorized organization delete attempt by user ${requester.id}`);
      throw new OrganizationUnauthorizedException('Only global administrators can delete organizations');
    }
  }
}
