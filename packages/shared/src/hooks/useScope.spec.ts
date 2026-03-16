jest.mock('./useAuth');
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useMemo: (fn: () => any) => fn(),
}));

import { useScope } from './useScope';
import { useUserQuery } from './useAuth';

const mockUseUserQuery = useUserQuery as jest.Mock;

const makeUser = (overrides: Partial<{
    companyId: string | null;
    departmentIds: string[];
    hierarchy: number;
    id: string;
}>) => ({
    data: {
        id: 'user-1',
        roleName: 'Employee',
        companyId: 'company-1',
        departmentIds: [],
        permissions: [],
        hierarchy: 10,
        ...overrides,
    },
});

describe('useScope', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('global scope', () => {
        it('should return global scope when user has no companyId (SuperAdmin)', () => {
            mockUseUserQuery.mockReturnValue(makeUser({ companyId: null, hierarchy: 100 }));
            const { scope, isGlobal } = useScope();
            expect(scope.type).toBe('global');
            expect(isGlobal).toBe(true);
        });
    });

    describe('company scope', () => {
        it('should return company scope for Admin (hierarchy 99)', () => {
            mockUseUserQuery.mockReturnValue(
                makeUser({ hierarchy: 99, companyId: 'company-1', departmentIds: [] }),
            );
            const { scope, isCompany } = useScope();
            expect(scope.type).toBe('company');
            expect(isCompany).toBe(true);
            if (scope.type === 'company') expect(scope.companyId).toBe('company-1');
        });

        it('should return company scope for Controller (hierarchy 55, no departments)', () => {
            mockUseUserQuery.mockReturnValue(
                makeUser({ hierarchy: 55, companyId: 'company-1', departmentIds: [] }),
            );
            const { scope } = useScope();
            expect(scope.type).toBe('company');
        });
    });

    describe('department scope', () => {
        it('should return department scope for Manager (hierarchy 50, with departments)', () => {
            mockUseUserQuery.mockReturnValue(
                makeUser({ hierarchy: 50, companyId: 'company-1', departmentIds: ['dept-1', 'dept-2'] }),
            );
            const { scope, isDepartment } = useScope();
            expect(scope.type).toBe('department');
            expect(isDepartment).toBe(true);
            if (scope.type === 'department') {
                expect(scope.companyId).toBe('company-1');
                expect(scope.departmentIds).toEqual(['dept-1', 'dept-2']);
            }
        });
    });

    describe('self scope', () => {
        it('should return self scope for Employee (hierarchy 10)', () => {
            mockUseUserQuery.mockReturnValue(
                makeUser({ hierarchy: 10, companyId: 'company-1', departmentIds: [] }),
            );
            const { scope, isSelf } = useScope();
            expect(scope.type).toBe('self');
            expect(isSelf).toBe(true);
        });

        it('should return self scope when user data is undefined', () => {
            mockUseUserQuery.mockReturnValue({ data: undefined });
            const { scope } = useScope();
            expect(scope.type).toBe('self');
        });
    });

    describe('isCompany helper', () => {
        it('should be true for global scope (SuperAdmin)', () => {
            mockUseUserQuery.mockReturnValue(makeUser({ companyId: null, hierarchy: 100 }));
            const { isCompany } = useScope();
            expect(isCompany).toBe(true);
        });

        it('should be false for self scope', () => {
            mockUseUserQuery.mockReturnValue(makeUser({ hierarchy: 10 }));
            const { isCompany } = useScope();
            expect(isCompany).toBe(false);
        });
    });
});
