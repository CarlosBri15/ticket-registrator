import { useState } from "react";
import { Pencil } from "lucide-react";
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Nombre</p>
          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
              <Input
                label="Nombre de la organización"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre de la organización"
                required
                autoFocus
              />
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                disabled={name.trim().length < 2}
                className="shrink-0"
              >
                Guardar
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEdit} className="shrink-0">
                Cancelar
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <p className="font-bold text-dark">{org.name}</p>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-300 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                title="Editar nombre"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">ID</p>
          <p className="font-mono text-xs text-gray-500 break-all">{org.id}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Creada</p>
          <p className="font-bold text-dark">
            {format(new Date(org.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Actualizada</p>
          <p className="font-bold text-dark">
            {format(new Date(org.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
      </div>
    </div>
  );
};
