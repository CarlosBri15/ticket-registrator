import { memo, useState, useEffect } from "react";
import { Shield, Plus, Trash2, ChevronRight } from "lucide-react";
import {
  useRolesQuery,
  useSystemRolesQuery,
  useDeleteRoleMutation,
  usePermissions,
  PAGE_SIZE,
  useCompanyScope,
  useModalState,
  type IRole,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { TableHeader } from "../../../components/ui/TableHeader";
import { CreateRoleModal, getHierarchyMeta } from "../components/CreateRoleModal";

const ROLE_GRID = "32px 1fr 120px 16px";

const RoleRow = memo(({
  role,
  canDelete,
  onDelete,
  deleteLabel,
  resolveLabel,
}: {
  role: IRole;
  canDelete: boolean;
  onDelete: (id: string) => void;
  deleteLabel: string;
  resolveLabel: (labelKey: string) => string;
}) => {
  const meta = getHierarchyMeta(role.hierarchy);

  return (
    <div className="group relative border-b border-[var(--color-border-main)] last:border-b-0 hover:bg-[var(--color-secondary)] transition-colors duration-100">
      <div
        className="grid items-center gap-4 px-4 py-3.5"
        style={{ gridTemplateColumns: ROLE_GRID }}
      >
        <div className="w-8 h-8 rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-main)] flex items-center justify-center text-dark/40 group-hover:bg-white">
          <Shield className="w-3.5 h-3.5" aria-hidden={true} />
        </div>

        <div className="min-w-0">
          <p className="font-sans-semibold text-dark text-[14px] truncate leading-snug">
            {role.name}
          </p>
          {role.description && (
            <p className="font-sans-medium text-dark/50 text-[12px] mt-0.5 truncate leading-none">
              {role.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[var(--color-secondary)] text-dark/70 text-[11px] font-sans-semibold whitespace-nowrap group-hover:bg-white">
            {resolveLabel(meta.labelKey)}
          </span>
        </div>

        <div className="flex items-center justify-end">
          {canDelete ? (
            <button
              type="button"
              title={deleteLabel}
              onClick={() => onDelete(role.id)}
              className="text-dark/40 hover:text-danger transition-colors p-1 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden={true} />
            </button>
          ) : (
            <ChevronRight className="w-4 h-4 text-dark/30 opacity-0 group-hover:opacity-100 transition-opacity" />
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

  useEffect(() => {
    setPage(1);
  }, [companyId]);

  const paginated = roles?.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = Math.ceil((roles?.length ?? 0) / PAGE_SIZE);

  const resolveLabel = (labelKey: string) =>
    labelKey.startsWith("roles.") ? t(labelKey as "roles.levelEmployee") : labelKey;

  if (!companyId && !isGlobal) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader title={t("roles.title", "Roles")} />
        <div className="flex flex-col items-center py-14 gap-2 text-center">
          <p className="font-sans-medium text-[13px] text-dark/55">
            {t("roles.selectOrg", "Selecciona una organización")}
          </p>
          <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
            {t("roles.selectOrgDesc")}
          </p>
        </div>
      </div>
    );
  }

  const totalRoles = roles?.length ?? 0;
  const hasAny = totalRoles > 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("roles.title", "Roles")}
        subtitle={
          companyId
            ? t("roles.companySubtitle", "Roles personalizados de tu organización.")
            : t("roles.systemSubtitle", "Roles de sistema.")
        }
        stats={
          hasAny ? [{ label: t("roles.total", "Total"), value: totalRoles }] : undefined
        }
        actions={
          companyId && can("create_roles") ? (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => openCreate()}
            >
              {t("roles.newRole", "Nuevo Rol")}
            </Button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3">
        <div className="w-full">
          <TableHeader
            gridTemplate={ROLE_GRID}
            columns={[
              { label: t("roles.tableName", "Nombre") },
              { label: t("roles.tableLevel", "Nivel"), align: "right" },
            ]}
          />

          {(() => {
            if (isLoading) {
              return (
                <div className="flex flex-col items-center justify-center py-14 gap-2">
                  <div className="w-4 h-4 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin" />
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("roles.loading", "Cargando roles...")}
                  </p>
                </div>
              );
            }

            if (!hasAny) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("roles.empty")}
                  </p>
                  <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
                    {t("roles.emptyDesc")}
                  </p>
                </div>
              );
            }

            return paginated!.map((role) => (
              <RoleRow
                key={role.id}
                role={role}
                canDelete={can("delete_roles")}
                onDelete={(id) => deleteMutation.mutate(id)}
                deleteLabel={t("common.delete", "Eliminar")}
                resolveLabel={resolveLabel}
              />
            ));
          })()}
        </div>

        {hasAny && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={totalRoles}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      {companyId && (
        <CreateRoleModal isOpen={isCreateOpen} onClose={closeCreate} companyId={companyId} />
      )}
    </div>
  );
};
