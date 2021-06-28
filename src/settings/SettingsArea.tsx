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
import React, { useCallback } from "react";
import {
  CodeStructureHighlight,
  maximumFontSize,
  minimumFontSize,
  supportedLanguages,
  useSettings,
} from "./settings";
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
  const handleChangeCodeStructureHighlight = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSettings({
        ...settings,
        codeStructureHighlight: e.currentTarget.value as CodeStructureHighlight,
      });
    },
    [settings, setSettings]
  );
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
          value={settings.languageId}
          maxWidth="16ch"
        >
          {supportedLanguages.map((language) => (
            <option key={language.id} value={language.id}>
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
          htmlFor="language"
          mb="0"
          fontWeight="normal"
          flex="1 1 auto"
        >
          <FormattedMessage id="highlight-structure" />
        </FormLabel>
        <Select
          id="language"
          variant="outline"
          onChange={handleChangeCodeStructureHighlight}
          maxWidth="16ch"
          value={settings.codeStructureHighlight}
        >
          {/* TODO: translate? */}
          <option key="none" value="none">
            None
          </option>
          <option key="brackets" value="brackets">
            Brackets
          </option>
          <option key="boxes" value="boxes">
            Boxes
          </option>
          <option key="l-shapes" value="l-shapes">
            L-shapes
          </option>
          <option key="l-shape-boxes" value="l-shape-boxes">
            L-shape boxes
          </option>
        </Select>
      </FormControl>
    </VStack>
  );
};

export default SettingsArea;
