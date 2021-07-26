/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Checkbox,
  FormControl,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { ReactNode, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import { CodeStructureSettings } from "../editor/codemirror/structure-highlighting";
import {
  maximumFontSize,
  minimumFontSize,
  Settings,
  useSettings,
} from "./settings";

const modifyCodeStructureSettings = (
  settings: Settings,
  update: Partial<CodeStructureSettings>
): Settings => {
  return {
    ...settings,
    codeStructureHighlighting: {
      ...settings.codeStructureHighlighting,
      ...update,
    },
  };
};

/**
 * The settings area.
 *
 * Aim is to keep settings to a minimum.
 */
const SettingsArea = () => {
  const [settings, setSettings] = useSettings();

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
    <VStack alignItems="flex-start" spacing={3}>
      <VStack alignItems="flex-start" padding={3} spacing={5}>
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
      </VStack>
      <VStack alignItems="flex-start" padding={3} spacing={5}>
        <Text as="h2" fontWeight="semibold">
          Code structure highlighting (experimental)
        </Text>
        <SelectFormControl
          id="codeStructureShape"
          label="Shape"
          options={[
            {
              value: "l-shape",
              label: "L-shapes",
            },
            {
              value: "box",
              label: "Boxes",
            },
          ]}
          value={settings.codeStructureHighlighting.shape}
          onChange={(shape) =>
            setSettings(modifyCodeStructureSettings(settings, { shape }))
          }
        />
        <SelectFormControl
          id="codeStructureBackground"
          label="Background"
          options={[
            {
              value: "none",
              label: "None",
            },
            {
              value: "block",
              label: "Block colour",
            },
          ]}
          value={settings.codeStructureHighlighting.background}
          onChange={(background) =>
            setSettings(modifyCodeStructureSettings(settings, { background }))
          }
        />
        <SelectFormControl
          id="codeStructureBorder"
          label="Borders"
          options={[
            {
              value: "none",
              label: "None",
            },
            {
              value: "borders",
              label: "Borders",
            },
            {
              value: "left-edge-only",
              label: "Left edge only",
            },
          ]}
          value={settings.codeStructureHighlighting.borders}
          onChange={(borders) =>
            setSettings(modifyCodeStructureSettings(settings, { borders }))
          }
        />
        <BooleanFormControl
          id="codeStructureHoverBackground"
          label="Highlight background on mouse over"
          value={settings.codeStructureHighlighting.hoverBackground || false}
          onChange={(hoverBackground) =>
            setSettings(
              modifyCodeStructureSettings(settings, { hoverBackground })
            )
          }
        />
        <BooleanFormControl
          id="codeStructureCursorBackground"
          label="Highlight background for cursor position"
          value={settings.codeStructureHighlighting.cursorBackground || false}
          onChange={(cursorBackground) =>
            setSettings(
              modifyCodeStructureSettings(settings, { cursorBackground })
            )
          }
        />

        <BooleanFormControl
          id="codeStructureCursorBorder"
          label="Highlight border for cursor position"
          value={settings.codeStructureHighlighting.cursorBorder || false}
          onChange={(cursorBorder) =>
            setSettings(modifyCodeStructureSettings(settings, { cursorBorder }))
          }
        />

        <BooleanFormControl
          id="codeStructureHoverBorder"
          label="Highlight border on mouse over"
          value={settings.codeStructureHighlighting.hoverBorder || false}
          onChange={(hoverBorder) =>
            setSettings(modifyCodeStructureSettings(settings, { hoverBorder }))
          }
        />
      </VStack>
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

interface BooleanFormControlProps {
  id: string;
  label: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
}

const BooleanFormControl = ({
  id,
  label,
  value,
  onChange,
}: BooleanFormControlProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.currentTarget!.checked);
    },
    [onChange]
  );
  return (
    <FormControl display="flex" alignItems="center" width="100%">
      <Checkbox id={id} onChange={handleChange} isChecked={value} value={id}>
        {label}
      </Checkbox>
    </FormControl>
  );
};

export default SettingsArea;
