import { useState, useCallback } from "react";
import {
  useUpdateUserMutation,
  type IUser,
} from "@ticket-registrator/shared";
import { Input } from "../../../components/ui/Input";
import { FormModal } from "../../../components/ui/FormModal";
import { RoleSelect } from "../../roles/components/RoleSelect";
import { DepartmentMultiSelect } from "../../departments/components/DepartmentMultiSelect";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  companyId: string | null;
}

export const EditUserModal = ({ isOpen, onClose, user, companyId }: EditUserModalProps) => {
  const mutation = useUpdateUserMutation({ onSuccess: onClose });

  const [form, setForm] = useState({
    name: user.name,
    surname: user.surname,
    email: user.email,
    username: user.username,
    roleId: user.roleId,
    departmentIds: user.departmentIds ?? [],
  });

  const reset = () => mutation.reset();

  const set = useCallback(
    (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      reset();
      setForm((p) => ({ ...p, [k]: e.target.value }));
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      id: user.id,
      data: {
        name: form.name,
        surname: form.surname,
        email: form.email,
        username: form.username,
        roleId: form.roleId,
        departmentIds: form.departmentIds,
      },
    });
  };

  const isValid =
    !!form.name && !!form.surname && !!form.email && !!form.username && !!form.roleId;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Usuario"
      onSubmit={handleSubmit}
      submitLabel="Guardar cambios"
      cancelLabel="Cancelar"
      isPending={mutation.isPending}
      isValid={isValid}
      error={mutation.error}
      onErrorDismiss={() => mutation.reset()}
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nombre *" value={form.name} onChange={set("name")} placeholder="Carlos" required />
        <Input label="Apellido *" value={form.surname} onChange={set("surname")} placeholder="García" required />
      </div>
      <Input label="Email *" type="email" value={form.email} onChange={set("email")} placeholder="carlos@empresa.com" required />
      <Input label="Usuario *" value={form.username} onChange={set("username")} placeholder="cgarcia" required />

      <RoleSelect
        id="edit-user-role"
        companyId={companyId}
        value={form.roleId}
        onChange={(v: string) => {
          reset();
          setForm((p) => ({ ...p, roleId: v }));
        }}
        required
      />

      {companyId !== null && (
        <DepartmentMultiSelect
          id="edit-user-departments"
          companyId={companyId}
          value={form.departmentIds}
          onChange={(ids: string[]) => {
            reset();
            setForm((p) => ({ ...p, departmentIds: ids }));
          }}
        />
      )}
    </FormModal>
  );
};
