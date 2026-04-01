import { Select, type SelectProps } from '../ui/Select';

const CURRENCY_OPTIONS = [
  { value: 'EUR', label: '€ Euro' },
  { value: 'USD', label: '$ Dólar' },
  { value: 'GBP', label: '£ Libra' },
  { value: 'CHF', label: 'Fr Franco suizo' },
  { value: 'JPY', label: '¥ Yen' },
  { value: 'MXN', label: '$ Peso mexicano' },
  { value: 'COP', label: '$ Peso colombiano' },
];

type CurrencySelectProps = Omit<SelectProps, 'options'>;

export function CurrencySelect(props: Readonly<CurrencySelectProps>) {
  return (
    <Select
      options={CURRENCY_OPTIONS}
      label={props.label ?? 'Moneda'}
      placeholder="Selecciona una moneda"
      {...props}
    />
  );
}
