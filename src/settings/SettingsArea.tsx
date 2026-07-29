/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Checkbox, NumberField, Text } from "@microbit/ui";
import { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Box, VStack } from "styled-system/jsx";
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
        css={{ flexDirection: "row", alignItems: "center", width: "100%" }}
        labelCss={{ flex: "1 1 auto", fontWeight: "normal", mb: "0" }}
        groupCss={{ width: "12ch" }}
        inputCss={{ h: "8", fontSize: "sm", borderRadius: "sm", px: "3" }}
      />
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
      <Box>
        <Checkbox
          isSelected={settings.warnForApiUnsupportedByDevice}
          onChange={(warnForApiUnsupportedByDevice) => {
            setSettings({
              ...settings,
              warnForApiUnsupportedByDevice,
            });
          }}
        >
          <FormattedMessage id="setting-warn-on-v2-only-features" />
        </Checkbox>
        <Text mt="2" fontSize="sm" lineHeight="normal" color="gray.700">
          <FormattedMessage id="setting-warn-on-v2-only-features-info" />
        </Text>
      </Box>
      <Box>
        <Checkbox
          isSelected={settings.allowEditingThirdPartyModules}
          onChange={(allowEditingThirdPartyModules) => {
            setSettings({
              ...settings,
              allowEditingThirdPartyModules,
            });
          }}
        >
          <FormattedMessage id="setting-allow-editing-third-party" />
        </Checkbox>
        <Text mt="2" fontSize="sm" lineHeight="normal" color="gray.700">
          <FormattedMessage id="setting-allow-editing-third-party-info" />
        </Text>
      </Box>
    </VStack>
  );
};

export default SettingsArea;
