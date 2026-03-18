import { useState, useEffect } from "react";
import {
  useAllPermissionsQuery,
  useRolePermissionsQuery,
  useAssignPermissionMutation,
  useUnassignPermissionMutation,
} from "@ticket-registrator/shared";
import { Button } from "../Button";
import { Modal } from "../Modal";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  roleId: string;
  roleName?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getPermissionResource = (permissionName: string): string => {
  const parts = permissionName.split("_");
  if (parts.length < 2) return permissionName;
  return parts.slice(1).join("_");
};

const capitalizeFirst = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

// ─── Component ────────────────────────────────────────────────────────────────

export const AssignPermissionsModal = ({
  isOpen,
  onClose,
  companyId,
  roleId,
  roleName,
}: AssignPermissionsModalProps) => {
  const { data: allPermissions, isLoading: loadingAll } =
    useAllPermissionsQuery();
  const { data: assignedPermissions, isLoading: loadingAssigned } =
    useRolePermissionsQuery(companyId, roleId);

  const assignMutation = useAssignPermissionMutation();
  const unassignMutation = useUnassignPermissionMutation();

  const [localAssigned, setLocalAssigned] = useState<Set<string>>(new Set());

  // Initialize local state when assigned permissions load
  useEffect(() => {
    if (assignedPermissions) {
      setLocalAssigned(new Set(assignedPermissions.map((p) => p.id)));
    }
  }, [assignedPermissions]);

  const isLoading = loadingAll || loadingAssigned;
  const isSaving = assignMutation.isPending || unassignMutation.isPending;

  const togglePermission = (permissionId: string) => {
    setLocalAssigned((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!allPermissions || !assignedPermissions) return;

    const originalSet = new Set(assignedPermissions.map((p) => p.id));
    const toAdd = [...localAssigned].filter((id) => !originalSet.has(id));
    const toRemove = [...originalSet].filter((id) => !localAssigned.has(id));

    const allOps = [
      ...toAdd.map((permissionId) =>
        assignMutation.mutateAsync({ roleId, permissionId, companyId, _companyId: companyId })
      ),
      ...toRemove.map((permissionId) =>
        unassignMutation.mutateAsync({ roleId, permissionId, companyId })
      ),
    ];

    await Promise.allSettled(allOps);
    onClose();
  };

  // Group permissions by resource
  const groupedPermissions: Record<string, typeof allPermissions> = {};
  if (allPermissions) {
    for (const perm of allPermissions) {
      const resource = getPermissionResource(perm.name);
      groupedPermissions[resource] ??= [];
      groupedPermissions[resource].push(perm);
    }
  }

  const sortedGroups = Object.keys(groupedPermissions).sort((a, b) =>
    a.localeCompare(b)
  );
  const totalCount = allPermissions?.length ?? 0;
  const selectedCount = localAssigned.size;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Asignar Permisos"
      subtitle={roleName ? `Rol: ${roleName}` : undefined}
      size="xl"
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div
            className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"
            aria-label="Cargando permisos"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Count badge */}
          <p className="text-sm font-semibold text-gray-500">
            {selectedCount} de {totalCount} permisos seleccionados
          </p>

          {/* Permission groups */}
          <div className="space-y-5 max-h-[50vh] overflow-y-auto pr-1">
            {sortedGroups.map((group) => {
              const perms = groupedPermissions[group] ?? [];
              return (
                <div key={group}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    {capitalizeFirst(group)}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((perm) => {
                      const isChecked = localAssigned.has(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-brand/5 hover:border-brand/20 transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.id)}
                            className="mt-0.5 w-4 h-4 rounded accent-brand shrink-0"
                            aria-label={perm.name}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-dark break-all">
                              {perm.name}
                            </p>
                            {perm.description && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {perm.description}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              isLoading={isSaving}
              disabled={isSaving}
              className="flex-1"
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
