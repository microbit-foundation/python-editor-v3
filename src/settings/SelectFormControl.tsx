/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";
import { IntlShape } from "react-intl";

export interface SelectOptionValue<T> {
  value: T;
  label: ReactNode;
}

interface SelectFormControlProps<T> {
  id: string;
  options: SelectOptionValue<T>[];
  label: ReactNode;
  value: T;
  onChange: (value: T) => void;
}

const SelectFormControl = <T extends string>({
  id,
  options,
  label,
  value,
  onChange,
}: SelectFormControlProps<T>) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) =>
      onChange(e.currentTarget!.value as T),
    [onChange]
  );

  return (
    <FormControl display="flex" alignItems="center">
      <FormLabel htmlFor={id} mb="0" fontWeight="normal" flex="1 1 auto">
        {label}
      </FormLabel>
      <Select
        id={id}
        variant="outline"
        onChange={handleChange}
        width="28ch"
        value={value}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
    </FormControl>
  );
};

/**
 * Helper for translated option labels.
 *
 * @param values Values to create options for.
 * @param prefix Prefix (no trailing '-') to use for translation keys.
 * @param intl For translation strings.
 * @returns Options for the given values.
 */
export const createOptions = <T,>(
  values: T[],
  prefix: string,
  intl: IntlShape,
  intlValues?: Record<string, any>
): SelectOptionValue<T>[] => {
  return values.map((value) => ({
    value,
    label: intl.formatMessage({ id: `${prefix}-${value}` }, intlValues),
  }));
};

export default SelectFormControl;
