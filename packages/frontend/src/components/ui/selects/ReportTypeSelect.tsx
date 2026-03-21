import { useTranslation } from 'react-i18next';
import { Select } from '../Select';
import type { SelectProps } from '../Select';

const REPORT_TYPE_KEYS = [
  'trips.typeBusinessTrip',
  'trips.typeTraining',
  'trips.typeConference',
  'trips.typeClient',
  'trips.typeProject',
  'trips.typeOther',
] as const;

type ReportTypeSelectProps = Omit<SelectProps, 'options'>;

/**
 * Report-type (category) selector — translates the static list of report types
 * and renders them as Select options.
 */
export const ReportTypeSelect = ({
  label = 'Categoría',
  placeholder = 'Selecciona una categoría',
  ...rest
}: ReportTypeSelectProps) => {
  const { t } = useTranslation();

  const options = REPORT_TYPE_KEYS.map((key) => ({
    value: t(key),
    label: t(key),
  }));

  return (
    <Select
      label={label}
      placeholder={placeholder}
      options={options}
      {...rest}
    />
  );
};
