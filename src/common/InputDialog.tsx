/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, Text, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ThemeTypings } from "@chakra-ui/styled-system";
import { ReactNode, useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";
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
  size?: ThemeTypings["components"]["Modal"]["sizes"];
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
    useState<InputValidationResult>(validate(initialValue));
  const onCancel = useCallback(() => callback(undefined), [callback]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationResult.ok) {
      callback(value);
    }
  };

  return (
    <Modal isOpen onClose={onCancel} size={size} finalFocusRef={finalFocusRef}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader>
            <Text as="h2" fontSize="lg" fontWeight="bold">
              {header}
            </Text>
          </ModalHeader>
          <ModalBody>
            <VStack>
              <Box as="form" onSubmit={handleSubmit} width="100%">
                <Body
                  value={value}
                  setValue={setValue}
                  validationResult={validationResult}
                  setValidationResult={setValidationResult}
                  validate={validate}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onCancel}>
              <FormattedMessage id="cancel-action" />
            </Button>
            <Button
              variant="solid"
              onClick={handleSubmit}
              ml={3}
              isDisabled={!validationResult.ok}
            >
              {actionLabel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
