/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text, TextField } from "@microbit/ui";
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
    <>
      <TextField
        // Focus the field on open: react-aria focuses the dialog
        // itself by default, unlike Chakra (dialog name is still
        // announced via aria-labelledby).
        autoFocus
        isRequired
        isInvalid={!validationResult.ok}
        label={<FormattedMessage id="name-text" />}
        value={value}
        onChange={(value) => {
          setValue(value);
          setValidationResult(validate(value));
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        helperText={
          <FormattedMessage
            id="new-file-hint"
            values={{
              code: (chunks: ReactNode) => <code>{chunks}</code>,
            }}
          />
        }
        helperTextCss={{ color: "gray.700" }}
        errorMessage={validationResult.message}
      />
      {validationResult.message && validationResult.ok && (
        // The error slot does not display when the field is valid so we need
        // an equivalent for warning feedback.
        <Text
          id="fileName-feedback"
          aria-live="polite"
          fontSize="sm"
          color="red.500"
          lineHeight="normal"
          mt="2"
        >
          {validationResult.message}
        </Text>
      )}
    </>
  );
};

export default NewFileNameQuestion;
