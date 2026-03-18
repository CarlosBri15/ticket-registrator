import { useState } from "react";
import { useCreateUserMutation } from "@ticket-registrator/shared";
import { Button } from "../Button";
import { Input } from "../Input";
import { Modal } from "../Modal";
import { AlertError, getApiErrorMessage } from "../Alert";
import { RoleSelect } from "../selects";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const CreateUserModal = ({
  isOpen,
  onClose,
  companyId,
}: CreateUserModalProps) => {
  const mutation = useCreateUserMutation({ onSuccess: onClose });

  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    roleId: "",
  });

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const passwordsFilledAndMismatch =
    form.password.length > 0 &&
    form.confirmPassword.length > 0 &&
    form.password !== form.confirmPassword;

  const isValid =
    form.name.trim().length >= 2 &&
    form.surname.trim().length >= 2 &&
    form.email.includes("@") &&
    form.username.trim().length >= 3 &&
    form.password.length >= 6 &&
    form.password === form.confirmPassword &&
    !!form.roleId;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!isValid) return;
    mutation.mutate({
      name: form.name,
      surname: form.surname,
      email: form.email,
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      roleId: form.roleId,
      companyId,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Usuario"
      subtitle="Crear usuario para esta organización"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mutation.error && (
          <AlertError message={getApiErrorMessage(mutation.error)} />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nombre *"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Carlos"
            required
          />
          <Input
            label="Apellido *"
            value={form.surname}
            onChange={(e) => set("surname", e.target.value)}
            placeholder="García"
            required
          />
        </div>

        <Input
          label="Email *"
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="carlos@empresa.com"
          required
        />

        <Input
          label="Username *"
          value={form.username}
          onChange={(e) => set("username", e.target.value)}
          placeholder="cgarcia"
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Contraseña *"
            type="password"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            placeholder="••••••"
            required
          />
          <Input
            label="Confirmar contraseña *"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => set("confirmPassword", e.target.value)}
            placeholder="••••••"
            required
          />
        </div>

        {passwordsFilledAndMismatch && (
          <p className="text-xs text-red-500">Las contraseñas no coinciden.</p>
        )}

        <RoleSelect
          companyId={companyId}
          label="Rol"
          required
          value={form.roleId}
          onChange={(v) => set("roleId", v)}
          placeholder="Seleccionar rol…"
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
            Crear Usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
};
