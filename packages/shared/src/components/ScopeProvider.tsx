import { createContext, useContext, useState, type ReactNode } from 'react';
import { useScope } from '../hooks/useScope';
import type { IScopeContext } from '../interfaces/scope/scope.interface';

const ScopeContext = createContext<IScopeContext | null>(null);

/**
 * Wraps the app to provide scope context to all children.
 *
 * For regular users, scope is derived from their role/departments automatically.
 * For SuperAdmin, `setActiveCompanyId` allows switching the viewed organisation
 * without changing the user's own scope.
 */
export const ScopeProvider = ({ children }: { children: ReactNode }) => {
    const scopeValues = useScope();
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

    return (
        <ScopeContext.Provider value={{ ...scopeValues, activeCompanyId, setActiveCompanyId }}>
            {children}
        </ScopeContext.Provider>
    );
};

export const useScopeContext = (): IScopeContext => {
    const ctx = useContext(ScopeContext);
    if (!ctx) throw new Error('useScopeContext must be used inside <ScopeProvider>');
    return ctx;
};
