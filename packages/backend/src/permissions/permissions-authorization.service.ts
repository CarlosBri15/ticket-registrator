import { Injectable } from '@nestjs/common';
import { PermissionUnauthorizedException } from './exceptions/permissions.exceptions';
import { permissions } from '@ticket-registrator/shared';

@Injectable()
export class PermissionsAuthorizationService {

    validateCanManageCatalog(requesterPermissions: string[]) {
        if (!requesterPermissions.includes(permissions.MANAGE_PERMISSIONS)) {
            throw new PermissionUnauthorizedException('You lack permissions to manage the global permission catalog');
        }
    }

    validateCanAssignPermissions(requesterPermissions: string[]) {
        if (!requesterPermissions.includes(permissions.MANAGE_PERMISSIONS)) {
            throw new PermissionUnauthorizedException('You lack permissions to assign or override permissions');
        }
    }
}
