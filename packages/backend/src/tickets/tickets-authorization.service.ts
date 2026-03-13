import { Injectable } from '@nestjs/common';
import { ReportsAuthorizationService } from '../reports/reports-authorization.service';
import { UserPayload } from '../auth/decorators/current-user.decorator';
import { ITicket } from '@ticket-registrator/shared';

@Injectable()
export class TicketsAuthorizationService {
    constructor(
        private readonly reportsAuthService: ReportsAuthorizationService,
    ) { }

    async validateCanViewReport(requester: UserPayload, report: any): Promise<boolean> {
        if (requester.id === report.userId) return true;
        return this.reportsAuthService.canViewUserReports(requester, report.userId);
    }

    async validateCanModifyReport(requester: UserPayload, report: any): Promise<boolean> {
        // Only the owner can modify a report/ticket
        return requester.id === report.userId;
    }
}
