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
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import SelectFormControl, { createOptions } from "./SelectFormControl";
import {
  codeStructureOptions,
  maximumFontSize,
  minimumFontSize,
  signatureHelpOptions,
  useSettings,
} from "./settings";

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
  const options = useMemo(() => {
    const isMac = /Mac/.test(navigator.platform);
    return {
      codeStructure: createOptions(
        codeStructureOptions,
        "highlight-code-structure",
        intl
      ),
      parameterHints: createOptions(
        signatureHelpOptions,
        "parameter-hints",
        intl,
        {
          shortcut: (isMac ? "Cmd" : "Ctrl") + "-Shift+Space",
        }
      ),
    };
  }, [intl]);
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
        options={options.codeStructure}
        value={settings.codeStructureHighlight}
        onChange={(codeStructureHighlight) =>
          setSettings({
            ...settings,
            codeStructureHighlight,
          })
        }
      />
      <SelectFormControl
        id="signatureHelp"
        label={intl.formatMessage({ id: "parameter-hints" })}
        options={options.parameterHints}
        value={settings.signatureHelp}
        onChange={(signatureHelp) =>
          setSettings({
            ...settings,
            signatureHelp,
          })
        }
      />
    </VStack>
  );
};

export default SettingsArea;
