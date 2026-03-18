import { Test, TestingModule } from '@nestjs/testing';
import { TicketsAuthorizationService } from './tickets-authorization.service';
import { ReportsAuthorizationService } from '../reports/reports-authorization.service';
import { AUTHORITY_LEVELS } from '@ticket-registrator/shared';

describe('TicketsAuthorizationService', () => {
  let service: TicketsAuthorizationService;
  let reportsAuthMock: any;

  beforeEach(async () => {
    reportsAuthMock = {
      canViewUserReports: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsAuthorizationService,
        { provide: ReportsAuthorizationService, useValue: reportsAuthMock },
      ],
    }).compile();

    service = module.get<TicketsAuthorizationService>(
      TicketsAuthorizationService,
    );
  });

  describe('validateCanViewReport', () => {
    const requester = { id: 'user-1' } as any;
    const report = { userId: 'user-1' };

    it('should allow if requester is the owner', async () => {
      const result = await service.validateCanViewReport(requester, report);
      expect(result).toBe(true);
    });

    it('should delegate to reportsAuthService if not the owner', async () => {
      const otherReport = { userId: 'user-2' };
      reportsAuthMock.canViewUserReports.mockResolvedValue(true);

      const result = await service.validateCanViewReport(
        requester,
        otherReport,
      );
      expect(result).toBe(true);
      expect(reportsAuthMock.canViewUserReports).toHaveBeenCalledWith(
        requester,
        'user-2',
      );
    });
  });

  describe('validateCanModifyReport', () => {
    const requester = { id: 'user-1' } as any;

    it('should allow if requester is the owner', async () => {
      expect(
        await service.validateCanModifyReport(requester, { userId: 'user-1' }),
      ).toBe(true);
    });

    it('should NOT allow if requester is NOT the owner', async () => {
      expect(
        await service.validateCanModifyReport(requester, { userId: 'user-2' }),
      ).toBe(false);
    });
  });
});
