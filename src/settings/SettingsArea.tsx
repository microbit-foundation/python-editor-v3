/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  VStack,
} from "@chakra-ui/react";
import React, { ReactNode, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { maximumFontSize, minimumFontSize, useSettings } from "./settings";

/**
 * The settings area.
 *
 * Aim is to keep settings to a minimum.
 */
const SettingsArea = () => {
  const [settings, setSettings] = useSettings();
  const intl = useIntl();

  const handleChangeFontSize = useCallback(
    (_: string, valueAsNumber: number) => {
      if (Number.isNaN(valueAsNumber)) {
        return;
      }

      setSettings({
        ...settings,
        fontSize: Math.min(
          maximumFontSize,
          Math.max(minimumFontSize, valueAsNumber),
          valueAsNumber
        ),
      });
    },
    [settings, setSettings]
  );

  return (
    <VStack alignItems="flex-start" spacing={5}>
      <FormControl display="flex" alignItems="center">
        <FormLabel
          htmlFor="font-size"
          mb="0"
          fontWeight="normal"
          flex="1 1 auto"
        >
          <FormattedMessage id="font-size" />
        </FormLabel>
        <NumberInput
          id="font-size"
          size="sm"
          value={settings.fontSize}
          min={minimumFontSize}
          max={maximumFontSize}
          onChange={handleChangeFontSize}
          width="12ch"
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <SelectFormControl
        id="codeStructureHighlight"
        label={intl.formatMessage({ id: "highlight-code-structure" })}
        options={[
          {
            value: "none",
            label: intl.formatMessage({ id: "highlight-code-structure-none" }),
          },
          {
            value: "full",
            label: intl.formatMessage({ id: "highlight-code-structure-full" }),
          },
          {
            value: "simple",
            label: intl.formatMessage({
              id: "highlight-code-structure-simple",
            }),
          },
        ]}
        value={settings.codeStructureHighlight}
        onChange={(codeStructureHighlight) =>
          setSettings({
            ...settings,
            codeStructureHighlight,
          })
        }
      />
    </VStack>
  );
};

interface SelectFormControlProps<T> {
  id: string;
  options: { value: T; label: ReactNode }[];
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
        width="20ch"
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

export default SettingsArea;
