/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Button } from "@chakra-ui/button";
import { Box, VStack, Text } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ThemeTypings } from "@chakra-ui/styled-system";
import { ReactNode, useCallback, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

export interface InputDialogBody<T> {
  value: T;
  setValue: (value: T) => void;
  error: string | undefined;
  setError: (error: string | undefined) => void;
  validate: (value: T) => string | undefined;
}

type ValueOrCancelled<T> = T | undefined;

export interface InputDialogProps<T> {
  header: ReactNode;
  Body: React.FC<InputDialogBody<T>>;
  initialValue: T;
  actionLabel: string;
  size?: ThemeTypings["components"]["Modal"]["sizes"];
  validate?: (input: T) => string | undefined;
  customFocus?: boolean;
  finalFocusRef?: React.RefObject<HTMLButtonElement>;
  callback: (value: ValueOrCancelled<T>) => void;
}

const noValidation = () => undefined;

/**
 * General purpose input dialog.
 */
export const InputDialog = <T,>({
  header,
  Body,
  actionLabel,
  initialValue,
  size,
  customFocus,
  finalFocusRef = undefined,
  validate = noValidation,
  callback,
}: InputDialogProps<T>) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const onCancel = useCallback(() => callback(undefined), [callback]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) {
      callback(value);
    }
  };

  return (
    <Modal
      isOpen
      onClose={onCancel}
      size={size}
      initialFocusRef={customFocus ? undefined : leastDestructiveRef}
      finalFocusRef={finalFocusRef}
    >
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
                  error={error}
                  setError={setError}
                  validate={validate}
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button ref={leastDestructiveRef} onClick={onCancel}>
              <FormattedMessage id="cancel-action" />
            </Button>
            <Button
              variant="solid"
              onClick={handleSubmit}
              ml={3}
              isDisabled={Boolean(error)}
            >
              {actionLabel}
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
