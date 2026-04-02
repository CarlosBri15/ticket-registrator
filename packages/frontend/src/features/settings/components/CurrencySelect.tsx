import { Select } from '../../../components/ui/Select';
import type { SelectProps } from '../../../components/ui/Select';

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'JPY', 'MXN', 'COP', 'ARS', 'BRL'];

type CurrencySelectProps = Omit<SelectProps, 'options'>;

/**
 * Currency selector — renders a static list of supported currencies.
 */
export const CurrencySelect = ({
  label = 'Moneda',
  placeholder = 'Selecciona una moneda',
  ...rest
}: CurrencySelectProps) => (
  <Select
    label={label}
    placeholder={placeholder}
    options={CURRENCIES.map((c) => ({ value: c, label: c }))}
    {...rest}
  />
);
