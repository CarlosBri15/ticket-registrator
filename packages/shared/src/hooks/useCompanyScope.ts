import { useScope } from "./useScope";
import { useScopeContext } from "../components/ScopeProvider";

/**
 * Resolves the active companyId from either:
 * - company/department/self-scoped users → scope.companyId
 * - SuperAdmin in company mode           → activeCompanyId
 * - SuperAdmin in global mode            → null
 */
export const useCompanyScope = () => {
  const { scope, isGlobal } = useScope();
  const { activeCompanyId } = useScopeContext();

  const companyId: string | null = isGlobal
    ? activeCompanyId
    : (scope.type !== "global" ? scope.companyId : null);

  return { companyId, isGlobal };
};
