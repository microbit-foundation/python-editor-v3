/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { Progress } from "@chakra-ui/progress";
import { Text, VStack } from "@chakra-ui/react";
import { ReactNode } from "react";

const doNothing = () => {};

export interface ProgressDialogParameters {
  header: ReactNode;
  body?: ReactNode;
  progress: number | undefined;
}

interface ProgressDialogProps extends ProgressDialogParameters {
  isOpen: boolean;
}

/**
 * A progress dialog used for the flashing process.
 */
const ProgressDialog = ({ header, body, progress }: ProgressDialogProps) => {
  return (
    <Modal
      isOpen={progress !== undefined}
      onClose={doNothing}
      isCentered
      size={body ? "xl" : "md"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Text as="h2" fontSize="xl" fontWeight="bold">
            {header}
          </Text>
        </ModalHeader>
        <ModalBody>
          <VStack
            spacing={4}
            mb={3}
            width="100%"
            justifyContent="stretch"
            alignItems="flex-start"
          >
            {body}
            <Progress value={progress! * 100} width="100%" />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProgressDialog;
