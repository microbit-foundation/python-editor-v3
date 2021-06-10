import {
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  FormControl,
  FormLabel,
  Select,
} from "@chakra-ui/react";
import { maximumFontSize, minimumFontSize, useSettings } from "./settings";
import React, { useCallback } from "react";
import config from "../config";
import { FormattedMessage } from "react-intl";

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
  const handleChangeHighlightCodeStructure = useCallback(() => {
    setSettings({
      ...settings,
      highlightCodeStructure: !settings.highlightCodeStructure,
    });
  }, [settings, setSettings]);
  const handleChangeLanguage = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSettings({
        ...settings,
        languageId: e.target.value,
      });
    },
    [settings, setSettings]
  );

  return (
    <VStack alignItems="flex-start" padding={3} spacing={5}>
      <FormControl display="flex" alignItems="center">
        <FormLabel
          htmlFor="language"
          mb="0"
          fontWeight="normal"
          flex="1 1 auto"
        >
          <FormattedMessage id="language" />
        </FormLabel>
        <Select
          id="language"
          variant="outline"
          onChange={handleChangeLanguage}
          maxWidth="16ch"
        >
          {config.supportedLanguages.map((language) => (
            <option
              key={language.id}
              value={language.id}
              selected={language.id === settings.languageId}
            >
              {language.name}
            </option>
          ))}
        </Select>
      </FormControl>
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
          width="8ch"
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>
      <FormControl display="flex" alignItems="center">
        <FormLabel
          htmlFor="highlight-code-structure"
          mb="0"
          fontWeight="normal"
          flex="1 1 auto"
        >
          <FormattedMessage id="highlight-structure" />
        </FormLabel>
        <Switch
          id="highlight-code-structure"
          isChecked={settings.highlightCodeStructure}
          onChange={handleChangeHighlightCodeStructure}
        />
      </FormControl>
    </VStack>
  );
};

export default SettingsArea;
