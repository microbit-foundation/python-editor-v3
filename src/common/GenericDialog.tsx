/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/modal";
import { ThemeTypings } from "@chakra-ui/styled-system";
import { ReactNode } from "react";
import ModalCloseButton from "./ModalCloseButton";

export interface GenericDialogProps {
  header?: ReactNode;
  body: ReactNode;
  footer: ReactNode;
  size?: ThemeTypings["components"]["Modal"]["sizes"];
  onClose: () => void;
}

export const GenericDialog = ({
  header,
  body,
  footer,
  size,
  onClose,
}: GenericDialogProps) => {
  return (
    <Modal isOpen onClose={onClose} size={size}>
      <ModalOverlay>
        <ModalContent minWidth="560px" my="auto">
          <ModalCloseButton />
          {header && (
            <ModalHeader fontSize="lg" fontWeight="bold">
              {header}
            </ModalHeader>
          )}
          <ModalBody>{body}</ModalBody>
          <ModalFooter>{footer}</ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};
