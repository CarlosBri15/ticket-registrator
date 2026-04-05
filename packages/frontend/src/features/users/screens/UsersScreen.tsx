import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users2, Shield, UserCheck, Search } from "lucide-react";
import {
  useUsersQuery,
  useRolesQuery,
  useSystemRolesQuery,
  usePermissions,
  type IUser,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { tokens } from "../../../styles/theme";
import { PixelCard } from "../../../components/ui/PixelCard";
import { SectionHeader } from "../../../components/ui/SectionHeader";
import { useTranslation } from "react-i18next";
import { Pagination } from "../../../components/ui/Pagination";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { UserRow } from "../components/UserRow";
import { UserFilterBar } from "../components/UserFilterBar";
import { UserSkeletonCard } from "../components/UserSkeletonCard";
import { useCompanyScope, useListState, useModalState } from "@ticket-registrator/shared";
import { DARK, BORDER } from "../constants";

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
    (companyRoles || []).forEach(r => {
      if (!combined.find(s => s.id === r.id)) combined.push(r);
    });
    return combined;
  }, [systemRoles, companyRoles]);

  const { search, setSearch, page, setPage, paginate } = useListState();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { isOpen: isEditOpen, item: editingUser, close: closeEdit } = useModalState<IUser>();

  const filtered = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.surname.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q)
    );
  }, [users, search]);

  const { paginated, totalPages } = paginate(filtered);

  const stats = useMemo(() => {
    if (!users) return { total: 0, roles: {} };
    const counts: Record<string, number> = {};
    users.forEach(u => {
      const roleName = roles?.find(r => r.id === u.roleId)?.name || "Other";
      counts[roleName] = (counts[roleName] || 0) + 1;
    });
    return {
      total: users.length,
      roles: counts
    };
  }, [users, roles]);

  return (
    <div className="-mx-6 -mt-7 md:-mx-10 lg:-mt-9">
      {/* Header Area */}
      <div className={tokens.headerPage}>
        <h1 className="font-space-bold text-dark" style={{ fontSize: 24, letterSpacing: "0.5px" }}>
          {t("users.title")}
        </h1>
        {can("create_users") && (
          <Button
            variant="primary"
            className="w-[160px] whitespace-nowrap"
            leftIcon={<Plus className="w-5 h-5" />}
            onClick={() => setIsCreateOpen(true)}
          >
            {t("users.newUser")}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_380px]">
        {/* ── Main List Column ── */}
        <main className="min-w-0 px-10 md:px-16 pt-4 pb-7 lg:pb-9 space-y-6">
          <UserFilterBar
            search={search}
            onSearch={setSearch}
            hasFilters={!!search}
            onClear={() => setSearch("")}
          />

          <section className="space-y-4">
            <SectionHeader
              icon={<Users2 />}
              title={t("users.title")}
              count={filtered.length}
            />

            {isLoading ? (
              <div className="space-y-2.5">
                <UserSkeletonCard />
                <UserSkeletonCard />
                <UserSkeletonCard />
              </div>
            ) : filtered.length === 0 ? (
              <PixelCard className="w-full">
                <div className="flex flex-col items-center py-12 gap-3 text-center">
                  <Search className="w-8 h-8" style={{ color: `${DARK}20` }} />
                  <p className="font-space-semibold text-dark/50" style={{ fontSize: 14 }}>
                    {search ? t("common.noResults") : t("users.empty")}
                  </p>
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="font-space-bold text-brand hover:underline"
                      style={{ fontSize: 13 }}
                    >
                      {t("trips.filterClearAll")}
                    </button>
                  )}
                </div>
              </PixelCard>
            ) : (
              <div className="space-y-2.5">
                {paginated.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    roleName={roles?.find((r) => r.id === user.roleId)?.name}
                    onClick={() => navigate(`/users/${user.id}`)}
                  />
                ))}

                <div className="pt-4">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    pageSize={10}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </section>
        </main>

        {/* ── Vertical Separator ── */}
        <div className="hidden lg:block self-stretch" style={{ width: 2, backgroundColor: BORDER }} />

        {/* ── Sidebar: Stats & Info ── */}
        <aside className="px-8 md:px-10 py-7 lg:py-9 bg-surface/30">
          <section className="space-y-6">
            <SectionHeader icon={<Shield />} title={t("users.statsTitle", "Resumen")} />

            <div className="grid grid-cols-1 gap-4">
              <PixelCard>
                <div className="p-5 flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2"
                    style={{ backgroundColor: `${DARK}05`, borderColor: `${DARK}08` }}
                  >
                    <UserCheck className="w-6 h-6 opacity-40" />
                  </div>
                  <div>
                    <p className="text-[10px] font-space-bold text-dark/30 uppercase tracking-widest leading-none mb-1">
                      {t("users.totalUsers", "Total Usuarios")}
                    </p>
                    <p className="text-2xl font-space-bold text-dark leading-none">
                      {stats.total}
                    </p>
                  </div>
                </div>
              </PixelCard>

              {Object.entries(stats.roles).map(([role, count]) => (
                <PixelCard key={role}>
                  <div className="p-4 flex items-center justify-between">
                    <span className="font-space-semibold text-dark/60" style={{ fontSize: 13 }}>
                      {role}
                    </span>
                    <span
                      className="font-space-bold px-3 py-1 rounded-lg border-2"
                      style={{
                        fontSize: 13,
                        backgroundColor: role === "Admin" ? "rgba(239, 68, 68, 0.05)" : "rgba(30, 58, 138, 0.05)",
                        borderColor: "rgba(0,0,0,0.05)",
                        color: DARK
                      }}
                    >
                      {count}
                    </span>
                  </div>
                </PixelCard>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-dark/10">
              <p className="font-space-semibold text-dark/30 text-center" style={{ fontSize: 11, lineHeight: 1.5 }}>
                {t("users.sidebarInfo", "Administra los usuarios y sus permisos desde esta vista centralizada.")}
              </p>
            </div>
          </section>
        </aside>
      </div>

      {/* Modals */}
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
