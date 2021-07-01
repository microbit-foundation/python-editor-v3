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
  error,
  value,
  setError,
  setValue,
  validate,
}: ProjectNameQuestionProps) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.setSelectionRange(0, ref.current.value.length);
    }
  }, []);
  return (
    <FormControl id="fileName" isRequired isInvalid={Boolean(error)}>
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
          setError(validate(value));
        }}
      ></Input>
      <FormHelperText color="gray.700">
        <FormattedMessage id="name-used-when" />
      </FormHelperText>
      <FormErrorMessage>
        <FormattedMessage id={error} />
      </FormErrorMessage>
    </FormControl>
  );
};

export default ProjectNameQuestion;
