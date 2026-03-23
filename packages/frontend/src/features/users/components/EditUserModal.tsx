import { useState, useCallback } from "react";
import {
  useUpdateUserMutation,
  type IUser,
} from "@ticket-registrator/shared";
import { Modal } from "../../../components/ui/Modal";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { AlertError, getApiErrorMessage } from "../../../components/ui/Alert";
import { RoleSelect } from "../../roles/components/RoleSelect";
import { DepartmentMultiSelect } from "../../departments/components/DepartmentMultiSelect";

export const EditUserModal = ({
  isOpen,
  onClose,
  user,
  companyId,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: IUser;
  companyId: string | null;
}) => {
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

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuario">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.error && (
          <AlertError
            message={getApiErrorMessage(mutation.error)}
            onDismiss={() => mutation.reset()}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            value={form.name}
            onChange={set("name")}
            placeholder="Carlos"
            required
          />
          <Input
            label="Apellido *"
            value={form.surname}
            onChange={set("surname")}
            placeholder="García"
            required
          />
        </div>
        <Input
          label="Email *"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="carlos@empresa.com"
          required
        />
        <Input
          label="Usuario *"
          value={form.username}
          onChange={set("username")}
          placeholder="cgarcia"
          required
        />

        <RoleSelect
          id="edit-user-role"
          companyId={companyId}
          value={form.roleId}
          onChange={(v: any) => {
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
            onChange={(ids: any) => {
              reset();
              setForm((p) => ({ ...p, departmentIds: ids }));
            }}
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            disabled={!form.name || !form.surname || !form.email || !form.username || !form.roleId}
            className="flex-1"
          >
            Guardar cambios
          </Button>
        </div>
      </form>
    </Modal>
  );
};
