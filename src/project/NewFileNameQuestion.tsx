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
import { ReactNode, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { InputDialogBody } from "../common/InputDialog";

interface NewFileNameQuestionProps extends InputDialogBody<string> {}

const NewFileNameQuestion = ({
  error,
  value,
  setError,
  setValue,
  validate,
}: NewFileNameQuestionProps) => {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
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
        <FormattedMessage
          id="new-file-hint"
          values={{
            code: (chunks: ReactNode) => <code>{chunks}</code>,
          }}
        />
      </FormHelperText>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

export default NewFileNameQuestion;
