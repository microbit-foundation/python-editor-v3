import { Button } from "@chakra-ui/button";
import {
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, VStack } from "@chakra-ui/layout";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ReactNode, useRef, useState } from "react";

export interface InputDialogParameters {
  header: ReactNode;
  body: ReactNode;
  actionLabel: string;
  validate: (input: string) => string | undefined;
}

export interface InputDialogParametersWithActions
  extends InputDialogParameters {
  header: ReactNode;
  body: ReactNode;
  actionLabel: string;
  onConfirm: (validValue: string) => void;
  onCancel: () => void;
}

export interface InputDialogProps extends InputDialogParametersWithActions {
  isOpen: boolean;
}

/**
 * File name input dialog.
 *
 * Generally not used directly. Prefer the useDialogs hook.
 */
export const InputDialog = ({
  header,
  body,
  actionLabel,
  isOpen,
  validate,
  onConfirm,
  onCancel,
}: InputDialogProps) => {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const leastDestructiveRef = useRef<HTMLButtonElement>(null);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) {
      onConfirm(value);
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalOverlay>
        <ModalContent>
          <ModalHeader fontSize="lg" fontWeight="bold">
            {header}
          </ModalHeader>
          <ModalBody>
            <VStack>
              {body}
              <Box as="form" onSubmit={handleSubmit} width="100%">
                <FormControl
                  id="fileName"
                  isRequired
                  isInvalid={Boolean(error)}
                >
                  <FormLabel>Name</FormLabel>
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const value = e.target.value;
                      setValue(value);
                      setError(validate(value));
                    }}
                  ></Input>
                  <FormHelperText>
                    We'll add the <code>.py</code> extension for you.
                  </FormHelperText>
                  <FormErrorMessage>{error}</FormErrorMessage>
                </FormControl>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button ref={leastDestructiveRef} onClick={onCancel}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
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
