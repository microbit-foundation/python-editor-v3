/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Checkbox, NativeSelectField, NumberField } from "@microbit/ui";
import { ReactNode, useCallback, useMemo } from "react";
import { FormattedMessage, IntlShape, useIntl } from "react-intl";
import { VStack } from "styled-system/jsx";
import {
  CodeStructureOption,
  codeStructureOptions,
  maximumFontSize,
  minimumFontSize,
  ParameterHelpOption,
  parameterHelpOptions,
  useSettings,
} from "./settings";

/**
 * Translated <option>s for a settings select.
 *
 * @param values Values to create options for.
 * @param prefix Prefix (no trailing '-') to use for translation keys.
 * @param intl For translation strings.
 */
const createOptions = (
  values: readonly string[],
  prefix: string,
  intl: IntlShape,
  intlValues?: Record<string, string>
): ReactNode =>
  values.map((value) => (
    <option key={value} value={value}>
      {intl.formatMessage({ id: `${prefix}-${value}` }, intlValues)}
    </option>
  ));

/**
 * The settings area.
 *
 * Aim is to keep settings to a minimum.
 */
const SettingsArea = () => {
  const [settings, setSettings] = useSettings();
  const intl = useIntl();

  const handleChangeFontSize = useCallback(
    (valueAsNumber: number) => {
      if (Number.isNaN(valueAsNumber)) {
        return;
      }
      // react-aria clamps to min/maxValue on commit.
      setSettings({
        ...settings,
        fontSize: valueAsNumber,
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
    <VStack alignItems="flex-start" gap="5">
      <NumberField
        label={<FormattedMessage id="font-size" />}
        value={settings.fontSize}
        minValue={minimumFontSize}
        maxValue={maximumFontSize}
        onChange={handleChangeFontSize}
        labelPosition="side"
        groupCss={{ width: "12ch" }}
      />
      <NativeSelectField
        id="codeStructureHighlight"
        label={intl.formatMessage({ id: "highlight-code-structure" })}
        labelPosition="side"
        wrapperCss={{ width: "28ch" }}
        value={settings.codeStructureHighlight}
        onChange={(e) =>
          setSettings({
            ...settings,
            codeStructureHighlight: e.currentTarget
              .value as CodeStructureOption,
          })
        }
      >
        {options.codeStructure}
      </NativeSelectField>
      <NativeSelectField
        id="parameterHelp"
        label={intl.formatMessage({ id: "parameter-help" })}
        labelPosition="side"
        wrapperCss={{ width: "28ch" }}
        value={settings.parameterHelp}
        onChange={(e) =>
          setSettings({
            ...settings,
            parameterHelp: e.currentTarget.value as ParameterHelpOption,
          })
        }
      >
        {options.parameterHelp}
      </NativeSelectField>
      <Checkbox
        isSelected={settings.warnForApiUnsupportedByDevice}
        onChange={(warnForApiUnsupportedByDevice) => {
          setSettings({
            ...settings,
            warnForApiUnsupportedByDevice,
          });
        }}
        helperText={
          <FormattedMessage id="setting-warn-on-v2-only-features-info" />
        }
      >
        <FormattedMessage id="setting-warn-on-v2-only-features" />
      </Checkbox>
      <Checkbox
        isSelected={settings.allowEditingThirdPartyModules}
        onChange={(allowEditingThirdPartyModules) => {
          setSettings({
            ...settings,
            allowEditingThirdPartyModules,
          });
        }}
        helperText={
          <FormattedMessage id="setting-allow-editing-third-party-info" />
        }
      >
        <FormattedMessage id="setting-allow-editing-third-party" />
      </Checkbox>
    </VStack>
  );
};

export default SettingsArea;
