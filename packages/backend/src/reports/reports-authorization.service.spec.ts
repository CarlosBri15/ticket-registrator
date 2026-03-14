import { Test, TestingModule } from '@nestjs/testing';
import { ReportsAuthorizationService } from './reports-authorization.service';
import { UsersService } from '../users/users.service';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';
import { NotFoundException } from '@nestjs/common';

describe('ReportsAuthorizationService', () => {
    let service: ReportsAuthorizationService;
    let usersServiceMock: jest.Mocked<Partial<UsersService>>;

    beforeEach(async () => {
        usersServiceMock = {
            findActiveById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsAuthorizationService,
                { provide: UsersService, useValue: usersServiceMock },
            ],
        }).compile();

        service = module.get<ReportsAuthorizationService>(ReportsAuthorizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getVisibleUser', () => {
        it('should return user if found', async () => {
            const mockUser = { id: 'user-1', roleHierarchy: 10, companyId: 'comp-1', departmentIds: [] };
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(mockUser);

            const result = await service.getVisibleUser('user-1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException if user not found', async () => {
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(null);
            await expect(service.getVisibleUser('user-1')).rejects.toThrow(NotFoundException);
        });
    });

    describe('canViewUserReports', () => {
        const requester = {
            id: 'req-1',
            roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
            companyId: 'company-1',
            departmentIds: ['dept-1'],
        } as any;

        it('should allow if requester is the target user', async () => {
            const result = await service.canViewUserReports(requester, 'req-1');
            expect(result).toBe(true);
        });

        it('should allow GLOBAL authority to view any user', async () => {
            const globalRequester = { ...requester, roleHierarchy: AUTHORITY_LEVELS.GLOBAL };
            const targetUser = { id: 'target-1', roleHierarchy: 0, companyId: 'company-1', departmentIds: [] };
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(globalRequester, 'target-1');
            expect(result).toBe(true);
        });

        it('should allow COMPANY authority to view user in same company with lower hierarchy', async () => {
            const companyRequester = { ...requester, roleHierarchy: AUTHORITY_LEVELS.COMPANY };
            const targetUser = {
                id: 'target-1',
                roleHierarchy: AUTHORITY_LEVELS.DEPARTMENT,
                companyId: 'company-1',
                departmentIds: [],
            };
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(companyRequester, 'target-1');
            expect(result).toBe(true);
        });

        it('should NOT allow COMPANY authority to view user with same/higher hierarchy', async () => {
            const companyRequester = { ...requester, roleHierarchy: AUTHORITY_LEVELS.COMPANY };
            const targetUser = {
                id: 'target-1',
                roleHierarchy: AUTHORITY_LEVELS.COMPANY,
                companyId: 'company-1',
                departmentIds: [],
            };
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(companyRequester, 'target-1');
            expect(result).toBe(false);
        });

        it('should allow DEPARTMENT authority to view user in same department with lower hierarchy', async () => {
            const targetUser = {
                id: 'target-1',
                roleHierarchy: 0,
                companyId: 'company-1',
                departmentIds: ['dept-1'],
            };
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(requester, 'target-1');
            expect(result).toBe(true);
        });

        it('should NOT allow DEPARTMENT authority to view user in different department', async () => {
            const targetUser = {
                id: 'target-1',
                roleHierarchy: 0,
                companyId: 'company-1',
                departmentIds: ['dept-2'],
            };
            (usersServiceMock.findActiveById as jest.Mock).mockResolvedValue(targetUser);

            const result = await service.canViewUserReports(requester, 'target-1');
            expect(result).toBe(false);
        });
    });
});
