import { memo, useState, useEffect } from "react";
import { Shield, Plus, Trash2, Building2 } from "lucide-react";
import {
  useRolesQuery,
  useSystemRolesQuery,
  useDeleteRoleMutation,
  usePermissions,
  type IRole,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { tokens, radius } from "../../../styles/theme";
import { EmptyState } from "../../../components/ui/EmptyState";
import { useTranslation } from "react-i18next";
import { CreateRoleModal, getHierarchyMeta } from "../components/CreateRoleModal";
import { PAGE_SIZE, useCompanyScope, useModalState } from "@ticket-registrator/shared";

const RoleCard = memo(({
  role,
  canDelete,
  onDelete,
}: {
  role: IRole;
  canDelete: boolean;
  onDelete: (id: string) => void;
}) => {
  const { label, color: colorClass } = getHierarchyMeta(role.hierarchy);

  return (
    <div className={`${tokens.card} ${tokens.cardInteractive}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-9 h-9 bg-brand/10 ${radius.sm} flex items-center justify-center shrink-0`}>
            <Shield className="w-4 h-4 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-dark truncate">{role.name}</p>
            {role.description && (
              <p className="text-xs text-slate-400 mt-0.5 truncate">{role.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`${tokens.badgeSm} ${colorClass}`}>
            {label}
          </span>
          {canDelete && (
            <Button
              variant="ghost-danger"
              size="icon"
              onClick={() => onDelete(role.id)}
              className="!p-2 !border-none !shadow-none"
              leftIcon={<Trash2 className="w-4 h-4" />}
            />
          )}
        </div>
      </div>
    </div>
  );
});

export const RolesScreen = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const { companyId, isGlobal } = useCompanyScope();

  const { data: companyRoles, isLoading: loadingCompany } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles, isLoading: loadingSystem } = useSystemRolesQuery();
  const deleteMutation = useDeleteRoleMutation(companyId ?? "");

  const { isOpen: isCreateOpen, open: openCreate, close: closeCreate } = useModalState();
  const [page, setPage] = useState(1);

  const isLoading = loadingCompany || loadingSystem;
  const roles = companyId ? companyRoles : systemRoles;

  useEffect(() => { setPage(1); }, [companyId]);

  const paginated = roles?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil((roles?.length ?? 0) / PAGE_SIZE);

  if (!companyId && !isGlobal) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <EmptyState
          icon={<Building2 className="w-7 h-7 text-white" />}
          title={t("roles.selectOrg")}
          description={t("roles.selectOrgDesc")}
        />
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-10 h-10 border-2 border-brand border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-slate-500 font-medium text-sm">Cargando roles...</p>
        </div>
      );
    }

    if (!roles || roles.length === 0) {
      return (
        <EmptyState
          icon={<Shield className="w-7 h-7 text-white" />}
          title={t("roles.empty")}
          description={t("roles.emptyDesc")}
        />
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginated!.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              canDelete={can("delete_roles")}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={roles.length}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-2xl font-bold text-dark tracking-tight mb-1 flex items-center gap-3">
            <Shield className="w-6 h-6 text-brand" />
            Roles
          </h1>
          <p className="text-slate-500 text-sm">
            {companyId ? "Roles personalizados de tu organización." : "Roles de sistema."}
          </p>
        </div>
        {companyId && can("create_roles") && (
          <Button onClick={() => openCreate()}>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Rol
          </Button>
        )}
      </div>

      {/* Content */}
      {renderContent()}

      {companyId && (
        <CreateRoleModal
          isOpen={isCreateOpen}
          onClose={closeCreate}
          companyId={companyId}
        />
      )}
    </div>
  );
};
