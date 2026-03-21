import React, { useState } from "react";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  type IDepartment,
} from "@ticket-registrator/shared";
import { Input } from "../../components/ui/Input";
import { FormModal } from "../../components/ui/FormModal";

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
  const isEditing = !!department;

  const createMutation = useCreateDepartmentMutation(companyId, { onSuccess: onClose });
  const updateMutation = useUpdateDepartmentMutation(companyId, { onSuccess: onClose });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (isEditing) {
      updateMutation.mutate({ id: department.id, data: { name } });
    } else {
      createMutation.mutate({ name });
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Departamento" : "Nuevo Departamento"}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? "Guardar cambios" : "Crear Departamento"}
      isPending={createMutation.isPending || updateMutation.isPending}
      isValid={!!name.trim()}
    >
      <Input
        label="Nombre del departamento *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Ej: Recursos Humanos"
        autoFocus
        required
      />
    </FormModal>
  );
};
