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
import { ReactNode } from "react";

const doNothing = () => {};

export interface ProgressDialogParameters {
  header: ReactNode;
  progress: number | undefined;
}

interface ProgressDialogProps extends ProgressDialogParameters {
  isOpen: boolean;
}

/**
 * A progress dialog used for the flashing process.
 */
const ProgressDialog = ({ header, progress }: ProgressDialogProps) => {
  return (
    <Modal isOpen={progress !== undefined} onClose={doNothing} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{header}</ModalHeader>
        <ModalBody>
          <Progress value={progress! * 100} mb={3} />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProgressDialog;
