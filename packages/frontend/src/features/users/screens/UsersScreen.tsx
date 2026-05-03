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
  PAGE_SIZE,
  type IUser,
} from "@ticket-registrator/shared";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/ui/Button";
import { Pagination } from "../../../components/ui/Pagination";
import { ResourceListScreen } from "../../../components/ui/ResourceListScreen";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { UserRow } from "../components/UserRow";
import { USER_GRID } from "../../../constants/gridLayouts";
import { UserSkeletonCard } from "../components/UserSkeletonCard";
import { UserFilterBar } from "../components/UserFilterBar";

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

  const stats = useMemo(
    () => [{ label: t("users.totalUsers", "Total"), value: totalUsers }],
    [totalUsers, t],
  );

  return (
    <>
      <ResourceListScreen<IUser>
        title={t("users.title")}
        stats={hasAnyUsers ? stats : undefined}
        headerActions={
          can("create_users") ? (
            <Button
              variant="primary"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsCreateOpen(true)}
            >
              {t("users.newUser")}
            </Button>
          ) : null
        }
        toolbar={
          hasAnyUsers ? (
            <UserFilterBar
              search={search}
              onSearch={setSearch}
              hasFilters={!!search}
              onClear={() => setSearch("")}
            />
          ) : null
        }
        gridTemplate={USER_GRID}
        columns={[
          { label: t("users.tableName", "Nombre") },
          { label: t("users.tableEmail", "Email") },
          { label: t("users.tableRole", "Rol"), align: "right" },
        ]}
        items={paginated}
        total={totalUsers}
        filteredTotal={filtered.length}
        isLoading={isLoading}
        keyOf={(user) => user.id}
        loadingSkeleton={
          <>
            <p className="sr-only">{t("users.loading")}</p>
            <UserSkeletonCard />
            <UserSkeletonCard />
            <UserSkeletonCard />
          </>
        }
        renderRow={(user) => (
          <UserRow
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
        )}
        messages={{
          emptyTitle: t("users.empty"),
          emptyDescription: t("users.emptyDesc"),
          noResults: t("common.noResults"),
          clearFilters: t("trips.filterClearAll"),
        }}
        onClearFilters={() => setSearch("")}
        footer={
          filtered.length > 0 ? (
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          ) : null
        }
      />

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
    </>
  );
};
