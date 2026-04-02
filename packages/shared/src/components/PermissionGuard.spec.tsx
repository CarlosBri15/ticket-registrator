/**
 * @jest-environment jsdom
 */
jest.mock('../hooks/usePermissions');

import React from 'react';
import { render } from '@testing-library/react';
import { PermissionGuard } from './PermissionGuard';
import { usePermissions } from '../hooks/usePermissions';

const mockUsePermissions = usePermissions as jest.Mock;

const makePermissions = (perms: string[]) => ({
    can: (p: string) => perms.includes(p),
    canAny: (ps: string[]) => ps.some(p => perms.includes(p)),
    canAll: (ps: string[]) => ps.every(p => perms.includes(p)),
});

describe('PermissionGuard', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('single permission prop', () => {
        it('renders children when user has the permission', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['view_users']));
            const { getByText } = render(
                <PermissionGuard permission="view_users">
                    <span>Protected Content</span>
                </PermissionGuard>,
            );
            expect(getByText('Protected Content')).toBeTruthy();
        });

        it('renders nothing when user lacks the permission', () => {
            mockUsePermissions.mockReturnValue(makePermissions([]));
            const { queryByText } = render(
                <PermissionGuard permission="view_users">
                    <span>Protected Content</span>
                </PermissionGuard>,
            );
            expect(queryByText('Protected Content')).toBeNull();
        });

        it('renders fallback when user lacks the permission', () => {
            mockUsePermissions.mockReturnValue(makePermissions([]));
            const { queryByText, getByText } = render(
                <PermissionGuard permission="view_users" fallback={<span>Access Denied</span>}>
                    <span>Protected Content</span>
                </PermissionGuard>,
            );
            expect(queryByText('Protected Content')).toBeNull();
            expect(getByText('Access Denied')).toBeTruthy();
        });
    });

    describe('anyOf prop', () => {
        it('renders children when user has at least one permission', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['approve_reports']));
            const { getByText } = render(
                <PermissionGuard anyOf={['approve_reports', 'approve_tickets']}>
                    <span>Approve Panel</span>
                </PermissionGuard>,
            );
            expect(getByText('Approve Panel')).toBeTruthy();
        });

        it('renders fallback when user has none of the anyOf permissions', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['view_users']));
            const { queryByText, getByText } = render(
                <PermissionGuard anyOf={['approve_reports', 'approve_tickets']} fallback={<span>No Access</span>}>
                    <span>Approve Panel</span>
                </PermissionGuard>,
            );
            expect(queryByText('Approve Panel')).toBeNull();
            expect(getByText('No Access')).toBeTruthy();
        });
    });

    describe('allOf prop', () => {
        it('renders children when user has all required permissions', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['view_roles', 'edit_roles']));
            const { getByText } = render(
                <PermissionGuard allOf={['view_roles', 'edit_roles']}>
                    <span>Roles Admin</span>
                </PermissionGuard>,
            );
            expect(getByText('Roles Admin')).toBeTruthy();
        });

        it('renders fallback when user is missing one of the allOf permissions', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['view_roles']));
            const { queryByText, getByText } = render(
                <PermissionGuard allOf={['view_roles', 'edit_roles']} fallback={<span>Missing Perm</span>}>
                    <span>Roles Admin</span>
                </PermissionGuard>,
            );
            expect(queryByText('Roles Admin')).toBeNull();
            expect(getByText('Missing Perm')).toBeTruthy();
        });
    });

    describe('no props (renders always)', () => {
        it('renders children when no permission props are provided', () => {
            mockUsePermissions.mockReturnValue(makePermissions([]));
            const { getByText } = render(
                <PermissionGuard>
                    <span>Always Visible</span>
                </PermissionGuard>,
            );
            expect(getByText('Always Visible')).toBeTruthy();
        });
    });

    describe('combined props', () => {
        it('renders children when both permission and anyOf are satisfied', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['view_users', 'approve_reports']));
            const { getByText } = render(
                <PermissionGuard permission="view_users" anyOf={['approve_reports']}>
                    <span>Combined</span>
                </PermissionGuard>,
            );
            expect(getByText('Combined')).toBeTruthy();
        });

        it('renders fallback when permission is met but anyOf is not', () => {
            mockUsePermissions.mockReturnValue(makePermissions(['view_users']));
            const { queryByText, getByText } = render(
                <PermissionGuard
                    permission="view_users"
                    anyOf={['approve_reports']}
                    fallback={<span>Partial Denied</span>}
                >
                    <span>Combined</span>
                </PermissionGuard>,
            );
            expect(queryByText('Combined')).toBeNull();
            expect(getByText('Partial Denied')).toBeTruthy();
        });
    });
});
