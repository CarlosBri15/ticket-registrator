import { Test, TestingModule } from '@nestjs/testing';
import { RolesAuthorizationService } from './roles-authorization.service';
import { RoleUnauthorizedException } from './exceptions/roles.exceptions';

describe('RolesAuthorizationService', () => {
    let service: RolesAuthorizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RolesAuthorizationService],
        }).compile();

        service = module.get<RolesAuthorizationService>(RolesAuthorizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateHierarchy', () => {
        it('should throw exception if target hierarchy is higher than requester', () => {
            expect(() => service.validateHierarchy(50, 55)).toThrow(RoleUnauthorizedException);
        });

        it('should throw exception if target hierarchy is equal to requester', () => {
            expect(() => service.validateHierarchy(50, 50)).toThrow(RoleUnauthorizedException);
        });

        it('should pass if target hierarchy is lower than requester', () => {
            expect(() => service.validateHierarchy(100, 10)).not.toThrow();
        });
    });

    describe('validateCompanyAccess', () => {
        it('should throw if company ids mismatch', () => {
            expect(() => service.validateCompanyAccess('comp-1', 'comp-2')).toThrow(RoleUnauthorizedException);
        });

        it('should pass if role is system (null company)', () => {
            expect(() => service.validateCompanyAccess('comp-1', null)).not.toThrow();
        });

        it('should pass if company ids match', () => {
            expect(() => service.validateCompanyAccess('comp-1', 'comp-1')).not.toThrow();
        });
    });
});
