/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { NativeSelect } from "@microbit/ui";
import { ReactNode, useCallback } from "react";
import { IntlShape } from "react-intl";
import { styled } from "styled-system/jsx";

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
    <styled.div display="flex" alignItems="center" width="100%">
      <styled.label
        htmlFor={id}
        fontSize="md"
        fontWeight="normal"
        marginEnd="3"
        flex="1 1 auto"
      >
        {label}
      </styled.label>
      <NativeSelect
        id={id}
        onChange={handleChange}
        css={{ width: "28ch" }}
        value={value}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
    </styled.div>
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
