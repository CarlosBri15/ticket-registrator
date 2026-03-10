import { Test, TestingModule } from '@nestjs/testing';
import { PermissionsAuthorizationService } from './permissions-authorization.service';
import { PermissionUnauthorizedException } from './exceptions/permissions.exceptions';
import { permissions } from '@ticket-registrator/shared';

describe('PermissionsAuthorizationService', () => {
    let service: PermissionsAuthorizationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PermissionsAuthorizationService],
        }).compile();

        service = module.get<PermissionsAuthorizationService>(PermissionsAuthorizationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should allow managing catalog if user has MANAGE_PERMISSIONS', () => {
        expect(() => service.validateCanManageCatalog([permissions.MANAGE_PERMISSIONS])).not.toThrow();
    });

    it('should throw if user lacks MANAGE_PERMISSIONS for catalog management', () => {
        expect(() => service.validateCanManageCatalog([permissions.VIEW_USERS])).toThrow(PermissionUnauthorizedException);
    });

    it('should allow assigning permissions if user has MANAGE_PERMISSIONS', () => {
        expect(() => service.validateCanAssignPermissions([permissions.MANAGE_PERMISSIONS])).not.toThrow();
    });

    it('should throw if user lacks MANAGE_PERMISSIONS for assignments', () => {
        expect(() => service.validateCanAssignPermissions([permissions.VIEW_USERS])).toThrow(PermissionUnauthorizedException);
    });
});
