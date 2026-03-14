import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';

@Injectable()
export class ReportsAuthorizationService {
  private readonly logger = new Logger(ReportsAuthorizationService.name);

  constructor(private readonly usersService: UsersService) {}

  async getVisibleUser(id: string) {
    const user = await this.usersService.findActiveById(id);
    if (!user) throw new NotFoundException('User not found or not visible');
    return user;
  }

  async canViewUserReports(requester: UserPayload, targetUserId: string): Promise<boolean> {
    if (requester.id === targetUserId) return true;

    const targetUser = await this.getVisibleUser(targetUserId);
    const requesterHierarchy = requester.roleHierarchy;
    const targetHierarchy = targetUser.roleHierarchy;
    const targetDeptIds = targetUser.departmentIds;

    if (requesterHierarchy >= AUTHORITY_LEVELS.GLOBAL) return true;

    if (
      requesterHierarchy >= AUTHORITY_LEVELS.COMPANY &&
      targetUser.companyId === requester.companyId &&
      targetHierarchy < requesterHierarchy
    ) {
      return true;
    }

    if (
      requesterHierarchy >= AUTHORITY_LEVELS.DEPARTMENT &&
      targetUser.companyId === requester.companyId &&
      targetDeptIds.some(id => requester.departmentIds.includes(id)) &&
      targetHierarchy < requesterHierarchy
    ) {
      return true;
    }

    this.logger.warn(`Authorization failed: User ${requester.id} attempted to view reports of user ${targetUserId}`);
    return false;
  }

  async canViewReport(requester: UserPayload, report: any): Promise<boolean> {
    return this.canViewUserReports(requester, report.userId);
  }
}
