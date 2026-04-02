/**
 * @jest-environment jsdom
 */
jest.mock('../hooks/useScope');
jest.mock('react', () => ({
    ...jest.requireActual('react'),
}));

import React from 'react';
import { render, act } from '@testing-library/react';
import { ScopeProvider, useScopeContext } from './ScopeProvider';
import { useScope } from '../hooks/useScope';

const mockUseScope = useScope as jest.Mock;

const makeScope = (type: 'global' | 'company' | 'department' | 'self', extra: object = {}) => ({
    scope: { type, companyId: 'company-1', ...extra },
    isGlobal: type === 'global',
    isCompany: type === 'global' || type === 'company',
    isDepartment: type === 'department',
    isSelf: type === 'self',
});

const ScopeConsumer = () => {
    const ctx = useScopeContext();
    return (
        <div>
            <span data-testid="scope-type">{ctx.scope.type}</span>
            <span data-testid="active-company">{ctx.activeCompanyId ?? 'none'}</span>
            <button
                onClick={() => ctx.setActiveCompanyId('org-switched')}
                data-testid="switch-btn"
            >
                Switch
            </button>
        </div>
    );
};

describe('ScopeProvider', () => {
    beforeEach(() => jest.clearAllMocks());

    it('provides scope context to children', () => {
        mockUseScope.mockReturnValue(makeScope('company'));
        const { getByTestId } = render(
            <ScopeProvider>
                <ScopeConsumer />
            </ScopeProvider>,
        );
        expect(getByTestId('scope-type').textContent).toBe('company');
    });

    it('initialises activeCompanyId as null', () => {
        mockUseScope.mockReturnValue(makeScope('global'));
        const { getByTestId } = render(
            <ScopeProvider>
                <ScopeConsumer />
            </ScopeProvider>,
        );
        expect(getByTestId('active-company').textContent).toBe('none');
    });

    it('allows SuperAdmin to switch active company', () => {
        mockUseScope.mockReturnValue(makeScope('global'));
        const { getByTestId } = render(
            <ScopeProvider>
                <ScopeConsumer />
            </ScopeProvider>,
        );

        act(() => {
            getByTestId('switch-btn').click();
        });

        expect(getByTestId('active-company').textContent).toBe('org-switched');
    });

    it('provides self scope correctly', () => {
        mockUseScope.mockReturnValue(makeScope('self'));
        const { getByTestId } = render(
            <ScopeProvider>
                <ScopeConsumer />
            </ScopeProvider>,
        );
        expect(getByTestId('scope-type').textContent).toBe('self');
    });
});

describe('useScopeContext', () => {
    it('throws when used outside ScopeProvider', () => {
        const ThrowingComponent = () => {
            useScopeContext();
            return null;
        };

        // Suppress expected React error output
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<ThrowingComponent />)).toThrow(
            'useScopeContext must be used inside <ScopeProvider>',
        );
        spy.mockRestore();
    });
});
