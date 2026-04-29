import { useState, useEffect } from "react";
import {
  useAllPermissionsQuery,
  useRolePermissionsQuery,
  useAssignPermissionMutation,
  useUnassignPermissionMutation,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";

interface AssignPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  roleId: string;
  roleName?: string;
}

const getPermissionResource = (permissionName: string): string => {
  const parts = permissionName.split("_");
  if (parts.length < 2) return permissionName;
  return parts.slice(1).join("_");
};

const capitalizeFirst = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const AssignPermissionsModal = ({
  isOpen,
  onClose,
  companyId,
  roleId,
  roleName,
}: AssignPermissionsModalProps) => {
  const { data: allPermissions, isLoading: loadingAll } = useAllPermissionsQuery();
  const { data: assignedPermissions, isLoading: loadingAssigned } =
    useRolePermissionsQuery(companyId, roleId);

  const assignMutation = useAssignPermissionMutation();
  const unassignMutation = useUnassignPermissionMutation();

  const [localAssigned, setLocalAssigned] = useState<Set<string>>(new Set());

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
        assignMutation.mutateAsync({ roleId, permissionId, companyId, _companyId: companyId }),
      ),
      ...toRemove.map((permissionId) =>
        unassignMutation.mutateAsync({ roleId, permissionId, companyId }),
      ),
    ];

    await Promise.allSettled(allOps);
    onClose();
  };

  const groupedPermissions: Record<string, typeof allPermissions> = {};
  if (allPermissions) {
    for (const perm of allPermissions) {
      const resource = getPermissionResource(perm.name);
      groupedPermissions[resource] ??= [];
      groupedPermissions[resource].push(perm);
    }
  }

  const sortedGroups = Object.keys(groupedPermissions).sort((a, b) => a.localeCompare(b));
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
            className="w-5 h-5 border-2 border-dark/20 border-t-dark/60 rounded-full animate-spin"
            aria-label="Cargando permisos"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-[12px] font-sans-medium text-dark/55">
            <span className="font-sans-bold text-dark">{selectedCount}</span> de {totalCount}{" "}
            permisos seleccionados
          </p>

          <div className="flex flex-col gap-5 max-h-[50vh] overflow-y-auto pr-1">
            {sortedGroups.map((group) => {
              const perms = groupedPermissions[group] ?? [];
              return (
                <div key={group} className="flex flex-col gap-2">
                  <p className="text-[11px] font-sans-bold text-dark/70 uppercase tracking-wide">
                    {capitalizeFirst(group)}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {perms.map((perm) => {
                      const isChecked = localAssigned.has(perm.id);
                      return (
                        <label
                          key={perm.id}
                          className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-[var(--color-secondary)] border-dark/20"
                              : "bg-[var(--color-surface-card)] border-[var(--color-border-main)] hover:bg-[var(--color-secondary)]"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => togglePermission(perm.id)}
                            className="mt-0.5 w-4 h-4 rounded accent-dark shrink-0"
                            aria-label={perm.name}
                          />
                          <div className="min-w-0">
                            <p className="font-sans-semibold text-dark text-[13px] break-all leading-snug">
                              {perm.name}
                            </p>
                            {perm.description && (
                              <p className="text-[12px] font-sans-normal text-dark/50 mt-0.5">
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

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
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
