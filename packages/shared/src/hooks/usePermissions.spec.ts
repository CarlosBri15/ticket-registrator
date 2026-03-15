jest.mock('./useAuth');

import { usePermissions } from './usePermissions';
import { useUserQuery } from './useAuth';

const mockUseUserQuery = useUserQuery as jest.Mock;

const makeUser = (permissions: string[]) => ({
    data: {
        id: 'user-1',
        roleName: 'Admin',
        hierarchy: 99,
        companyId: 'company-1',
        departmentIds: [],
        permissions,
    },
});

describe('usePermissions', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('can()', () => {
        it('should return true when user has the permission', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users', 'create_users']));
            const { can } = usePermissions();
            expect(can('view_users')).toBe(true);
        });

        it('should return false when user does not have the permission', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users']));
            const { can } = usePermissions();
            expect(can('create_users')).toBe(false);
        });

        it('should return false when user has no permissions', () => {
            mockUseUserQuery.mockReturnValue(makeUser([]));
            const { can } = usePermissions();
            expect(can('view_users')).toBe(false);
        });

        it('should return false when user data is undefined', () => {
            mockUseUserQuery.mockReturnValue({ data: undefined });
            const { can } = usePermissions();
            expect(can('view_users')).toBe(false);
        });
    });

    describe('canAny()', () => {
        it('should return true when user has at least one of the permissions', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users']));
            const { canAny } = usePermissions();
            expect(canAny(['view_users', 'create_users'])).toBe(true);
        });

        it('should return false when user has none of the permissions', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['delete_users']));
            const { canAny } = usePermissions();
            expect(canAny(['view_users', 'create_users'])).toBe(false);
        });

        it('should return false for an empty permissions list', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users']));
            const { canAny } = usePermissions();
            expect(canAny([])).toBe(false);
        });
    });

    describe('canAll()', () => {
        it('should return true when user has all the permissions', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users', 'create_users', 'edit_users']));
            const { canAll } = usePermissions();
            expect(canAll(['view_users', 'create_users'])).toBe(true);
        });

        it('should return false when user is missing at least one permission', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users']));
            const { canAll } = usePermissions();
            expect(canAll(['view_users', 'create_users'])).toBe(false);
        });

        it('should return true for an empty required permissions list', () => {
            mockUseUserQuery.mockReturnValue(makeUser(['view_users']));
            const { canAll } = usePermissions();
            expect(canAll([])).toBe(true);
        });
    });
});
