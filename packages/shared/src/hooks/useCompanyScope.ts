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

  let companyId: string | null;
  if (isGlobal) {
    companyId = activeCompanyId;
  } else if (scope.type === "global") {
    companyId = null;
  } else {
    companyId = scope.companyId;
  }

  return { companyId, isGlobal };
};
