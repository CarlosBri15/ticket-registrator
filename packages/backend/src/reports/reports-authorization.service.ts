import { Injectable, ForbiddenException, NotFoundException, Inject, Logger } from '@nestjs/common';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import { DB_CONNECTION } from '../db/db.module';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { UserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class ReportsAuthorizationService {
    private readonly logger = new Logger(ReportsAuthorizationService.name);

    constructor(
        @Inject(DB_CONNECTION) private readonly db: PostgresJsDatabase<typeof schema>,
    ) { }

    async getVisibleUser(id: string) {
        const user = await this.db.query.users.findFirst({
            where: and(eq(schema.users.id, id), isNull(schema.users.deletedAt)),
            with: {
                role: true,
                usersToDepartments: true
            }
        });
        if (!user) throw new NotFoundException('User not found or not visible');
        return user;
    }

    async canViewUserReports(requester: UserPayload, targetUserId: string): Promise<boolean> {
        if (requester.id === targetUserId) return true;

        const targetUser = await this.getVisibleUser(targetUserId);
        const requesterHierarchy = requester.roleHierarchy;

        const targetRole = targetUser.role;
        const targetHierarchy = targetRole ? targetRole.hierarchy : 0;
        const targetDeptIds = targetUser.usersToDepartments.map(ud => ud.departmentId);

        if (requesterHierarchy >= AUTHORITY_LEVELS.GLOBAL) return true;

        if (requesterHierarchy >= AUTHORITY_LEVELS.COMPANY &&
            targetUser.companyId === requester.companyId &&
            targetHierarchy < requesterHierarchy) {
            return true;
        }

        if (requesterHierarchy >= AUTHORITY_LEVELS.DEPARTMENT &&
            targetUser.companyId === requester.companyId &&
            targetDeptIds.some(id => requester.departmentIds.includes(id)) &&
            targetHierarchy < requesterHierarchy) {
            return true;
        }

        this.logger.warn(`Authorization failed: User ${requester.id} attempted to view reports of user ${targetUserId}`);
        return false;
    }

    async canViewReport(requester: UserPayload, report: any): Promise<boolean> {
        return this.canViewUserReports(requester, report.userId);
    }

    // Add more specific permission checks here if needed, e.g. canEdit, canApprove
}
