export type Scope =
    | { type: 'global' }
    | { type: 'company'; companyId: string }
    | { type: 'department'; companyId: string; departmentIds: string[] }
    | { type: 'self'; userId: string; companyId: string };

export interface IScopeContext {
    scope: Scope;
    isGlobal: boolean;
    isCompany: boolean;
    isDepartment: boolean;
    isSelf: boolean;
    activeCompanyId: string | null;
    setActiveCompanyId: (companyId: string | null) => void;
}
