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
import React, { useCallback } from "react";
import {
  CodeStructureHighlight,
  maximumFontSize,
  minimumFontSize,
  supportedLanguages,
  useSettings,
} from "./settings";
import { FormattedMessage } from "react-intl";
import { stage } from "../environment";

const codeStructureHighlightOptions = (() => {
  const none = { value: "none", label: "None" };
  const brackets = { value: "brackets", label: "Brackets" };
  const boxes = { value: "boxes", label: "Boxes" };
  const lShapes = { value: "l-shapes", label: "L shapes" };
  const lShapeBoxes = { value: "l-shape-boxes", label: "L-shape boxes" };
  // Hold some of these back for now while we discuss options.
  // Once finalised we also need to translate the option labels.
  return stage === "local" || stage === "REVIEW"
    ? [none, brackets, boxes, lShapes, lShapeBoxes]
    : [none, lShapeBoxes];
})();

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
          width="20ch"
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
          width="12ch"
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
          width="20ch"
          value={settings.codeStructureHighlight}
        >
          {codeStructureHighlightOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormControl>
    </VStack>
  );
};

export default SettingsArea;
