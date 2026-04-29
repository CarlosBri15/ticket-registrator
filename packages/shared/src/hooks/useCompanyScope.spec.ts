/** @jest-environment jsdom */
jest.mock('./useScope');
jest.mock('../components/ScopeProvider');

import { renderHook } from '@testing-library/react';
import { useCompanyScope } from './useCompanyScope';
import { useScope } from './useScope';
import { useScopeContext } from '../components/ScopeProvider';

const mockUseScope = useScope as jest.Mock;
const mockUseScopeContext = useScopeContext as jest.Mock;

describe('useCompanyScope', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns activeCompanyId when isGlobal is true (SuperAdmin viewing a company)', () => {
    mockUseScope.mockReturnValue({ scope: { type: 'global' }, isGlobal: true });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: 'company-xyz' });

    const { result } = renderHook(() => useCompanyScope());
    expect(result.current.companyId).toBe('company-xyz');
    expect(result.current.isGlobal).toBe(true);
  });

  it('returns null when isGlobal is true and activeCompanyId is null (SuperAdmin global mode)', () => {
    mockUseScope.mockReturnValue({ scope: { type: 'global' }, isGlobal: true });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: null });

    const { result } = renderHook(() => useCompanyScope());
    expect(result.current.companyId).toBeNull();
    expect(result.current.isGlobal).toBe(true);
  });

  it('returns null when scope.type is global and isGlobal is false (edge case)', () => {
    mockUseScope.mockReturnValue({ scope: { type: 'global' }, isGlobal: false });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: 'company-xyz' });

    const { result } = renderHook(() => useCompanyScope());
    expect(result.current.companyId).toBeNull();
    expect(result.current.isGlobal).toBe(false);
  });

  it('returns scope.companyId for company-scoped users', () => {
    mockUseScope.mockReturnValue({
      scope: { type: 'company', companyId: 'comp-1' },
      isGlobal: false,
    });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: null });

    const { result } = renderHook(() => useCompanyScope());
    expect(result.current.companyId).toBe('comp-1');
    expect(result.current.isGlobal).toBe(false);
  });

  it('returns scope.companyId for department-scoped users', () => {
    mockUseScope.mockReturnValue({
      scope: { type: 'department', companyId: 'comp-2', departmentIds: ['d1'] },
      isGlobal: false,
    });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: null });

    const { result } = renderHook(() => useCompanyScope());
    expect(result.current.companyId).toBe('comp-2');
  });

  it('returns scope.companyId for self-scoped users', () => {
    mockUseScope.mockReturnValue({
      scope: { type: 'self', userId: 'u1', companyId: 'comp-3' },
      isGlobal: false,
    });
    mockUseScopeContext.mockReturnValue({ activeCompanyId: null });

    const { result } = renderHook(() => useCompanyScope());
    expect(result.current.companyId).toBe('comp-3');
  });
});
