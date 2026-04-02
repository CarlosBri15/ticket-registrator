import { SetMetadata } from '@nestjs/common';
import { PermissionType } from '@ticket-registrator/shared';

export const PERMISSIONS_KEY = 'permissions';
export const RequireAnyPermission = (...permissions: PermissionType[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
