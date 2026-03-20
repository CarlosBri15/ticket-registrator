import { useDepartmentsQuery } from '@ticket-registrator/shared';
import { MultiSelect } from '../MultiSelect';

type Props = {
  companyId?: string | null;
  value?: string[];
  onChange?: (values: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
};

export const DepartmentMultiSelect = ({
  companyId,
  label = 'Departamentos',
  placeholder = 'Selecciona departamentos',
  onChange,
  ...rest
}: Props) => {
  const { data: departments, isLoading } = useDepartmentsQuery(companyId ?? undefined);
  const options = (departments ?? []).map((d) => ({ value: d.id, label: d.name }));
  return (
    <MultiSelect
      label={label}
      placeholder={placeholder}
      options={options}
      isLoading={isLoading}
      onChange={onChange}
      {...rest}
    />
  );
};
