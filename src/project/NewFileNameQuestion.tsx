/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Text } from "@chakra-ui/react";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import { InputDialogBody } from "../common/InputDialog";

interface NewFileNameQuestionProps extends InputDialogBody<string> {}

const NewFileNameQuestion = ({
  validationResult,
  value,
  setValidationResult,
  setValue,
  validate,
}: NewFileNameQuestionProps) => {
  return (
    <FormControl id="fileName" isRequired isInvalid={!validationResult.ok}>
      <FormLabel>
        <FormattedMessage id="name-text" />
      </FormLabel>
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
          setValidationResult(validate(value));
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
      ></Input>
      <FormHelperText color="gray.700">
        <FormattedMessage
          id="new-file-hint"
          values={{
            code: (chunks: ReactNode) => <code>{chunks}</code>,
          }}
        />
      </FormHelperText>
      {validationResult.message && !validationResult.ok && (
        <FormErrorMessage>{validationResult.message}</FormErrorMessage>
      )}
      {validationResult.message && validationResult.ok && (
        // FormErrorMessage does not display when the field is valid so we need
        // an equivalent for warning feedback.
        <Text
          id="fileName-feedback"
          aria-live="polite"
          fontSize="sm"
          color="red.500"
          lineHeight="normal"
          mt={2}
        >
          {validationResult.message}
        </Text>
      )}
    </FormControl>
  );
};

export default NewFileNameQuestion;
