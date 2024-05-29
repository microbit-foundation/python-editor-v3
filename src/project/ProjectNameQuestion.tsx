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
    <FormControl id="fileName" isRequired isInvalid={!validationResult.ok}>
      <FormLabel>
        <FormattedMessage id="name-text" />
      </FormLabel>
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => {
          const value = e.target.value;
          setValue(value);
          setValidationResult(validate(value));
        }}
      ></Input>
      <FormHelperText color="gray.700">
        <FormattedMessage id="name-used-when" />
      </FormHelperText>
      <FormErrorMessage>{validationResult.message}</FormErrorMessage>
    </FormControl>
  );
};

export default ProjectNameQuestion;
