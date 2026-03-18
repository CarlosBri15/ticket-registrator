import type { ReactNode } from 'react';
import type { PermissionType } from '../../user-roles/permissions';

export interface IPermissionGuardProps {
    /** Require a single permission */
    permission?: PermissionType;
    /** Require at least one of these permissions */
    anyOf?: PermissionType[];
    /** Require all of these permissions */
    allOf?: PermissionType[];
    children: ReactNode;
    /** Rendered when access is denied. Defaults to null (renders nothing). */
    fallback?: ReactNode;
}
