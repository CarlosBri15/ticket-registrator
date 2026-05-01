import { useState } from "react";
import { Plus } from "lucide-react";
import { useOnboardOrganizationMutation } from "@ticket-registrator/shared";
import { Input } from "../../../components/ui/Input";
import { FormModal } from "../../../components/ui/FormModal";

interface AdminEntry {
  id: string;
  name: string;
  surname: string;
  email: string;
}

interface OnboardOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MAX_ADMINS = 3;

const newAdminEntry = (): AdminEntry => ({
  id: crypto.randomUUID(),
  name: "",
  surname: "",
  email: "",
});

export const OnboardOrganizationModal = ({ isOpen, onClose }: OnboardOrganizationModalProps) => {
  const mutation = useOnboardOrganizationMutation({ onSuccess: onClose });
  const [companyName, setCompanyName] = useState("");
  const [admins, setAdmins] = useState<AdminEntry[]>([newAdminEntry()]);

  const updateAdmin = (id: string, field: keyof Omit<AdminEntry, "id">, value: string) =>
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)));

  const addAdmin = () => setAdmins((prev) => [...prev, newAdminEntry()]);

  const removeAdmin = (id: string) =>
    setAdmins((prev) => prev.filter((a) => a.id !== id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      company: { name: companyName },
      admins: admins.map(({ name, surname, email }) => ({ name, surname, email })),
    });
  };

  const isValid =
    companyName.trim().length >= 2 &&
    admins.every((a) => a.name.trim() && a.surname.trim() && a.email.trim());

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Organización"
      subtitle="Onboarding de empresa"
      onSubmit={handleSubmit}
      submitLabel="Crear Organización"
      isPending={mutation.isPending}
      isValid={isValid}
      error={mutation.error}
      onErrorDismiss={() => mutation.reset()}
    >
      <Input
        label="Nombre de la empresa *"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="Acme Corporation"
        required
      />

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-sans-semibold text-dark/50 uppercase tracking-wide">
            Administradores iniciales *
          </span>
          {admins.length < MAX_ADMINS && (
            <button
              type="button"
              onClick={addAdmin}
              className="text-[12px] font-sans-medium text-dark/60 hover:text-dark flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Añadir
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {admins.map((admin, i) => (
            <div
              key={admin.id}
              className="rounded-lg border border-[var(--color-border-main)] bg-[var(--color-secondary)] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-sans-semibold text-dark/55 uppercase tracking-wide">
                  Admin {i + 1}
                </p>
                {admins.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAdmin(admin.id)}
                    className="text-[12px] font-sans-medium text-danger hover:opacity-80"
                  >
                    Quitar
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Nombre *"
                  value={admin.name}
                  onChange={(e) => updateAdmin(admin.id, "name", e.target.value)}
                  placeholder="Carlos"
                  required
                />
                <Input
                  label="Apellido *"
                  value={admin.surname}
                  onChange={(e) => updateAdmin(admin.id, "surname", e.target.value)}
                  placeholder="García"
                  required
                />
              </div>
              <Input
                label="Email *"
                type="email"
                value={admin.email}
                onChange={(e) => updateAdmin(admin.id, "email", e.target.value)}
                placeholder="carlos@acme.com"
                required
              />
            </div>
          ))}
        </div>

        <p className="text-[12px] font-sans-normal text-dark/45">
          Se generarán contraseñas temporales para cada administrador.
        </p>
      </div>
    </FormModal>
  );
};
