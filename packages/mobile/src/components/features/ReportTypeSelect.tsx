import { useTranslation } from 'react-i18next';
import { Select, type SelectProps } from '../ui/Select';

const TYPE_KEYS = [
  'typeBusinessTrip',
  'typeTraining',
  'typeConference',
  'typeClient',
  'typeProject',
  'typeOther',
] as const;

type ReportTypeSelectProps = Omit<SelectProps, 'options'>;

export function ReportTypeSelect(props: Readonly<ReportTypeSelectProps>) {
  const { t } = useTranslation();

  const options = TYPE_KEYS.map(key => ({
    value: t(`trips.${key}`),
    label: t(`trips.${key}`),
  }));

  return (
    <Select
      options={options}
      label={props.label ?? t('trips.categoryLabel')}
      placeholder={t('trips.categoryPlaceholder')}
      {...props}
    />
  );
}
