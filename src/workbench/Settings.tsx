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
import {
  maximumFontSize,
  minimumFontSize,
  useSettings,
  supportedLanguages,
} from "../settings";
import React, { useCallback } from "react";

const Settings = () => {
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
          htmlFor="font-size"
          mb="0"
          fontWeight="normal"
          flex="1 1 auto"
        >
          Language
        </FormLabel>
        <Select variant="outline" onChange={handleChangeLanguage} maxWidth="16ch">
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
          Font size
        </FormLabel>
        <NumberInput
          size="sm"
          value={settings.fontSize}
          min={minimumFontSize}
          max={maximumFontSize}
          onChange={handleChangeFontSize}
          width="8ch"
        >
          <NumberInputField id="font-size" />
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
          Highlight code structure
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

export default Settings;
