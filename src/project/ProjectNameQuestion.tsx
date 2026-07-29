/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { TextField } from "@microbit/ui";
import { useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { InputDialogBody } from "../common/InputDialog";

interface ProjectNameQuestionProps extends InputDialogBody<string> {}

const ProjectNameQuestion = ({
  validationResult,
  value,
  setValidationResult,
  setValue,
  validate,
}: ProjectNameQuestionProps) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.setSelectionRange(0, ref.current.value.length);
    }
  }, []);
  return (
    <TextField
      ref={ref}
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
      helperText={<FormattedMessage id="name-used-when" />}
      helperTextCss={{ color: "gray.700" }}
      errorMessage={validationResult.message}
    />
  );
};

export default ProjectNameQuestion;
