import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateUserMutation,
  AUTHORITY_LEVELS,
  type IRole,
} from "@ticket-registrator/shared";
import { Input } from "../../../components/ui/Input";
import { FormModal } from "../../../components/ui/FormModal";
import { AlertError } from "../../../components/ui/Alert";
import { RoleSelect } from "../../roles/components/RoleSelect";
import { OrgSelect } from "../../organizations/components/OrgSelect";
import { DepartmentMultiSelect } from "../../departments/components/DepartmentMultiSelect";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null when the creator is a SuperAdmin (must pick an org). */
  companyId: string | null;
}

export const CreateUserModal = ({ isOpen, onClose, companyId }: CreateUserModalProps) => {
  const { t } = useTranslation();
  const mutation = useCreateUserMutation({ onSuccess: onClose });

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: "",
    orgId: "",
    selectedRole: null as IRole | null,
    departmentIds: [] as string[],
  });

  // Creator is SuperAdmin when companyId is null — they must pick an org
  const isCreatorSuperAdmin = companyId === null;

  // Is the role being assigned a SuperAdmin role? → no org needed
  const isTargetSuperAdmin =
    form.selectedRole !== null &&
    form.selectedRole.hierarchy >= AUTHORITY_LEVELS.GLOBAL;

  // Which companyId to use for the RoleSelect
  const effectiveCompanyId = isCreatorSuperAdmin ? (form.orgId || null) : companyId;

  const reset = () => mutation.reset();

  const set = useCallback(
    (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      reset();
      setForm((p) => ({ ...p, [k]: e.target.value }));
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const passwordMismatch = Boolean(
    form.password && form.confirmPassword && form.password !== form.confirmPassword,
  );

  const orgMissing = isCreatorSuperAdmin && !!form.roleId && !isTargetSuperAdmin && !form.orgId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordMismatch || orgMissing) return;

    const payload = {
      name: form.name,
      surname: form.surname,
      email: form.email,
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      roleId: form.roleId,
      departmentIds: form.departmentIds,
      ...(isCreatorSuperAdmin && form.orgId ? { companyId: form.orgId } : {}),
    };

    mutation.mutate(payload);
  };

  const isValid =
    !!form.name && !!form.email && !!form.roleId && !passwordMismatch && !orgMissing;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("users.newUser")}
      subtitle={t("users.createUserSubtitle")}
      onSubmit={handleSubmit}
      submitLabel={t("users.createUserBtn")}
      isPending={mutation.isPending}
      isValid={isValid}
      error={mutation.error}
      onErrorDismiss={() => mutation.reset()}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label={`${t("users.fieldName")} *`} value={form.name} onChange={set("name")}
          placeholder="Carlos" required />
        <Input label={`${t("users.fieldSurname")} *`} value={form.surname} onChange={set("surname")}
          placeholder="García" required />
      </div>

      <Input label={`${t("users.fieldEmail")} *`} type="email" value={form.email}
        onChange={set("email")} placeholder="carlos@empresa.com" required />

      <Input label={`${t("users.fieldUsername")} *`} value={form.username}
        onChange={set("username")} placeholder="cgarcia" required />

      <div className="grid grid-cols-2 gap-4">
        <Input label={`${t("users.fieldPassword")} *`} type="password" value={form.password}
          onChange={set("password")} placeholder="••••••••" required />
        <Input label={`${t("users.fieldConfirmPassword")} *`} type="password"
          value={form.confirmPassword} onChange={set("confirmPassword")} placeholder="••••••••" required />
      </div>

      <RoleSelect
        id="user-role"
        companyId={effectiveCompanyId}
        value={form.roleId}
        onChange={(v: string, role: IRole | undefined) => {
          reset();
          setForm((p) => ({
            ...p,
            roleId: v,
            selectedRole: role ?? null,
            orgId: role && role.hierarchy >= AUTHORITY_LEVELS.GLOBAL ? "" : p.orgId,
          }));
        }}
        required
      />

      {/* Org selector — appears after role is chosen, only when role is not SuperAdmin */}
      {isCreatorSuperAdmin && form.roleId && !isTargetSuperAdmin && (
        <OrgSelect
          id="user-org"
          value={form.orgId}
          onChange={(v: string) => { reset(); setForm((p) => ({ ...p, orgId: v })); }}
          required
        />
      )}

      {/* Department multiselect — shown when role is not SuperAdmin and companyId is available */}
      {!isTargetSuperAdmin && (isCreatorSuperAdmin ? form.orgId : companyId) && (
        <DepartmentMultiSelect
          id="user-departments"
          companyId={isCreatorSuperAdmin ? form.orgId : companyId}
          value={form.departmentIds}
          onChange={(ids: string[]) => setForm((p) => ({ ...p, departmentIds: ids }))}
        />
      )}

      {passwordMismatch && (
        <AlertError message={t("users.passwordMismatch")} />
      )}
    </FormModal>
  );
};
