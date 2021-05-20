import { Button } from "@chakra-ui/button";
import { Box, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ThemeTypings } from "@chakra-ui/styled-system";
import { ReactNode, useRef, useState } from "react";

export interface InputDialogBody<T> {
  value: T;
  setValue: (value: T) => void;
  error: string | undefined;
  setError: (error: string | undefined) => void;
  validate: (value: T) => string | undefined;
}

export interface InputDialogParameters<T> {
  header: ReactNode;
  Body: React.FC<InputDialogBody<T>>;
  initialValue: T;
  actionLabel: string;
  size?: ThemeTypings["components"]["Modal"]["sizes"];
  validate?: (input: T) => string | undefined;
  customFocus?: boolean;
}

export interface InputDialogParametersWithActions<T>
  extends InputDialogParameters<T> {
  onConfirm: (validValue: T) => void;
  onCancel: () => void;
}

export interface InputDialogProps<T>
  extends InputDialogParametersWithActions<T> {
  isOpen: boolean;
}

const noValidation = () => undefined;

/**
 * General purpose input dialog.
 *
 * Generally not used directly. Prefer the useDialogs hook.
 */
export const InputDialog = <T extends unknown>({
  header,
  Body,
  actionLabel,
  isOpen,
  initialValue,
  size,
  customFocus,
  validate = noValidation,
  onConfirm,
  onCancel,
}: InputDialogProps<T>) => {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>(undefined);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) {
      onConfirm(value);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size={size}
      initialFocusRef={customFocus ? undefined : leastDestructiveRef}
    >
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            {header}
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
              Cancel
            </Button>
            <Button
              colorScheme="blimpPurple"
              onClick={() => onConfirm(value)}
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
