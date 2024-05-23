/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import SelectFormControl, { createOptions } from "./SelectFormControl";
import {
  codeStructureOptions,
  maximumFontSize,
  minimumFontSize,
  parameterHelpOptions,
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
      parameterHelp: createOptions(
        parameterHelpOptions,
        "parameter-help",
        intl,
        {
          shortcut: (isMac ? "Cmd" : "Ctrl") + "+Shift+Space",
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
        id="parameterHelp"
        label={intl.formatMessage({ id: "parameter-help" })}
        options={options.parameterHelp}
        value={settings.parameterHelp}
        onChange={(parameterHelp) =>
          setSettings({
            ...settings,
            parameterHelp,
          })
        }
      />
      <FormControl>
        <Checkbox
          id="V2-features"
          isChecked={settings.warnForApiUnsupportedByDevice}
          onChange={(event) => {
            setSettings({
              ...settings,
              warnForApiUnsupportedByDevice: event.currentTarget.checked,
            });
          }}
        >
          <FormattedMessage id="setting-warn-on-v2-only-features" />
        </Checkbox>
        <FormHelperText color="gray.700">
          <FormattedMessage id="setting-warn-on-v2-only-features-info" />
        </FormHelperText>
      </FormControl>
      <FormControl>
        <Checkbox
          id="allow-editing"
          isChecked={settings.allowEditingThirdPartyModules}
          onChange={(event) => {
            setSettings({
              ...settings,
              allowEditingThirdPartyModules: event.currentTarget.checked,
            });
          }}
        >
          <FormattedMessage id="setting-allow-editing-third-party" />
        </Checkbox>
        <FormHelperText color="gray.700">
          <FormattedMessage id="setting-allow-editing-third-party-info" />
        </FormHelperText>
      </FormControl>
    </VStack>
  );
};

export default SettingsArea;
