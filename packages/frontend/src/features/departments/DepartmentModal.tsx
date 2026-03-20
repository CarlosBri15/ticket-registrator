import { useState } from "react";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  type IDepartment,
} from "@ticket-registrator/shared";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";

export const DepartmentModal = ({
  isOpen,
  onClose,
  companyId,
  department,
}: {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  department?: IDepartment;
}) => {
  const [name, setName] = useState(department?.name ?? "");

  const createMutation = useCreateDepartmentMutation(companyId, { onSuccess: onClose });
  const updateMutation = useUpdateDepartmentMutation(companyId, { onSuccess: onClose });

  const isEditing = !!department;

  const handleSubmit = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEditing) {
      updateMutation.mutate({ id: department.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Departamento" : "Nuevo Departamento"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre del departamento *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Recursos Humanos"
          autoFocus
          required
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" isLoading={isPending} disabled={!name.trim()} className="flex-1">
            {isEditing ? "Guardar cambios" : "Crear Departamento"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
