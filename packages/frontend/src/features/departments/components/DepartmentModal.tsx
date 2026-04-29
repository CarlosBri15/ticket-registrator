import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  type IDepartment,
} from "@ticket-registrator/shared";
import { Input } from "../../../components/ui/Input";
import { FormModal } from "../../../components/ui/FormModal";

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
  const { t } = useTranslation();
  const [name, setName] = useState(department?.name ?? "");
  const isEditing = !!department;

  const createMutation = useCreateDepartmentMutation(companyId, { onSuccess: onClose });
  const updateMutation = useUpdateDepartmentMutation(companyId, { onSuccess: onClose });

  const handleSubmit = (e: React.FormEvent) => {
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
      title={isEditing ? t("departments.editDepartment") : t("departments.createDepartment")}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? t("common.saveChanges") : t("departments.createDepartment")}
      isPending={createMutation.isPending || updateMutation.isPending}
      isValid={!!name.trim()}
    >
      <Input
        label={`${t("departments.nameLabel")} *`}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("departments.namePlaceholder")}
        autoFocus
        required
      />
    </FormModal>
  );
};
