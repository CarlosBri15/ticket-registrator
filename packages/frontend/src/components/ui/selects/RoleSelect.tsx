import { useRolesQuery, useSystemRolesQuery, type IRole } from '@ticket-registrator/shared';
import { Select } from '../Select';
import type { SelectProps } from '../Select';

type RoleSelectProps = Omit<SelectProps, 'options' | 'isLoading' | 'onChange'> & {
  companyId?: string | null;
  /** Receives the selected id AND the full IRole object for hierarchy checks. */
  onChange?: (value: string, role?: IRole) => void;
};

/**
 * Role selector that automatically fetches company roles when companyId is
 * provided, or falls back to system roles when it is null/undefined.
 * onChange also receives the full IRole so callers can inspect hierarchy.
 */
export const RoleSelect = ({
  companyId,
  label = 'Rol',
  placeholder = 'Selecciona un rol',
  onChange,
  ...rest
}: RoleSelectProps) => {
  const { data: companyRoles, isLoading: loadingCompany } = useRolesQuery(companyId ?? undefined);
  const { data: systemRoles, isLoading: loadingSystem } = useSystemRolesQuery();

  const roles = companyId ? companyRoles : systemRoles;
  const isLoading = companyId ? loadingCompany : loadingSystem;

  const options = (roles ?? []).map((r) => ({ value: r.id, label: r.name }));

  const handleChange = (value: string) => {
    const role = roles?.find((r) => r.id === value);
    onChange?.(value, role);
  };

  return (
    <Select
      label={label}
      placeholder={placeholder}
      options={options}
      isLoading={isLoading}
      onChange={handleChange}
      {...rest}
    />
  );
};
