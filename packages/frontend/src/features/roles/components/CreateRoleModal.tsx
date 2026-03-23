import { useState } from "react";
import {
  useRolesQuery,
  useCreateRoleMutation,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { AlertError, getApiErrorMessage } from "../../../components/ui/Alert";

// ─── Hierarchy helpers ────────────────────────────────────────────────────────

const HIERARCHY_LABELS = [
  { min: 100, label: "SuperAdmin", color: "bg-purple-100 text-purple-700" },
  { min: 99, label: "Admin", color: "bg-brand/10 text-brand" },
  { min: 50, label: "Manager", color: "bg-amber-100 text-amber-700" },
  { min: 40, label: "Controller", color: "bg-blue-100 text-blue-700" },
  { min: 1, label: "Empleado", color: "bg-gray-100 text-gray-600" },
];

export const getHierarchyMeta = (h: number) =>
  HIERARCHY_LABELS.find((l) => h >= l.min) ?? HIERARCHY_LABELS[4];

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  /** Called with the new role's id after successful creation */
  onRoleCreated?: (roleId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CreateRoleModal = ({
  isOpen,
  onClose,
  companyId,
  onRoleCreated,
}: CreateRoleModalProps) => {
  const { data: existingRoles } = useRolesQuery(companyId);

  const mutation = useCreateRoleMutation(companyId, {
    onSuccess: (data: any) => {
      onRoleCreated?.(data.id);
      onClose();
    },
  });

  const [name, setName] = useState("");
  const [hierarchyStr, setHierarchyStr] = useState("10");
  const [description, setDescription] = useState("");

  const hierarchyNum = Number.parseInt(hierarchyStr, 10);
  const hierarchyValid =
    !Number.isNaN(hierarchyNum) && hierarchyNum >= 1 && hierarchyNum <= 99;
  const hierarchyMeta = hierarchyValid ? getHierarchyMeta(hierarchyNum) : null;

  const isValid = name.trim().length >= 2 && hierarchyValid;

  const sortedRoles = existingRoles
    ? [...existingRoles].sort((a, b) => b.hierarchy - a.hierarchy)
    : [];

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isValid) return;
    mutation.mutate({
      name: name.trim(),
      hierarchy: hierarchyNum,
      description: description.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Rol"
      subtitle="Crear rol para esta organización"
      size="xl"
    >
      <div className="space-y-4">
        {mutation.error && (
          <AlertError message={getApiErrorMessage(mutation.error)} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left: Existing roles reference ── */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Jerarquías actuales
            </p>
            {sortedRoles.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Sin roles aún</p>
            ) : (
              <div className="space-y-1.5">
                {sortedRoles.map((role) => {
                  const meta = getHierarchyMeta(role.hierarchy);
                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between gap-2 py-1.5 px-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-dark truncate">
                        {role.name}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${meta.color}`}
                      >
                        {meta.label} ({role.hierarchy})
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              El nuevo rol debe tener jerarquía menor que la tuya.
            </p>
          </div>

          {/* ── Right: Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre del rol *"
              value={name}
              onChange={(e: any) => setName(e.target.value)}
              placeholder="Ej: Supervisor"
              required
              autoFocus
            />

            <div>
              <Input
                label="Jerarquía (1–99) *"
                type="number"
                min={1}
                max={99}
                step={1}
                value={hierarchyStr}
                onChange={(e: any) => setHierarchyStr(e.target.value)}
                required
              />
              {hierarchyMeta && (
                <p className="text-xs text-gray-400 -mt-1 ml-1">
                  → {hierarchyMeta.label}
                </p>
              )}
            </div>

            <Input
              label="Descripción"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              placeholder="Descripción opcional del rol"
            />

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
                type="submit"
                isLoading={mutation.isPending}
                disabled={!isValid}
                className="flex-1"
              >
                Crear Rol
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
