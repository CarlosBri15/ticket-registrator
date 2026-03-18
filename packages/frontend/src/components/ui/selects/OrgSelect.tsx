import { useOrganizationsQuery } from '@ticket-registrator/shared';
import { Select } from '../Select';
import type { SelectProps } from '../Select';

type OrgSelectProps = Omit<SelectProps, 'options' | 'isLoading'>;

/**
 * Organization selector — fetches all organizations (SuperAdmin only).
 */
export const OrgSelect = ({
  label = 'Organización',
  placeholder = 'Selecciona una organización',
  ...rest
}: OrgSelectProps) => {
  const { data: orgs, isLoading } = useOrganizationsQuery();

  const options = (orgs ?? []).map((o) => ({ value: o.id, label: o.name }));

  return (
    <Select
      label={label}
      placeholder={placeholder}
      options={options}
      isLoading={isLoading}
      {...rest}
    />
  );
};
