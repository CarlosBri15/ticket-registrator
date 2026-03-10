import { Test, TestingModule } from '@nestjs/testing';
import { ReportsAuthorizationService } from './reports-authorization.service';
import { DB_CONNECTION } from '../db/db.module';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import { NotFoundException } from '@nestjs/common';

describe('ReportsAuthorizationService', () => {
    let service: ReportsAuthorizationService;
    let dbMock: any;

    beforeEach(async () => {
        dbMock = {
            query: {
                users: {
                    findFirst: jest.fn(),
                },
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsAuthorizationService,
                {
                    provide: DB_CONNECTION,
                    useValue: dbMock,
                },
            ],
        }).compile();

        service = module.get<ReportsAuthorizationService>(ReportsAuthorizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getVisibleUser', () => {
        it('should return user if found and not deleted', async () => {
            const mockUser = { id: 'user-1', deletedAt: null };
            dbMock.query.users.findFirst.mockResolvedValue(mockUser);

            const result = await service.getVisibleUser('user-1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            dbMock.query.users.findFirst.mockResolvedValue(null);
            await expect(service.getVisibleUser('user-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('canViewUserReports', () => {
        const requester = {
            id: 'req-1',
            roleHierarchies: [AUTHORITY_LEVELS.DEPARTMENT],
            companyId: 'company-1',
            departmentIds: ['dept-1'],
        } as any;

        it('should allow if requester is the target user', async () => {
            const result = await service.canViewUserReports(requester, 'req-1');
            expect(result).toBe(true);
        });

        it('should allow GLOBAL authority to view any user', async () => {
            const globalRequester = { ...requester, roleHierarchies: [AUTHORITY_LEVELS.GLOBAL] };
            dbMock.query.users.findFirst.mockResolvedValue({ id: 'target-1', usersToRoles: [], usersToDepartments: [] });
            const result = await service.canViewUserReports(globalRequester, 'target-1');
            expect(result).toBe(true);
        });

        it('should allow COMPANY authority to view user in same company with lower hierarchy', async () => {
            const companyRequester = { ...requester, roleHierarchies: [AUTHORITY_LEVELS.COMPANY] };
            const targetUser = {
                id: 'target-1',
                companyId: 'company-1',
                usersToRoles: [{ role: { hierarchy: AUTHORITY_LEVELS.DEPARTMENT } }],
                usersToDepartments: []
            };
            dbMock.query.users.findFirst.mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(companyRequester, 'target-1');
            expect(result).toBe(true);
        });

        it('should NOT allow COMPANY authority to view user in same company with same/higher hierarchy', async () => {
            const companyRequester = { ...requester, roleHierarchies: [AUTHORITY_LEVELS.COMPANY] };
            const targetUser = {
                id: 'target-1',
                companyId: 'company-1',
                usersToRoles: [{ role: { hierarchy: AUTHORITY_LEVELS.COMPANY } }],
                usersToDepartments: []
            };
            dbMock.query.users.findFirst.mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(companyRequester, 'target-1');
            expect(result).toBe(false);
        });

        it('should allow DEPARTMENT authority to view user in same department and same company with lower hierarchy', async () => {
            const targetUser = {
                id: 'target-1',
                companyId: 'company-1',
                usersToRoles: [{ role: { hierarchy: 0 } }],
                usersToDepartments: [{ departmentId: 'dept-1' }]
            };
            dbMock.query.users.findFirst.mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(requester, 'target-1');
            expect(result).toBe(true);
        });

        it('should NOT allow DEPARTMENT authority to view user in DIFFERENT department', async () => {
            const targetUser = {
                id: 'target-1',
                companyId: 'company-1',
                usersToRoles: [{ role: { hierarchy: 0 } }],
                usersToDepartments: [{ departmentId: 'dept-2' }]
            };
            dbMock.query.users.findFirst.mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(requester, 'target-1');
            expect(result).toBe(false);
        });
    });
});
