import { Injectable } from '@nestjs/common';
import { ReportsAuthorizationService } from '../reports/reports-authorization.service';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class TicketsAuthorizationService {
  constructor(
    private readonly reportsAuthService: ReportsAuthorizationService,
  ) {}

  async validateCanViewReport(
    requester: UserPayload,
    report: { userId: string },
  ): Promise<boolean> {
    if (requester.id === report.userId) return true;
    return this.reportsAuthService.canViewUserReports(requester, report.userId);
  }

  validateCanModifyReport(
    requester: UserPayload,
    report: { userId: string },
  ): Promise<boolean> {
    // Only the owner can modify a report/ticket
    return Promise.resolve(requester.id === report.userId);
  }
}
