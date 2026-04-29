import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useRolesQuery,
  useCreateRoleMutation,
} from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Modal } from "../../../components/ui/Modal";
import { AlertError, getApiErrorMessage } from "../../../components/ui/Alert";

// ─── Hierarchy helpers ────────────────────────────────────────────────────────

// System role names are universal; only "Empleado" uses a translation key.
const HIERARCHY_LEVELS = [
  { min: 100, labelKey: "SuperAdmin",          color: "bg-purple-50 text-purple-700" },
  { min: 99,  labelKey: "Admin",               color: "bg-blue-50 text-blue-700" },
  { min: 50,  labelKey: "Manager",             color: "bg-amber-50 text-amber-700" },
  { min: 40,  labelKey: "Controller",          color: "bg-emerald-50 text-emerald-700" },
  { min: 1,   labelKey: "roles.levelEmployee", color: "bg-[var(--color-secondary)] text-dark/70" },
] as const;

export const getHierarchyMeta = (h: number) =>
  HIERARCHY_LEVELS.find((l) => h >= l.min) ?? HIERARCHY_LEVELS[4];

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
  const { t } = useTranslation();
  const { data: existingRoles } = useRolesQuery(companyId);

  const mutation = useCreateRoleMutation(companyId, {
    onSuccess: (data: { id: string }) => {
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

  // Resolve i18n label: system names stay as-is; "roles.*" keys are translated.
  const resolveLabel = (labelKey: string) =>
    labelKey.startsWith("roles.") ? t(labelKey as "roles.levelEmployee") : labelKey;

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
      title={t("roles.newRole")}
      subtitle={t("roles.createRoleSubtitle")}
      size="xl"
    >
      <div className="flex flex-col gap-5">
        {mutation.error && <AlertError message={getApiErrorMessage(mutation.error)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Left: Existing roles reference ── */}
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-sans-bold text-dark/70 uppercase tracking-wide">
              {t("roles.currentHierarchies")}
            </p>
            {sortedRoles.length === 0 ? (
              <p className="text-[13px] font-sans-normal text-dark/45 italic">
                {t("roles.empty")}
              </p>
            ) : (
              <div className="rounded-md border border-[var(--color-border-main)] bg-[var(--color-surface-card)] overflow-hidden">
                {sortedRoles.map((role) => {
                  const meta = getHierarchyMeta(role.hierarchy);
                  return (
                    <div
                      key={role.id}
                      className="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--color-border-main)] last:border-b-0"
                    >
                      <span className="text-[13px] font-sans-medium text-dark truncate">
                        {role.name}
                      </span>
                      <span
                        className={`text-[10px] font-sans-bold px-1.5 py-0.5 rounded shrink-0 ${meta.color}`}
                      >
                        {resolveLabel(meta.labelKey)} · {role.hierarchy}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[12px] font-sans-normal text-dark/45 leading-relaxed">
              {t("roles.hierarchyHint")}
            </p>
          </div>

          {/* ── Right: Form ── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label={`${t("roles.nameLabel")} *`}
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              placeholder={t("roles.namePlaceholder")}
              required
              autoFocus
            />

            <div className="flex flex-col gap-1">
              <Input
                label={`${t("roles.hierarchyLabel")} *`}
                type="number"
                min={1}
                max={99}
                step={1}
                value={hierarchyStr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setHierarchyStr(e.target.value)
                }
                required
              />
              {hierarchyMeta && (
                <p className="text-[11px] font-sans-medium text-dark/55 ml-1">
                  → {resolveLabel(hierarchyMeta.labelKey)}
                </p>
              )}
            </div>

            <Input
              label={t("common.description")}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
              placeholder={t("roles.descriptionPlaceholder")}
            />

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                isLoading={mutation.isPending}
                disabled={!isValid}
                className="flex-1"
              >
                {t("roles.createRole")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
