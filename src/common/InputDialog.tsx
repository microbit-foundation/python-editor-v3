/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalSize,
} from "@microbit/ui";
import { ReactNode, useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
import { styled, VStack } from "styled-system/jsx";
import { FinalFocusRef } from "../project/project-actions";

export interface InputValidationResult {
  ok: boolean;
  message?: string;
}

export interface InputDialogBody<T> {
  value: T;
  setValue: (value: T) => void;
  validationResult: InputValidationResult;
  setValidationResult: (value: InputValidationResult) => void;
  validate: (value: T) => InputValidationResult;
}

type ValueOrCancelled<T> = T | undefined;

export interface InputDialogProps<T> {
  header: ReactNode;
  Body: React.FC<InputDialogBody<T>>;
  initialValue: T;
  actionLabel: string;
  size?: ModalSize;
  validate?: (input: T) => InputValidationResult;
  finalFocusRef?: FinalFocusRef;
  callback: (value: ValueOrCancelled<T>) => void;
}

const noValidation = () => ({ ok: true });

/**
 * General purpose input dialog.
 */
export const InputDialog = <T,>({
  header,
  Body,
  actionLabel,
  initialValue,
  size,
  finalFocusRef = undefined,
  validate = noValidation,
  callback,
}: InputDialogProps<T>) => {
  const [value, setValue] = useState(initialValue);
  const [validationResult, setValidationResult] =
    useState<InputValidationResult>(() => validate(initialValue));
  const onCancel = useCallback(() => callback(undefined), [callback]);
  const submit = useCallback(() => {
    if (validationResult.ok) {
      callback(value);
    }
  }, [validationResult.ok, callback, value]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <Modal isOpen onClose={onCancel} size={size} finalFocusRef={finalFocusRef}>
      <ModalHeader level={2} css={{ fontSize: "lg", fontWeight: "bold" }}>
        {header}
      </ModalHeader>
      <ModalBody>
        <VStack>
          {/* The form gives Enter-to-submit; the footer button calls submit
              directly (it renders outside the form). */}
          <styled.form onSubmit={handleFormSubmit} width="100%">
            <Body
              value={value}
              setValue={setValue}
              validationResult={validationResult}
              setValidationResult={setValidationResult}
              validate={validate}
            />
          </styled.form>
        </VStack>
      </ModalBody>
      <ModalFooter>
        <Button onPress={onCancel}>
          <FormattedMessage id="cancel-action" />
        </Button>
        <Button
          variant="primary"
          onPress={submit}
          isDisabled={!validationResult.ok}
        >
          {actionLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};
