import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import {
  useUsersQuery,
  useRolesQuery,
  useSystemRolesQuery,
  usePermissions,
  useCompanyScope,
  useListState,
  useModalState,
  type IUser,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../components/ui/PageHeader";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { TableHeader } from "../../../components/ui/TableHeader";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { UserRow, USER_GRID } from "../components/UserRow";
import { UserSkeletonCard } from "../components/UserSkeletonCard";
import { UserFilterBar } from "../components/UserFilterBar";

const PAGE_SIZE = 10;

export const UsersScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { companyId } = useCompanyScope();

  const { data: users, isLoading } = useUsersQuery();
  const { data: companyRoles } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles } = useSystemRolesQuery();

  const roles = useMemo(() => {
    const combined = [...(systemRoles || [])];
    (companyRoles || []).forEach((r) => {
      if (!combined.some((s) => s.id === r.id)) combined.push(r);
    });
    return combined;
  }, [systemRoles, companyRoles]);

  const { search, setSearch, page, setPage, paginate } = useListState(PAGE_SIZE);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isOpen: isEditOpen, item: editingUser, open: openEdit, close: closeEdit } =
    useModalState<IUser>();

  const filtered = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.surname.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q),
    );
  }, [users, search]);

  const { paginated, totalPages } = paginate(filtered);

  const totalUsers = users?.length ?? 0;
  const hasAnyUsers = totalUsers > 0;
  const hasFilteredResults = filtered.length > 0;

  const stats = useMemo(
    () => [{ label: t("users.totalUsers", "Total"), value: totalUsers }],
    [totalUsers, t],
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={t("users.title")}
        stats={hasAnyUsers ? stats : undefined}
        actions={
          can("create_users") && (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateOpen(true)}
            >
              {t("users.newUser")}
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-3">
        {hasAnyUsers && (
          <UserFilterBar
            search={search}
            onSearch={setSearch}
            hasFilters={!!search}
            onClear={() => setSearch("")}
          />
        )}

        <div className="w-full">
          <TableHeader
            gridTemplate={USER_GRID}
            columns={[
              { label: t("users.tableName", "Nombre") },
              { label: t("users.tableEmail", "Email") },
              { label: t("users.tableRole", "Rol"), align: "right" },
            ]}
          />

          {(() => {
            if (isLoading) {
              return (
                <>
                  <p className="sr-only">{t("users.loading")}</p>
                  <UserSkeletonCard />
                  <UserSkeletonCard />
                  <UserSkeletonCard />
                </>
              );
            }

            if (!hasAnyUsers) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("users.empty")}
                  </p>
                  <p className="font-sans-normal text-[12px] text-dark/40 max-w-sm">
                    {t("users.emptyDesc")}
                  </p>
                </div>
              );
            }

            if (!hasFilteredResults) {
              return (
                <div className="flex flex-col items-center py-14 gap-2 text-center border-b border-[var(--color-border-main)]">
                  <p className="font-sans-medium text-[13px] text-dark/55">
                    {t("common.noResults")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="font-sans-medium text-dark/50 text-[12px] underline underline-offset-2 hover:text-dark transition-colors mt-1"
                  >
                    {t("trips.filterClearAll")}
                  </button>
                </div>
              );
            }

            return paginated.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                roleName={roles?.find((r) => r.id === user.roleId)?.name}
                onClick={() => navigate(`/users/${user.id}`)}
                rightAction={
                  can("edit_users") ? (
                    <button
                      type="button"
                      title={t("users.editUser")}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(user);
                      }}
                      className="text-dark/30 hover:text-dark transition-colors p-1"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden={true} />
                    </button>
                  ) : undefined
                }
              />
            ));
          })()}
        </div>

        {hasFilteredResults && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        )}
      </div>

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        companyId={companyId}
      />

      {isEditOpen && editingUser && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={closeEdit}
          user={editingUser}
          companyId={companyId}
        />
      )}
    </div>
  );
};
