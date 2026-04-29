import { useState } from "react";
import { Pencil, X, Check } from "lucide-react";
import { useUpdateOrganizationMutation } from "@ticket-registrator/shared";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface OverviewTabProps {
  org: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-[11px] font-sans-semibold text-dark/45 uppercase tracking-wide">
      {label}
    </p>
    {children}
  </div>
);

export const OverviewTab = ({ org }: OverviewTabProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(org.name);

  const updateMutation = useUpdateOrganizationMutation({
    onSuccess: () => setIsEditing(false),
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      updateMutation.mutate({ id: org.id, data: { name } });
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setName(org.name);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
      <Field label="Nombre">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Input
                label=""
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la organización"
                required
                autoFocus
              />
            </div>
            <Button
              type="submit"
              size="sm"
              isLoading={updateMutation.isPending}
              disabled={name.trim().length < 2}
              leftIcon={<Check className="w-3.5 h-3.5" />}
            >
              Guardar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={cancelEdit}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <p className="font-sans-semibold text-dark text-[14px]">{org.name}</p>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="text-dark/30 hover:text-dark transition-colors p-1"
              title="Editar nombre"
            >
              <Pencil className="w-3.5 h-3.5" aria-hidden={true} />
            </button>
          </div>
        )}
      </Field>

      <Field label="ID">
        <code className="font-mono text-[12px] text-dark/55 break-all">{org.id}</code>
      </Field>

      <Field label="Creada">
        <p className="font-sans-medium text-dark text-[13px]">
          {format(new Date(org.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
        </p>
      </Field>

      <Field label="Actualizada">
        <p className="font-sans-medium text-dark text-[13px]">
          {format(new Date(org.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
        </p>
      </Field>
    </div>
  );
};
